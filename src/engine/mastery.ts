import { addDays, isDue } from './dates'
import type { LadderIndex } from './items'
import type { ItemState, Outcome, SkillDef } from './types'

export const MAX_LEVEL = 4
/** Od tejto úrovne sa položka počíta ako osvojená. */
export const MASTERED_LEVEL = 3
/** Podiel položiek na úrovni MASTERED_LEVEL+, ktorý znamená osvojenú zručnosť. */
export const SKILL_MASTERY_RATIO = 0.9
/** Opakovanie osvojených položiek po 1, 3, 7 a 14 dňoch. */
export const REVIEW_INTERVALS = [1, 3, 7, 14]
/** Koľko posledných časov odpovede si pamätáme. */
export const KEEP_TIMES = 10

export function newItemState(): ItemState {
  return {
    level: 0,
    lastAttempt: null,
    nextDue: null,
    attempts: 0,
    lastChangeDay: null,
    reviewStep: 0,
    times: [],
    updatedAt: 0,
  }
}

/**
 * Zapíše jeden pokus o položku.
 * - Správne bez nápovede: o úroveň vyššie, ale najviac raz za deň
 *   a nie v deň, keď už úroveň klesla.
 * - Nápoveda alebo chyba: o úroveň nižšie, opakovanie sa začína odznova.
 */
export function applyOutcome(
  prev: ItemState | undefined,
  outcome: Outcome,
  today: string,
  ms: number,
  now: number,
): ItemState {
  const s = prev ?? newItemState()
  const times = [...s.times, Math.round(ms)].slice(-KEEP_TIMES)
  const base = { ...s, attempts: s.attempts + 1, lastAttempt: today, times, updatedAt: now }

  if (outcome !== 'correct') {
    const level = Math.max(0, s.level - 1)
    return {
      ...base,
      level,
      reviewStep: 0,
      nextDue: today,
      lastChangeDay: level !== s.level ? today : s.lastChangeDay,
    }
  }

  if (s.lastChangeDay === today) {
    // Úroveň sa dnes už menila – nechávame ju, položka príde najskôr zajtra.
    const tomorrow = addDays(today, 1)
    return { ...base, nextDue: s.nextDue !== null && s.nextDue > tomorrow ? s.nextDue : tomorrow }
  }
  if (s.level >= MAX_LEVEL) {
    // Úspešné opakovanie na najvyššej úrovni – len posunieme ďalšie opakovanie.
    return { ...base, ...scheduleReview(s.reviewStep, today) }
  }

  const level = s.level + 1
  if (level < MASTERED_LEVEL) {
    return { ...base, level, lastChangeDay: today, nextDue: addDays(today, 1) }
  }
  return { ...base, level, lastChangeDay: today, ...scheduleReview(s.reviewStep, today) }
}

function scheduleReview(step: number, today: string): Pick<ItemState, 'nextDue' | 'reviewStep'> {
  const i = Math.min(step, REVIEW_INTERVALS.length - 1)
  return { nextDue: addDays(today, REVIEW_INTERVALS[i]), reviewStep: Math.min(step + 1, REVIEW_INTERVALS.length - 1) }
}

export type ItemStates = Record<string, ItemState>

export interface SkillProgress {
  total: number
  mastered: number
  ratio: number
  isMastered: boolean
}

export function skillProgress(index: LadderIndex, skillId: string, items: ItemStates): SkillProgress {
  const list = index.itemsBySkill.get(skillId) ?? []
  const mastered = list.filter((it) => (items[it.id]?.level ?? 0) >= MASTERED_LEVEL).length
  const ratio = list.length === 0 ? 1 : mastered / list.length
  return { total: list.length, mastered, ratio, isMastered: ratio >= SKILL_MASTERY_RATIO - 1e-9 }
}

/**
 * Aktuálna zručnosť = najnižšia odomknutá, ktorá ešte nie je osvojená.
 * Ak sa staršia zručnosť pri opakovaní pokazí, znova sa stane aktuálnou.
 * Keď je všetko osvojené, vráti najvyššiu odomknutú.
 */
export function currentSkill(index: LadderIndex, unlockedUpTo: number, items: ItemStates): SkillDef {
  const unlocked = index.skills.filter((s) => s.order <= unlockedUpTo)
  for (const skill of unlocked) {
    if (!skillProgress(index, skill.id, items).isMastered) return skill
  }
  return unlocked[unlocked.length - 1] ?? index.skills[0]
}

/**
 * Ak je najvyššia odomknutá zručnosť osvojená, odomkne ďalšiu.
 * Vracia nové `unlockedUpTo` a zoznam práve odomknutých zručností (pre oslavu).
 */
export function updateUnlocks(
  index: LadderIndex,
  unlockedUpTo: number,
  items: ItemStates,
): { unlockedUpTo: number; newlyUnlocked: SkillDef[]; newlyMastered: SkillDef[] } {
  const newlyUnlocked: SkillDef[] = []
  const newlyMastered: SkillDef[] = []
  let upTo = unlockedUpTo
  for (;;) {
    const top = index.skills.find((s) => s.order === upTo)
    const next = index.skills.find((s) => s.order > upTo)
    if (!top || !next || !skillProgress(index, top.id, items).isMastered) break
    newlyMastered.push(top)
    newlyUnlocked.push(next)
    upTo = next.order
  }
  return { unlockedUpTo: upTo, newlyUnlocked, newlyMastered }
}

/** Položky odomknutých zručností okrem `exceptSkillId`, ktoré sú dnes na rade na opakovanie. */
export function dueReviewItems(
  index: LadderIndex,
  unlockedUpTo: number,
  items: ItemStates,
  today: string,
  exceptSkillId: string,
): string[] {
  const out: { id: string; due: string; level: number }[] = []
  for (const skill of index.skills) {
    if (skill.order > unlockedUpTo || skill.id === exceptSkillId) continue
    for (const item of index.itemsBySkill.get(skill.id) ?? []) {
      const st = items[item.id]
      if (isDue(st?.nextDue ?? null, today)) out.push({ id: item.id, due: st?.nextDue ?? '', level: st?.level ?? 0 })
    }
  }
  // Najdlhšie čakajúce a najslabšie najskôr.
  out.sort((x, y) => (x.due < y.due ? -1 : x.due > y.due ? 1 : x.level - y.level))
  return out.map((x) => x.id)
}
