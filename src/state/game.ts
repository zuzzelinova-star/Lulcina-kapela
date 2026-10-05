import { LADDER } from '../content/ladder'
import { indexLadder, type LadderIndex } from '../engine/items'
import { applyOutcome, updateUnlocks, type ItemStates } from '../engine/mastery'
import {
  applyPlacement,
  placementQuestion,
  recordPlacement,
  startPlacement,
  type PlacementProgress,
} from '../engine/placement'
import { mulberry32 } from '../engine/rng'
import { buildSetlist, fillerTask, insertRetry, retryTask } from '../engine/setlist'
import type { Fact, ItemResult, Task } from '../engine/types'

export const LADDER_INDEX: LadderIndex = indexLadder(LADDER)

export interface RoundState {
  tasks: Task[]
  /** Index aktuálnej úlohy. */
  index: number
  /** Položky, ktoré sa už v tomto kole raz vrátili po chybe. */
  retried: string[]
  startedDay: string
}

export interface PlacementState {
  progress: PlacementProgress
  question: { itemId: string; fact: Fact } | null
}

export interface GameState {
  version: 1
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
}

export function initialState(): GameState {
  return {
    version: 1,
    nickname: 'Lulu',
    placementDone: false,
    placement: null,
    unlockedUpTo: 1,
    items: {},
    round: null,
    roundsCompleted: 0,
    daysPlayed: [],
    celebrate: [],
  }
}

export type Action =
  | { type: 'placementStart'; seed: number }
  | { type: 'placementAnswer'; correct: boolean; today: string; now: number; seed: number }
  | { type: 'placementFinish' }
  | { type: 'roundStart'; today: string; seed: number }
  | { type: 'taskDone'; results: ItemResult[]; today: string; now: number; seed: number }
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
      const placed = applyPlacement(index, state.items, progress.passedUpTo, action.today, action.now)
      return {
        ...state,
        items: placed.items,
        unlockedUpTo: Math.max(state.unlockedUpTo, placed.unlockedUpTo),
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
        round: { tasks, index: 0, retried: [], startedDay: action.today },
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

      for (const r of action.results) {
        items[r.itemId] = applyOutcome(items[r.itemId], r.outcome, action.today, r.ms, action.now)
        if (r.outcome !== 'correct' && !retried.includes(r.itemId)) {
          retried.push(r.itemId)
          const retry = retryTask(index, r.itemId, current.activity, rng)
          tasks = insertRetry(tasks, round.index, retry, rng, fillerTask(index, r.itemId, rng))
        }
      }

      const unlocks = updateUnlocks(index, state.unlockedUpTo, items)
      const nextIndex = round.index + 1
      const finished = nextIndex >= tasks.length
      return {
        ...state,
        items,
        unlockedUpTo: unlocks.unlockedUpTo,
        celebrate: [...state.celebrate, ...unlocks.newlyMastered.map((s) => s.id)],
        round: { ...round, tasks, retried, index: nextIndex },
        roundsCompleted: state.roundsCompleted + (finished ? 1 : 0),
        daysPlayed: addDay(state.daysPlayed, action.today),
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
