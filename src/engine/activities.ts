import type { ActivityId, Fact, FactKind } from './types'

/** Aké druhy príkladov vie aktivita zobraziť. */
export const ACTIVITY_SUPPORTS: Record<ActivityId, FactKind[]> = {
  skusobna: ['count', 'compare', 'add', 'sub', 'split', 'placeValue'],
  ladenie: ['add', 'sub', 'split', 'placeValue'],
  kamarati: ['split', 'add'],
  hlasnejsi: ['compare'],
  schody: ['count', 'add', 'sub', 'placeValue'],
  slovna: ['add', 'sub'],
}

/** Aktivity, ktoré už sú hotové. Ostatné sa pri skladaní setlistu preskočia. */
export const ENABLED_ACTIVITIES: ActivityId[] = ['skusobna', 'kamarati', 'ladenie']

export function supports(activity: ActivityId, fact: Fact): boolean {
  return ACTIVITY_SUPPORTS[activity].includes(fact.kind)
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
