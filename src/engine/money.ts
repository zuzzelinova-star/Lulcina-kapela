import { MONEY_STAGES, REWARDS, type MoneyStage } from '../content/money'
import type { ShopItem } from '../content/shop'
import type { ItemResult } from './types'

/** Stupeň peňazí podľa najvyššej odomknutej zručnosti. */
export function moneyStage(unlockedUpTo: number): MoneyStage {
  let stage = MONEY_STAGES[0]
  for (const s of MONEY_STAGES) if (unlockedUpTo >= s.fromSkill) stage = s
  return stage
}

/** Koľko Lulu zarobí za výsledky jednej úlohy. */
export function earnings(results: ItemResult[]): number {
  return results.reduce((sum, r) => sum + REWARDS[r.outcome], 0)
}

/** Suma v čitateľnom tvare: „5 €“, „2,50 €“, „80 centov“. */
export function formatMoney(cents: number): string {
  if (cents < 100 && cents > 0) return `${cents} ${cents === 1 ? 'cent' : cents < 5 ? 'centy' : 'centov'}`
  const euros = Math.floor(cents / 100)
  const rest = cents % 100
  return rest === 0 ? `${euros} €` : `${euros},${String(rest).padStart(2, '0')} €`
}

export type PayMode = 'exact' | 'change' | 'savings'

/**
 * Ako sa vec zaplatí:
 * - `exact`: Lulu poskladá presnú sumu z mincí a bankoviek,
 * - `change`: zaplatí bankovkou a vypočíta výdavok (od zručnosti 7),
 * - `savings`: drahé veci nad jej počtový rozsah kúpi jedným ťuknutím (nech to nie sú komplikované počty).
 */
export function payMode(price: number, stage: MoneyStage, coinFlip: number): PayMode {
  if (price > stage.maxPayable) return 'savings'
  // Výdavok počítame v celých eurách.
  if (stage.change && price % 100 === 0 && price < stage.maxPayable && !stage.denominations.includes(price) && coinFlip < 0.4) return 'change'
  return 'exact'
}

/** Bankovka, ktorou sa platí pri výdavku: najmenšia z peňaženky, ktorá je väčšia ako cena. */
export function changeNote(price: number, stage: MoneyStage): number {
  const bigger = stage.denominations.filter((d) => d > price && d >= 500)
  return bigger.length > 0 ? Math.min(...bigger) : stage.maxPayable
}

export interface ShopView {
  item: ShopItem
  owned: boolean
  affordable: boolean
  locked: boolean
}

/** Čo obchod ukáže: vlastnené veci, dostupné a tie, na ktoré sa ešte šetrí. */
export function shopView(items: ShopItem[], owned: string[], money: number, stage: MoneyStage): ShopView[] {
  return items
    .filter((it) => !it.requiresCents || stage.cents)
    .map((item) => {
      const isOwned = !item.repeatable && owned.includes(item.id)
      const locked = item.needs !== undefined && !owned.includes(item.needs)
      return { item, owned: isOwned, affordable: !isOwned && !locked && money >= item.price, locked }
    })
}

export function sumCoins(coins: number[]): number {
  return coins.reduce((s, c) => s + c, 0)
}

/** Môže Lulu kúpiť vec? (dosť peňazí, nie je už kúpená, je odomknutá) */
export function canBuy(item: ShopItem, owned: string[], money: number): boolean {
  if (!item.repeatable && owned.includes(item.id)) return false
  if (item.needs && !owned.includes(item.needs)) return false
  return money >= item.price
}
