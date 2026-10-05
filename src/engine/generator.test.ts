import { describe, expect, it } from 'vitest'
import { LADDER } from '../content/ladder'
import { enumerateFamily, hasBorrow, hasCarry, matchesFamily, resultOf } from './facts'
import { indexLadder, instantiate, skillItems } from './items'
import { mulberry32 } from './rng'
import type { Fact, Family } from './types'

const index = indexLadder(LADDER)

function numbers(fact: Fact): number[] {
  switch (fact.kind) {
    case 'count':
    case 'placeValue':
      return [fact.n]
    case 'compare':
    case 'add':
    case 'sub':
      return [fact.a, fact.b, typeof resultOf(fact) === 'number' ? (resultOf(fact) as number) : 0]
    case 'split':
      return [fact.total, fact.part, fact.total - fact.part]
  }
}

describe('rebrík', () => {
  it('má 13 zručností v správnom poradí s unikátnymi id', () => {
    expect(LADDER.map((s) => s.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
    expect(new Set(LADDER.map((s) => s.id)).size).toBe(LADDER.length)
  })

  it('každá zručnosť má položky a unikátne id položiek', () => {
    const all = new Set<string>()
    for (const skill of LADDER) {
      const items = skillItems(skill)
      expect(items.length, skill.id).toBeGreaterThan(0)
      for (const it of items) {
        expect(all.has(it.id), it.id).toBe(false)
        all.add(it.id)
      }
    }
  })

  it('žiadna množina ani vzor nie je prázdny', () => {
    for (const skill of LADDER) {
      for (const f of skill.families ?? []) expect(enumerateFamily(f).length, skill.id).toBeGreaterThan(0)
      for (const p of skill.patterns ?? []) expect(enumerateFamily(p.of).length, p.pattern).toBeGreaterThan(0)
    }
  })

  it('počty položiek zodpovedajú dohode (bez spájania 3+4 a 4+3, aj so základmi s nulou)', () => {
    const count = (id: string) => index.itemsBySkill.get(id)!.length
    expect(count('scitanie10')).toBe(66) // a, b ≥ 0, a + b ≤ 10
    expect(count('odcitanie10')).toBe(66)
    expect(count('rozklad5')).toBe(18) // 2..5, časť 0..celok
    expect(count('rozklad10')).toBe(45)
    expect(count('prechod-plus')).toBe(36)
    expect(count('prechod-minus')).toBe(36)
    expect(count('dvojicky')).toBe(28)
    expect(index.items.has('scitanie10/add:3+4')).toBe(true)
    expect(index.items.has('scitanie10/add:4+3')).toBe(true)
    expect(index.items.has('scitanie10/add:0+5')).toBe(true)
  })
})

describe('generátor nevytvorí príklad mimo rozsahu zručnosti', () => {
  const rng = mulberry32(42)
  const SAMPLES = 400

  for (const skill of LADDER) {
    it(`${skill.order}. ${skill.title}`, () => {
      const families: Family[] = [...(skill.families ?? []), ...(skill.patterns ?? []).map((p) => p.of)]
      for (const item of skillItems(skill)) {
        const reps = item.pattern ? SAMPLES : 3
        for (let i = 0; i < reps; i++) {
          const fact = instantiate(item, rng)
          // Porovnanie sa môže zobraziť v opačnom poradí – kontrolujeme usporiadanú dvojicu.
          const normalized: Fact =
            fact.kind === 'compare' ? { kind: 'compare', a: Math.min(fact.a, fact.b), b: Math.max(fact.a, fact.b) } : fact
          expect(
            families.some((f) => matchesFamily(normalized, f)),
            `${item.id} → ${JSON.stringify(fact)}`,
          ).toBe(true)
          for (const x of numbers(fact)) {
            expect(x, `${item.id}: záporné číslo`).toBeGreaterThanOrEqual(0)
            expect(x, `${item.id}: nad 100`).toBeLessThanOrEqual(100)
          }
        }
      }
    })
  }
})

describe('konkrétne hranice zručností', () => {
  const facts = (id: string) => index.itemsBySkill.get(id)!.map((it) => it.fact!)

  it('do 10: výsledky 0–10, odčítanie nikdy záporné', () => {
    for (const f of facts('scitanie10')) expect(resultOf(f)).toBeLessThanOrEqual(10)
    for (const f of facts('odcitanie10')) {
      expect(resultOf(f)).toBeGreaterThanOrEqual(0)
      expect(resultOf(f)).toBeLessThanOrEqual(10)
    }
  })

  it('do 20 bez prechodu: nikdy prechod cez desiatku', () => {
    for (const f of facts('do20bez')) {
      if (f.kind === 'add') expect(hasCarry(f.a, f.b), `${f.a}+${f.b}`).toBe(false)
      if (f.kind === 'sub') expect(hasBorrow(f.a, f.b), `${f.a}-${f.b}`).toBe(false)
      expect(resultOf(f)).toBeLessThanOrEqual(20)
    }
  })

  it('prechod cez 10: vždy prechod, výsledok do 20', () => {
    for (const f of facts('prechod-plus')) {
      if (f.kind !== 'add') throw new Error('čakal som sčítanie')
      expect(hasCarry(f.a, f.b)).toBe(true)
      expect(f.a + f.b).toBeGreaterThan(10)
      expect(f.a + f.b).toBeLessThanOrEqual(20)
    }
    for (const f of facts('prechod-minus')) {
      if (f.kind !== 'sub') throw new Error('čakal som odčítanie')
      expect(hasBorrow(f.a, f.b)).toBe(true)
      expect(f.a).toBeGreaterThan(10)
      expect(f.a - f.b).toBeLessThan(10)
      expect(f.a - f.b).toBeGreaterThanOrEqual(0)
    }
  })

  it('dvojičky: rovnaké alebo o jedna odlišné sčítance', () => {
    for (const f of facts('dvojicky')) {
      if (f.kind !== 'add') throw new Error('čakal som sčítanie')
      expect(Math.abs(f.a - f.b)).toBeLessThanOrEqual(1)
    }
  })

  it('do 100 bez prechodu a s prechodom', () => {
    const rng = mulberry32(7)
    for (const it of index.itemsBySkill.get('do100bez')!) {
      for (let i = 0; i < 300; i++) {
        const f = instantiate(it, rng)
        if (f.kind === 'add') {
          expect(hasCarry(f.a, f.b)).toBe(false)
          expect(f.a + f.b).toBeLessThanOrEqual(100)
        }
        if (f.kind === 'sub') {
          expect(hasBorrow(f.a, f.b)).toBe(false)
          expect(f.a - f.b).toBeGreaterThanOrEqual(0)
        }
      }
    }
    for (const it of index.itemsBySkill.get('do100s')!) {
      for (let i = 0; i < 300; i++) {
        const f = instantiate(it, rng)
        if (f.kind === 'add') {
          expect(hasCarry(f.a, f.b)).toBe(true)
          expect(f.a + f.b).toBeLessThanOrEqual(100)
        }
        if (f.kind === 'sub') {
          expect(hasBorrow(f.a, f.b)).toBe(true)
          expect(f.a - f.b).toBeGreaterThanOrEqual(0)
        }
      }
    }
  })

  it('vzory dávajú rôzne čísla', () => {
    const rng = mulberry32(3)
    const item = index.items.get('do100s/p:2d+1d-c')!
    const seen = new Set<string>()
    for (let i = 0; i < 50; i++) seen.add(JSON.stringify(instantiate(item, rng)))
    expect(seen.size).toBeGreaterThan(20)
  })
})
