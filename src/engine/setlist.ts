import { ENABLED_ACTIVITIES, pairKey, pairLeft, supports } from './activities'
import { isDue } from './dates'
import { instantiate, type LadderIndex } from './items'
import { currentSkill, dueReviewItems, type ItemStates } from './mastery'
import { shuffle, type Rng } from './rng'
import type { ActivityId, ItemDef, Task } from './types'

export const DEFAULT_SETLIST_SIZE = 13
/** Podiel úloh na opakovanie starších zručností. */
export const REVIEW_SHARE = 0.3
/** Najviac toľko úloh rovnakého typu za sebou. */
export const MAX_RUN = 3
const KAMARATI_MIN = 3
const KAMARATI_MAX = 4
const KAMARATI_PER_ROUND = 2

export interface BuildInput {
  index: LadderIndex
  items: ItemStates
  unlockedUpTo: number
  today: string
  rng: Rng
  size?: number
  enabled?: ActivityId[]
}

let taskCounter = 0
function taskId(): string {
  taskCounter = (taskCounter + 1) % 1e6
  return `t${Date.now().toString(36)}${taskCounter.toString(36)}`
}

/** Aktivity, v ktorých sa dá položka precvičiť. */
export function activitiesFor(index: LadderIndex, item: ItemDef, enabled: ActivityId[], rng: Rng): ActivityId[] {
  const skill = index.skillById.get(item.skillId)
  if (!skill) return []
  const fact = instantiate(item, rng)
  return skill.activities.filter((a) => enabled.includes(a) && supports(a, fact) && (a !== 'kamarati' || item.fact))
}

function singleTask(item: ItemDef, activity: ActivityId, rng: Rng, retry = false): Task {
  return { id: taskId(), activity, itemIds: [item.id], facts: [instantiate(item, rng)], ...(retry ? { retry } : {}) }
}

/** Vyberie aktivitu, ktorá sa zatiaľ použila najmenej (aby sa striedali). */
function leastUsed(options: ActivityId[], used: Map<ActivityId, number>, rng: Rng): ActivityId {
  const shuffled = shuffle(rng, options)
  return shuffled.reduce((best, a) => ((used.get(a) ?? 0) < (used.get(best) ?? 0) ? a : best), shuffled[0])
}

/**
 * Poradie položiek aktuálnej zručnosti: najprv tie, čo dnes ešte môžu stúpnuť
 * (od najnižšej úrovne), potom ostatné.
 */
export function currentQueue(index: LadderIndex, skillId: string, items: ItemStates, today: string, rng: Rng): ItemDef[] {
  const list = shuffle(rng, index.itemsBySkill.get(skillId) ?? [])
  const canRise = (it: ItemDef) => {
    const st = items[it.id]
    return st === undefined || (st.lastChangeDay !== today && isDue(st.nextDue, today))
  }
  const level = (it: ItemDef) => items[it.id]?.level ?? 0
  const first = list.filter(canRise).sort((a, b) => level(a) - level(b))
  const rest = list.filter((it) => !canRise(it)).sort((a, b) => level(a) - level(b))
  return [...first, ...rest]
}

/** Zostaví setlist: asi 60–70 % aktuálna zručnosť, asi 30 % opakovanie starších. */
export function buildSetlist(input: BuildInput): Task[] {
  const { index, items, unlockedUpTo, today, rng } = input
  const size = input.size ?? DEFAULT_SETLIST_SIZE
  const enabled = input.enabled ?? ENABLED_ACTIVITIES
  const used = new Map<ActivityId, number>()
  const bump = (a: ActivityId) => used.set(a, (used.get(a) ?? 0) + 1)
  const tasks: Task[] = []

  const current = currentSkill(index, unlockedUpTo, items)

  // Opakovanie starších zručností.
  const reviewIds = dueReviewItems(index, unlockedUpTo, items, today, current.id)
  const reviewSlots = Math.min(reviewIds.length, Math.round(size * REVIEW_SHARE))
  for (const id of reviewIds.slice(0, reviewSlots)) {
    const item = index.items.get(id)!
    const options = activitiesFor(index, item, enabled, rng).filter((a) => a !== 'kamarati')
    if (options.length === 0) continue
    const activity = leastUsed(options, used, rng)
    bump(activity)
    tasks.push(singleTask(item, activity, rng))
  }

  // Aktuálna zručnosť.
  const baseQueue = currentQueue(index, current.id, items, today, rng)
  let queue = [...baseQueue]
  let kamaratiCount = 0
  while (tasks.length < size && baseQueue.length > 0) {
    if (queue.length === 0) queue = shuffle(rng, baseQueue)
    const item = queue[0]
    const options = activitiesFor(index, item, enabled, rng)

    if (options.includes('kamarati') && kamaratiCount < KAMARATI_PER_ROUND) {
      const group = kamaratiGroup(item, queue, rng)
      // Kamarátov dávame, keď sa dá zostaviť skupina, a nie vždy, aby sa striedali s ostatnými.
      if (group && (used.get('kamarati') ?? 0) <= Math.min(...options.map((a) => used.get(a) ?? 0))) {
        tasks.push({ id: taskId(), activity: 'kamarati', itemIds: group.map((g) => g.id), facts: group.map((g) => g.fact!) })
        bump('kamarati')
        kamaratiCount++
        const ids = new Set(group.map((g) => g.id))
        queue = queue.filter((q) => !ids.has(q.id))
        continue
      }
    }
    const single = options.filter((a) => a !== 'kamarati')
    queue.shift()
    if (single.length === 0) continue
    const activity = leastUsed(single, used, rng)
    bump(activity)
    tasks.push(singleTask(item, activity, rng))
  }

  return arrange(tasks, rng)
}

/** Skupina 3–4 položiek s rovnakým súčtom (prvá je `item`) alebo null. */
function kamaratiGroup(item: ItemDef, queue: ItemDef[], rng: Rng): ItemDef[] | null {
  if (!item.fact) return null
  const key = pairKey(item.fact)
  if (key === null) return null
  const lefts = new Set([pairLeft(item.fact)])
  const group = [item]
  for (const other of shuffle(rng, queue.slice(1, 16))) {
    if (group.length >= KAMARATI_MAX) break
    if (!other.fact || pairKey(other.fact) !== key || other.fact.kind !== item.fact.kind) continue
    const left = pairLeft(other.fact)
    // Ľavé noty musia byť rôzne a žiadna ľavá nota nesmie byť zároveň pravou inej dvojice v skupine,
    // inak by sa dali spojiť dvoma spôsobmi a bolo by to mätúce.
    if (lefts.has(left) || lefts.has(key - left)) continue
    lefts.add(left)
    group.push(other)
  }
  return group.length >= KAMARATI_MIN ? group : null
}

function sharesItem(a: Task, b: Task): boolean {
  return a.itemIds.some((id) => b.itemIds.includes(id))
}

/** Počet porušení pravidiel: viac ako MAX_RUN rovnakých typov za sebou a rovnaká položka dvakrát po sebe. */
export function sequenceViolations(tasks: Task[]): number {
  let violations = 0
  let run = 1
  for (let i = 1; i < tasks.length; i++) {
    if (sharesItem(tasks[i - 1], tasks[i])) violations++
    run = tasks[i].activity === tasks[i - 1].activity ? run + 1 : 1
    if (run > MAX_RUN) violations++
  }
  return violations
}

function fits(seq: Task[], t: Task): boolean {
  const last = seq[seq.length - 1]
  if (!last) return true
  if (sharesItem(last, t)) return false
  let run = 1
  for (let i = seq.length - 1; i >= 0 && seq[i].activity === t.activity; i--) run++
  return run <= MAX_RUN
}

/**
 * Usporiada úlohy tak, aby neboli viac ako 3 rovnakého typu za sebou
 * a rovnaká položka dvakrát po sebe. Ak sa to nedá (napr. je k dispozícii len jedna aktivita),
 * vráti poradie s najmenším počtom porušení.
 */
export function arrange(tasks: Task[], rng: Rng): Task[] {
  let best: Task[] = tasks
  let bestScore = Infinity
  for (let attempt = 0; attempt < 40; attempt++) {
    const remaining = shuffle(rng, tasks)
    const seq: Task[] = []
    while (remaining.length > 0) {
      const counts = new Map<ActivityId, number>()
      for (const t of remaining) counts.set(t.activity, (counts.get(t.activity) ?? 0) + 1)
      const valid = remaining.filter((t) => fits(seq, t))
      if (valid.length === 0) break
      // Najprv typ, ktorého zostáva najviac – tak sa najľahšie vyhneme dlhým radom na konci.
      const max = Math.max(...valid.map((t) => counts.get(t.activity)!))
      const top = valid.filter((t) => counts.get(t.activity) === max)
      const chosen = top[Math.floor(rng() * top.length)]
      seq.push(chosen)
      remaining.splice(remaining.indexOf(chosen), 1)
    }
    const full = [...seq, ...remaining]
    const score = sequenceViolations(full)
    if (score < bestScore) {
      best = full
      bestScore = score
    }
    if (score === 0) break
  }
  return best
}

/**
 * Po chybe vráti položku ešte raz v tom istom kole – najskôr o dve úlohy neskôr.
 * Ak už za aktuálnou úlohou nič nie je, pridá pred opakovanie výplň (`filler`),
 * aby rovnaký príklad nešiel hneď po sebe.
 */
export function insertRetry(tasks: Task[], currentIndex: number, retry: Task, rng: Rng, filler?: Task): Task[] {
  const earliest = currentIndex + 2
  const baseline = sequenceViolations(tasks)
  const candidates: number[] = []
  for (let p = earliest; p <= tasks.length; p++) {
    const next = [...tasks.slice(0, p), retry, ...tasks.slice(p)]
    if (sequenceViolations(next) <= baseline) candidates.push(p)
  }
  if (candidates.length > 0) {
    const near = candidates.filter((p) => p <= earliest + 2)
    const pool = near.length > 0 ? near : candidates
    const p = pool[Math.floor(rng() * pool.length)]
    return [...tasks.slice(0, p), retry, ...tasks.slice(p)]
  }
  if (earliest > tasks.length && filler) {
    return [...tasks, filler, retry]
  }
  return [...tasks, retry]
}

/** Jednopoložková úloha na zopakovanie – podľa možnosti v inej aktivite, než bola chyba. */
export function retryTask(index: LadderIndex, itemId: string, previous: ActivityId, rng: Rng, enabled = ENABLED_ACTIVITIES): Task {
  const item = index.items.get(itemId)!
  const options = activitiesFor(index, item, enabled, rng).filter((a) => a !== 'kamarati')
  const other = options.filter((a) => a !== previous)
  const pool = other.length > 0 ? other : options.length > 0 ? options : (['skusobna'] as ActivityId[])
  const activity = pool[Math.floor(rng() * pool.length)]
  return singleTask(item, activity, rng, true)
}

/** Výplň pred opakovaním na konci kola: iná položka tej istej zručnosti. */
export function fillerTask(index: LadderIndex, avoidItemId: string, rng: Rng, enabled = ENABLED_ACTIVITIES): Task | undefined {
  const item = index.items.get(avoidItemId)
  if (!item) return undefined
  const others = (index.itemsBySkill.get(item.skillId) ?? []).filter((it) => it.id !== avoidItemId)
  if (others.length === 0) return undefined
  const other = others[Math.floor(rng() * others.length)]
  const options = activitiesFor(index, other, enabled, rng).filter((a) => a !== 'kamarati')
  return singleTask(other, options[0] ?? 'skusobna', rng, true)
}
