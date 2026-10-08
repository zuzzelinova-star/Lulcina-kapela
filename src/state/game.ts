import { LADDER } from '../content/ladder'
import { REWARDS } from '../content/money'
import { SHOP } from '../content/shop'
import { indexLadder, type LadderIndex } from '../engine/items'
import { applyOutcome, MASTERED_LEVEL, updateUnlocks, type ItemStates } from '../engine/mastery'
import {
  applyPlacement,
  PLACEMENT_LEVEL,
  placementQuestion,
  recordPlacement,
  startPlacement,
  type PlacementProgress,
} from '../engine/placement'
import { mulberry32 } from '../engine/rng'
import { canBuy, earnings } from '../engine/money'
import { buildConcert, buildSetlist, fillerTask, insertRetry, retryTask } from '../engine/setlist'
import type { Fact, ItemResult, Task } from '../engine/types'

export const LADDER_INDEX: LadderIndex = indexLadder(LADDER)

export interface RoundState {
  tasks: Task[]
  /** Index aktuálnej úlohy. */
  index: number
  /** Položky, ktoré sa už v tomto kole raz vrátili po chybe. */
  retried: string[]
  startedDay: string
  /** Setlist (s opakovaním po chybe) alebo koncert (len osvojené príklady, bez opakovania). */
  kind: 'setlist' | 'concert'
  /** Koľko Lulu v tomto kole zarobila (v centoch). */
  earned: number
}

export interface PlacementState {
  progress: PlacementProgress
  question: { itemId: string; fact: Fact } | null
}

export interface Settings {
  sound: boolean
  speech: boolean
}

export interface GameState {
  version: 3
  nickname: string
  placementDone: boolean
  placement: PlacementState | null
  unlockedUpTo: number
  items: ItemStates
  round: RoundState | null
  roundsCompleted: number
  daysPlayed: string[]
  /** Zručnosti osvojené od poslednej oslavy (id) – ukáže sa „nový koncert“. */
  celebrate: string[]
  /** Peniaze v centoch. Chybou sa nedajú stratiť. */
  money: number
  /** Kúpené veci (id z obchodu). */
  owned: string[]
  /** Posledné kúpené občerstvenie – kapela ho má na pódiu v ten deň. */
  snack: { id: string; day: string } | null
  settings: Settings
}

export function initialState(): GameState {
  return {
    version: 3,
    nickname: 'Lulu',
    placementDone: false,
    placement: null,
    unlockedUpTo: 1,
    items: {},
    round: null,
    roundsCompleted: 0,
    daysPlayed: [],
    celebrate: [],
    money: 0,
    owned: [],
    snack: null,
    settings: { sound: true, speech: true },
  }
}

export type Action =
  | { type: 'placementStart'; seed: number }
  | { type: 'placementAnswer'; correct: boolean; today: string; now: number; seed: number }
  | { type: 'placementFinish' }
  | { type: 'roundStart'; today: string; seed: number }
  | { type: 'taskDone'; results: ItemResult[]; today: string; now: number; seed: number }
  | { type: 'concertStart'; today: string; seed: number }
  | { type: 'buy'; itemId: string; today: string }
  | { type: 'roundClose' }
  | { type: 'celebrationSeen' }
  | { type: 'reset' }

export function reducer(state: GameState, action: Action): GameState {
  const index = LADDER_INDEX
  switch (action.type) {
    case 'placementStart': {
      const progress = startPlacement(index)
      return { ...state, placement: { progress, question: placementQuestion(index, progress, mulberry32(action.seed)) } }
    }

    case 'placementAnswer': {
      const pl = state.placement
      if (!pl?.question) return state
      const progress = recordPlacement(index, pl.progress, pl.question.itemId, action.correct)
      if (!progress.done) {
        return { ...state, placement: { progress, question: placementQuestion(index, progress, mulberry32(action.seed)) } }
      }
      const placed = applyPlacement(index, state.items, progress.passedUpTo, action.now)
      return {
        ...state,
        items: placed.items,
        unlockedUpTo: placed.unlockedUpTo,
        placementDone: true,
        placement: { progress, question: null },
        daysPlayed: addDay(state.daysPlayed, action.today),
      }
    }

    case 'placementFinish':
      return { ...state, placement: null, placementDone: true }

    case 'roundStart': {
      if (state.round && state.round.index < state.round.tasks.length) return state
      const tasks = buildSetlist({
        index,
        items: state.items,
        unlockedUpTo: state.unlockedUpTo,
        today: action.today,
        rng: mulberry32(action.seed),
      })
      return {
        ...state,
        round: { tasks, index: 0, retried: [], startedDay: action.today, kind: 'setlist', earned: 0 },
        daysPlayed: addDay(state.daysPlayed, action.today),
      }
    }

    case 'taskDone': {
      const round = state.round
      if (!round || round.index >= round.tasks.length) return state
      const rng = mulberry32(action.seed)
      const items = { ...state.items }
      let tasks = round.tasks
      const retried = [...round.retried]
      const current = tasks[round.index]

      const concert = round.kind === 'concert'
      for (const r of action.results) {
        items[r.itemId] = applyOutcome(items[r.itemId], r.outcome, action.today, r.ms, action.now)
        if (!concert && r.outcome !== 'correct' && !retried.includes(r.itemId)) {
          retried.push(r.itemId)
          const retry = retryTask(index, r.itemId, current.activity, rng)
          tasks = insertRetry(tasks, round.index, retry, rng, fillerTask(index, r.itemId, rng))
        }
      }

      const unlocks = updateUnlocks(index, state.unlockedUpTo, items)
      const nextIndex = round.index + 1
      const finished = nextIndex >= tasks.length
      const earned =
        (concert ? action.results.filter((r) => r.outcome !== 'wrong').length * REWARDS.concertCorrect : earnings(action.results)) +
        (finished ? (concert ? REWARDS.concertBonus : REWARDS.setlistBonus) : 0)
      return {
        ...state,
        items,
        money: state.money + earned,
        unlockedUpTo: unlocks.unlockedUpTo,
        celebrate: [...state.celebrate, ...unlocks.newlyMastered.map((s) => s.id)],
        round: { ...round, tasks, retried, index: nextIndex, earned: round.earned + earned },
        roundsCompleted: state.roundsCompleted + (finished && !concert ? 1 : 0),
        daysPlayed: addDay(state.daysPlayed, action.today),
      }
    }

    case 'concertStart': {
      if (state.round && state.round.index < state.round.tasks.length) return state
      const tasks = buildConcert({
        index,
        items: state.items,
        unlockedUpTo: state.unlockedUpTo,
        today: action.today,
        rng: mulberry32(action.seed),
      })
      if (tasks.length === 0) return state
      return {
        ...state,
        round: { tasks, index: 0, retried: [], startedDay: action.today, kind: 'concert', earned: 0 },
        daysPlayed: addDay(state.daysPlayed, action.today),
      }
    }

    case 'buy': {
      const item = SHOP.find((i) => i.id === action.itemId)
      if (!item || !canBuy(item, state.owned, state.money)) return state
      return {
        ...state,
        money: state.money - item.price,
        owned: item.repeatable || state.owned.includes(item.id) ? state.owned : [...state.owned, item.id],
        snack: item.category === 'obcerstvenie' ? { id: item.id, day: action.today } : state.snack,
      }
    }

    case 'roundClose':
      return { ...state, round: null }

    case 'celebrationSeen':
      return { ...state, celebrate: [] }

    case 'reset':
      return initialState()
  }
}

function addDay(days: string[], today: string): string[] {
  return days.includes(today) ? days : [...days, today]
}

/**
 * Verzia 1 → 3: konkurz predtým označil zvládnuté zručnosti za osvojené a preskočil ich.
 * Také položky (úroveň 3+, ale ani jeden pokus) dostanú len náskok a hra začne od základov.
 * Skutočne odohrané odpovede ostávajú.
 */
export function migrate(raw: Record<string, unknown>): GameState {
  const fresh = initialState()
  const base: GameState = {
    ...fresh,
    ...(Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined)) as Partial<GameState>),
    settings: { ...fresh.settings, ...((raw.settings as Partial<Settings> | undefined) ?? {}) },
  }
  // Rozohrané kolo zo starších verzií nemá druh ani zárobok.
  if (base.round) base.round = { ...base.round, kind: base.round.kind ?? 'setlist', earned: base.round.earned ?? 0 }
  if (raw.version === 1) {
    const items: ItemStates = {}
    for (const [id, st] of Object.entries(base.items)) {
      items[id] =
        st.attempts === 0 && st.level >= MASTERED_LEVEL
          ? { ...st, level: PLACEMENT_LEVEL, nextDue: null, reviewStep: 0, lastChangeDay: null }
          : st
    }
    const unlocked = updateUnlocks(LADDER_INDEX, LADDER_INDEX.skills[0].order, items)
    return { ...base, version: 3, items, unlockedUpTo: unlocked.unlockedUpTo, round: null, celebrate: [] }
  }
  return { ...base, version: 3 }
}
