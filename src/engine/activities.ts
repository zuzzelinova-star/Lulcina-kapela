import type { ActivityId, Fact, FactKind } from './types'
import { fitsWordProblem } from './wordProblems'

/** Aké druhy príkladov vie aktivita zobraziť. */
export const ACTIVITY_SUPPORTS: Record<ActivityId, FactKind[]> = {
  skusobna: ['count', 'compare', 'add', 'sub', 'split', 'placeValue'],
  ladenie: ['add', 'sub', 'split', 'placeValue'],
  kamarati: ['split', 'add'],
  hlasnejsi: ['compare'],
  schody: ['add', 'sub'],
  slovna: ['add', 'sub'],
}

/** Aktivity, ktoré už sú hotové. Ostatné sa pri skladaní setlistu preskočia. */
export const ENABLED_ACTIVITIES: ActivityId[] = ['skusobna', 'kamarati', 'ladenie', 'hlasnejsi', 'schody', 'slovna']

export function supports(activity: ActivityId, fact: Fact): boolean {
  if (!ACTIVITY_SUPPORTS[activity].includes(fact.kind)) return false
  if (activity === 'schody') return fitsStairs(fact)
  if (activity === 'slovna') return fitsWordProblem(fact)
  return true
}

/** Schody na pódium majú najviac 20 schodov a aspoň jeden skok. */
export function fitsStairs(fact: Fact): boolean {
  if (fact.kind === 'add') return fact.b >= 1 && fact.a + fact.b <= 20
  if (fact.kind === 'sub') return fact.b >= 1 && fact.a <= 20
  return false
}

export interface StairsJump {
  from: number
  to: number
}

/**
 * Skoky po schodoch. Pri prechode cez 10 sa skáče na dva razy:
 * najprv na 10, potom zvyšok (8 + 5 = 8 + 2 + 3).
 */
export function stairsJumps(fact: Fact): { top: number; jumps: StairsJump[] } {
  if (fact.kind !== 'add' && fact.kind !== 'sub') throw new Error('Schody vedia len sčítanie a odčítanie')
  const start = fact.a
  const end = fact.kind === 'add' ? fact.a + fact.b : fact.a - fact.b
  const top = Math.max(start, end) <= 10 ? 10 : 20
  const crosses = (start < 10 && end > 10) || (start > 10 && end < 10)
  const jumps = crosses
    ? [
        { from: start, to: 10 },
        { from: 10, to: end },
      ]
    : [{ from: start, to: end }]
  return { top, jumps }
}

/** Kľúč, podľa ktorého sa v Kamarátoch spájajú dvojice (spoločný súčet). */
export function pairKey(fact: Fact): number | null {
  if (fact.kind === 'split') return fact.total
  if (fact.kind === 'add') return fact.a + fact.b
  return null
}

/** Ľavá nota dvojice v Kamarátoch. */
export function pairLeft(fact: Fact): number {
  if (fact.kind === 'split') return fact.part
  if (fact.kind === 'add') return fact.a
  throw new Error('Kamaráti vedia len rozklad a sčítanie')
}
