import { describe, expect, it } from 'vitest'
import { LADDER } from '../content/ladder'
import { supports } from './activities'
import { indexLadder, instantiate } from './items'
import { mulberry32 } from './rng'
import { isAre, verbForm, wordProblem, WORD_PROBLEM_TEMPLATES } from './wordProblems'

describe('skloňovanie v slovných úlohách', () => {
  it('je/sú podľa počtu', () => {
    expect(isAre(1)).toBe('je')
    expect(isAre(3)).toBe('sú')
    expect(isAre(5)).toBe('je')
    expect(isAre(22)).toBe('je')
  })
  it('sloveso podľa počtu a rodu', () => {
    const prist: [string, string, string, string] = ['prišiel', 'prišla', 'prišlo', 'prišli']
    expect(verbForm(prist, 1, 'm')).toBe('prišiel')
    expect(verbForm(prist, 1, 'f')).toBe('prišla')
    expect(verbForm(prist, 3, 'm')).toBe('prišli')
    expect(verbForm(prist, 7, 'f')).toBe('prišlo')
  })
  it('príklad zo zadania znie správne', () => {
    expect(wordProblem({ kind: 'add', a: 6, b: 3 }, 0)).toBe('Na pódiu je 6 víl. Prišli 3 jednorožce. Koľko ich je spolu?')
    expect(wordProblem({ kind: 'add', a: 1, b: 1 }, 0)).toBe('Na pódiu je 1 víla. Prišiel 1 jednorožec. Koľko ich je spolu?')
    expect(wordProblem({ kind: 'add', a: 3, b: 5 }, 0)).toBe('Na pódiu sú 3 víly. Prišlo 5 jednorožcov. Koľko ich je spolu?')
  })
  it('akuzatív: víla má 1 hviezdu', () => {
    expect(wordProblem({ kind: 'add', a: 1, b: 2 }, 2)).toBe('Víla má 1 hviezdu. Dostala ešte 2. Koľko hviezd má teraz?')
    expect(wordProblem({ kind: 'add', a: 3, b: 2 }, 2)).toContain('má 3 hviezdy')
  })
  it('odčítanie', () => {
    expect(wordProblem({ kind: 'sub', a: 4, b: 1 }, 0)).toBe('Na pódiu sú 4 jednorožce. Odišiel 1. Koľko ich zostalo?')
    expect(wordProblem({ kind: 'sub', a: 9, b: 3 }, 1)).toBe('Na pódiu je 9 balónov. Praskli 3. Koľko balónov zostalo?')
  })
  it('každá šablóna dá pre každý príklad z rebríka text bez chýbajúcich hodnôt', () => {
    const index = indexLadder(LADDER)
    const rng = mulberry32(1)
    for (const item of index.items.values()) {
      const fact = instantiate(item, rng)
      if (!supports('slovna', fact)) continue
      const n = fact.kind === 'add' ? WORD_PROBLEM_TEMPLATES.add : WORD_PROBLEM_TEMPLATES.sub
      for (let t = 0; t < n; t++) {
        const text = wordProblem(fact, t)
        expect(text).not.toMatch(/undefined|NaN/)
        expect(text.endsWith('?')).toBe(true)
      }
    }
  })
  it('slovné úlohy nedávajú príklady s nulou', () => {
    expect(supports('slovna', { kind: 'add', a: 0, b: 3 })).toBe(false)
    expect(supports('slovna', { kind: 'sub', a: 5, b: 0 })).toBe(false)
  })
})
