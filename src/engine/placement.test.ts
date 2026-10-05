import { describe, expect, it } from 'vitest'
import { LADDER } from '../content/ladder'
import { addDays } from './dates'
import { indexLadder } from './items'
import { currentSkill, skillProgress } from './mastery'
import { applyPlacement, placementQuestion, recordPlacement, startPlacement, type PlacementProgress } from './placement'
import { mulberry32 } from './rng'

const index = indexLadder(LADDER)
const TODAY = '2026-10-05'

/** Odohrá konkurz; `answer(order, n)` povie, či n-tá otázka zo zručnosti je správne. */
function play(answer: (order: number, n: number) => boolean): { p: PlacementProgress; asked: number } {
  const rng = mulberry32(1)
  let p = startPlacement(index)
  let asked = 0
  let n = 0
  let order = p.skillOrder
  while (!p.done && asked < 100) {
    const q = placementQuestion(index, p, rng)!
    if (p.skillOrder !== order) {
      order = p.skillOrder
      n = 0
    }
    p = recordPlacement(index, p, q.itemId, answer(p.skillOrder, n++))
    asked++
  }
  return { p, asked }
}

describe('konkurz', () => {
  it('keď vie všetko, prejde po zručnosť 10 a má asi 15 úloh', () => {
    const { p, asked } = play(() => true)
    expect(p.passedUpTo).toBe(10)
    expect(asked).toBeLessThanOrEqual(17)
    expect(asked).toBeGreaterThanOrEqual(13)
  })

  it('jedna chyba v zručnosti = jedna úloha navyše, nie koniec', () => {
    const { p } = play((order, n) => !(order === 4 && n === 0))
    expect(p.passedUpTo).toBe(10)
  })

  it('dve chyby v zručnosti konkurz ukončia', () => {
    const { p } = play((order) => order < 9)
    expect(p.passedUpTo).toBe(8)
    expect(p.done).toBe(true)
  })

  it('výsledok: zvládnuté zručnosti sú osvojené, ďalšia je aktuálna a zajtra sa opakuje', () => {
    const r = applyPlacement(index, {}, 8, TODAY, 1)
    expect(r.unlockedUpTo).toBe(9)
    for (const s of index.skills.filter((s) => s.order <= 8)) expect(skillProgress(index, s.id, r.items).isMastered).toBe(true)
    expect(currentSkill(index, r.unlockedUpTo, r.items).id).toBe('prechod-plus')
    const any = r.items['scitanie10/add:3+4']
    expect(any.nextDue).toBe(addDays(TODAY, 1))
  })

  it('keď nezvládne nič, začína od prvej zručnosti', () => {
    const { p } = play(() => false)
    expect(p.passedUpTo).toBe(0)
    const r = applyPlacement(index, {}, 0, TODAY, 1)
    expect(r.unlockedUpTo).toBe(1)
    expect(currentSkill(index, r.unlockedUpTo, r.items).id).toBe('pocet10')
  })

  it('neopakuje rovnakú otázku', () => {
    const rng = mulberry32(5)
    let p = startPlacement(index)
    const seen: string[] = []
    while (!p.done) {
      const q = placementQuestion(index, p, rng)!
      expect(seen).not.toContain(q.itemId)
      seen.push(q.itemId)
      p = recordPlacement(index, p, q.itemId, true)
    }
  })
})
