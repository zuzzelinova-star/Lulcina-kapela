import { describe, expect, it } from 'vitest'
import { LADDER } from '../content/ladder'
import { pairKey, pairLeft } from './activities'
import { addDays } from './dates'
import { indexLadder } from './items'
import { MASTERED_LEVEL, newItemState, type ItemStates } from './mastery'
import { mulberry32 } from './rng'
import { arrange, buildSetlist, DEFAULT_SETLIST_SIZE, fillerTask, insertRetry, retryTask, sequenceViolations } from './setlist'
import type { ActivityId, Task } from './types'

const index = indexLadder(LADDER)
const TODAY = '2026-10-05'

function masteredUpTo(order: number, nextDue = TODAY): ItemStates {
  const out: ItemStates = {}
  for (const s of index.skills) {
    if (s.order > order) continue
    for (const it of index.itemsBySkill.get(s.id)!) out[it.id] = { ...newItemState(), level: MASTERED_LEVEL, nextDue }
  }
  return out
}

function task(activity: ActivityId, itemId: string): Task {
  return { id: `${activity}-${itemId}-${Math.random()}`, activity, itemIds: [itemId], facts: [{ kind: 'count', n: 1 }] }
}

describe('zostavenie setlistu', () => {
  it('má 13 políčok', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const tasks = buildSetlist({ index, items: masteredUpTo(3), unlockedUpTo: 4, today: TODAY, rng: mulberry32(seed) })
      expect(tasks).toHaveLength(DEFAULT_SETLIST_SIZE)
    }
  })

  it('zloženie: asi 30 % opakovanie, zvyšok aktuálna zručnosť', () => {
    const tasks = buildSetlist({ index, items: masteredUpTo(3), unlockedUpTo: 4, today: TODAY, rng: mulberry32(5) })
    const skillOf = (t: Task) => index.items.get(t.itemIds[0])!.skillId
    const review = tasks.filter((t) => skillOf(t) !== 'scitanie10')
    expect(review.length).toBe(Math.round(DEFAULT_SETLIST_SIZE * 0.3))
    expect(tasks.length - review.length).toBeGreaterThanOrEqual(8)
  })

  it('keď nie je čo opakovať, celý setlist je z aktuálnej zručnosti', () => {
    const tasks = buildSetlist({
      index,
      items: masteredUpTo(3, addDays(TODAY, 5)),
      unlockedUpTo: 4,
      today: TODAY,
      rng: mulberry32(9),
    })
    expect(tasks.every((t) => t.itemIds.every((id) => id.startsWith('scitanie10/')))).toBe(true)
  })

  it('nikdy viac ako 3 úlohy rovnakého typu za sebou ani ten istý príklad dvakrát po sebe', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const rng = mulberry32(seed)
      const unlocked = 2 + (seed % 9) // zručnosti 2–10 majú vždy aspoň dve aktivity
      const tasks = buildSetlist({ index, items: masteredUpTo(unlocked - 1), unlockedUpTo: unlocked, today: TODAY, rng })
      expect(sequenceViolations(tasks), `seed ${seed}, zručnosť ${unlocked}`).toBe(0)
    }
  })

  it('používa rôzne aktivity pre tú istú zručnosť', () => {
    const t2 = buildSetlist({ index, items: masteredUpTo(2, addDays(TODAY, 3)), unlockedUpTo: 3, today: TODAY, rng: mulberry32(11) })
    expect(new Set(t2.map((t) => t.activity)).size).toBeGreaterThanOrEqual(3)
  })

  it('Kamaráti spájajú 3–4 dvojice s rovnakým súčtom a rôznymi notami', () => {
    let seen = 0
    for (let seed = 1; seed <= 50; seed++) {
      const tasks = buildSetlist({ index, items: masteredUpTo(2, addDays(TODAY, 3)), unlockedUpTo: 3, today: TODAY, rng: mulberry32(seed) })
      for (const t of tasks.filter((t) => t.activity === 'kamarati')) {
        seen++
        expect(t.facts.length).toBeGreaterThanOrEqual(3)
        expect(t.facts.length).toBeLessThanOrEqual(4)
        const keys = new Set(t.facts.map(pairKey))
        expect(keys.size).toBe(1)
        const lefts = t.facts.map(pairLeft)
        expect(new Set(lefts).size).toBe(lefts.length)
      }
    }
    expect(seen).toBeGreaterThan(0)
  })

  it('položky, ktoré dnes ešte môžu stúpnuť, majú prednosť', () => {
    const items: ItemStates = masteredUpTo(3, addDays(TODAY, 3))
    const list = index.itemsBySkill.get('scitanie10')!
    // Väčšina položiek už dnes stúpla.
    for (const it of list.slice(0, 60)) items[it.id] = { ...newItemState(), level: 1, lastChangeDay: TODAY, nextDue: addDays(TODAY, 1) }
    const fresh = new Set(list.slice(60).map((it) => it.id))
    const tasks = buildSetlist({ index, items, unlockedUpTo: 4, today: TODAY, rng: mulberry32(4) })
    const usedFresh = new Set(tasks.flatMap((t) => t.itemIds).filter((id) => fresh.has(id)))
    expect(usedFresh.size).toBe(fresh.size)
  })

  it('pri vzoroch (málo položiek) sa setlist aj tak naplní', () => {
    const tasks = buildSetlist({ index, items: masteredUpTo(10, addDays(TODAY, 3)), unlockedUpTo: 11, today: TODAY, rng: mulberry32(2) })
    expect(tasks).toHaveLength(DEFAULT_SETLIST_SIZE)
    expect(sequenceViolations(tasks)).toBe(0)
  })
})

describe('miešanie typov úloh', () => {
  it('rozloží dlhé rady rovnakého typu', () => {
    const tasks = [
      ...Array.from({ length: 9 }, (_, i) => task('skusobna', `a${i}`)),
      ...Array.from({ length: 4 }, (_, i) => task('ladenie', `b${i}`)),
    ]
    for (let seed = 1; seed <= 50; seed++) expect(sequenceViolations(arrange(tasks, mulberry32(seed)))).toBe(0)
  })

  it('keď sa pravidlo splniť nedá, vráti čo najlepšie poradie a nič nestratí', () => {
    const tasks = Array.from({ length: 6 }, (_, i) => task('skusobna', `a${i}`))
    const out = arrange(tasks, mulberry32(1))
    expect(out).toHaveLength(6)
    expect(sequenceViolations(out)).toBe(3) // 6 za sebou = 4., 5. a 6. úloha navyše
  })

  it('sequenceViolations počíta rovnakú položku za sebou', () => {
    expect(sequenceViolations([task('skusobna', 'x'), task('ladenie', 'x')])).toBe(1)
    expect(sequenceViolations([task('skusobna', 'x'), task('ladenie', 'y'), task('skusobna', 'x')])).toBe(0)
  })
})

describe('návrat položky po chybe', () => {
  const tasks = [
    task('skusobna', 'a'),
    task('ladenie', 'b'),
    task('skusobna', 'c'),
    task('ladenie', 'd'),
    task('skusobna', 'e'),
    task('ladenie', 'f'),
  ]

  it('vráti sa v tom istom kole, najskôr o dve úlohy neskôr', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const retry = { ...task('ladenie', 'a'), retry: true }
      const out = insertRetry(tasks, 0, retry, mulberry32(seed))
      const pos = out.indexOf(retry)
      expect(pos).toBeGreaterThanOrEqual(2)
      expect(out).toHaveLength(tasks.length + 1)
      expect(sequenceViolations(out)).toBe(0)
    }
  })

  it('na konci kola pridá pred opakovanie výplň, aby príklad nešiel hneď po sebe', () => {
    const retry = { ...task('ladenie', 'f'), retry: true }
    const filler = { ...task('skusobna', 'z'), retry: true }
    const out = insertRetry(tasks, 5, retry, mulberry32(1), filler)
    expect(out.slice(-2)).toEqual([filler, retry])
  })

  it('úloha na opakovanie je podľa možnosti v inej aktivite', () => {
    const rng = mulberry32(3)
    for (let i = 0; i < 20; i++) {
      const t = retryTask(index, 'scitanie10/add:3+4', 'skusobna', rng)
      expect(t.activity).toBe('ladenie')
      expect(t.retry).toBe(true)
      expect(t.facts[0]).toEqual({ kind: 'add', a: 3, b: 4 })
    }
  })

  it('výplň je iná položka tej istej zručnosti', () => {
    const t = fillerTask(index, 'scitanie10/add:3+4', mulberry32(1))!
    expect(t.itemIds[0]).not.toBe('scitanie10/add:3+4')
    expect(t.itemIds[0].startsWith('scitanie10/')).toBe(true)
  })
})
