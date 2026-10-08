/**
 * Peniaze idú súbežne s rebríkom. Všetky sumy sú v centoch.
 * `fromSkill` = od ktorej odomknutej zručnosti stupeň platí.
 */
export interface MoneyStage {
  fromSkill: number
  /** Mince a bankovky, ktoré má Lulu v peňaženke (v centoch). */
  denominations: number[]
  /** Do akej ceny platí presnou sumou sama; drahšie veci kúpi jedným ťuknutím zo sporenia. */
  maxPayable: number
  /** Vie už počítať výdavok? */
  change: boolean
  /** Ukazujú sa aj ceny s centami (2,50 €)? */
  cents: boolean
}

export const MONEY_STAGES: MoneyStage[] = [
  // Pred sčítaním do 10: len mince 1 € a 2 €, ceny najviac 5 €.
  { fromSkill: 1, denominations: [100, 200], maxPayable: 500, change: false, cents: false },
  // Od zručnosti 4: celé eurá, presná suma do 10 €.
  { fromSkill: 4, denominations: [100, 200, 500, 1000], maxPayable: 1000, change: false, cents: false },
  // Od zručnosti 7: aj 20 € a výdavok.
  { fromSkill: 7, denominations: [100, 200, 500, 1000, 2000], maxPayable: 2000, change: true, cents: false },
  // Od zručnosti 11: centy.
  {
    fromSkill: 11,
    denominations: [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000],
    maxPayable: 10000,
    change: true,
    cents: true,
  },
]

/** Odmeny (v centoch). Chyba nikdy nič nezoberie. */
export const REWARDS = {
  correct: 200,
  hinted: 100,
  wrong: 0,
  setlistBonus: 500,
  concertBonus: 300,
  concertCorrect: 100,
}
