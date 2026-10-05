import { instantiate, type LadderIndex } from './items'
import { MASTERED_LEVEL, newItemState, type ItemStates } from './mastery'

/**
 * Úroveň, ktorú dostanú položky zvládnutých zručností. Je o jednu nižšia ako osvojenie,
 * takže každý príklad treba ešte raz správne vyriešiť – nič sa nepreskočí, len to ide rýchlejšie.
 */
export const PLACEMENT_LEVEL = MASTERED_LEVEL - 1
import { pick, type Rng } from './rng'
import type { Fact } from './types'

/**
 * Konkurz do kapely: krátka rozraďovacia hra.
 * Zručnosti sa skúšajú postupne (počet úloh podľa `placement` v rebríku).
 * Pri jednej chybe v zručnosti príde jedna úloha navyše; pri druhej chybe konkurz končí.
 */
export interface PlacementProgress {
  /** Poradie (order) práve skúšanej zručnosti. */
  skillOrder: number
  asked: number
  misses: number
  /** Najvyššia zručnosť, ktorú zvládla (0 = žiadna). */
  passedUpTo: number
  done: boolean
  /** Položky použité na konkurze (aby sa neopakovali). */
  usedItems: string[]
}

export function startPlacement(index: LadderIndex): PlacementProgress {
  const first = index.skills.find((s) => s.placement > 0)
  return { skillOrder: first?.order ?? 0, asked: 0, misses: 0, passedUpTo: 0, done: !first, usedItems: [] }
}

export function placementQuestion(
  index: LadderIndex,
  progress: PlacementProgress,
  rng: Rng,
): { itemId: string; fact: Fact } | null {
  if (progress.done) return null
  const skill = index.skills.find((s) => s.order === progress.skillOrder)
  if (!skill) return null
  const all = index.itemsBySkill.get(skill.id) ?? []
  // Na konkurze nedávame úplne triviálne príklady (s nulou), tie nič nepovedia.
  const fresh = all.filter((it) => !progress.usedItems.includes(it.id) && !isTrivial(instantiate(it, rng)))
  const item = pick(rng, fresh.length > 0 ? fresh : all)
  return { itemId: item.id, fact: instantiate(item, rng) }
}

function isTrivial(fact: Fact): boolean {
  switch (fact.kind) {
    case 'add':
    case 'sub':
      return fact.b === 0 || fact.a === 0
    case 'split':
      return fact.part === 0 || fact.part === fact.total
    default:
      return false
  }
}

/** Zapíše odpoveď na konkurze. Počíta sa len správna odpoveď na prvý pokus. */
export function recordPlacement(
  index: LadderIndex,
  progress: PlacementProgress,
  itemId: string,
  correct: boolean,
): PlacementProgress {
  const skill = index.skills.find((s) => s.order === progress.skillOrder)
  if (!skill || progress.done) return progress
  const asked = progress.asked + 1
  const misses = progress.misses + (correct ? 0 : 1)
  const usedItems = [...progress.usedItems, itemId]

  if (misses >= 2) return { ...progress, asked, misses, usedItems, done: true }
  const needed = skill.placement + misses
  if (asked < needed) return { ...progress, asked, misses, usedItems }

  // Zručnosť zvládnutá – ideme na ďalšiu, ktorá sa na konkurze skúša.
  const next = index.skills.find((s) => s.order > skill.order && s.placement > 0)
  return {
    skillOrder: next?.order ?? skill.order,
    asked: 0,
    misses: 0,
    passedUpTo: skill.order,
    done: !next,
    usedItems,
  }
}

/**
 * Výsledok konkurzu: zvládnuté zručnosti dostanú náskok (úroveň PLACEMENT_LEVEL),
 * ale hra vždy začína od prvej zručnosti. Čo Lulu naozaj vie, prejde rýchlo
 * (stačí jedna správna odpoveď na príklad), a nič sa nepreskočí.
 */
export function applyPlacement(
  index: LadderIndex,
  items: ItemStates,
  passedUpTo: number,
  now: number,
): { items: ItemStates; unlockedUpTo: number } {
  const next = { ...items }
  for (const skill of index.skills) {
    if (skill.order > passedUpTo) continue
    for (const item of index.itemsBySkill.get(skill.id) ?? []) {
      const prev = next[item.id] ?? newItemState()
      if (prev.level >= PLACEMENT_LEVEL) continue
      // lastChangeDay ostáva prázdny, aby príklad mohol stúpnuť hneď v prvom kole.
      next[item.id] = { ...prev, level: PLACEMENT_LEVEL, nextDue: null, reviewStep: 0, lastChangeDay: null, updatedAt: now }
    }
  }
  return { items: next, unlockedUpTo: index.skills[0].order }
}
