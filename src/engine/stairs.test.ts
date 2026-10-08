import { describe, expect, it } from 'vitest'
import { stairsJumps, supports } from './activities'

describe('schody na pódium', () => {
  it('bez prechodu jeden skok', () => {
    expect(stairsJumps({ kind: 'add', a: 3, b: 4 })).toEqual({ top: 10, jumps: [{ from: 3, to: 7 }] })
    expect(stairsJumps({ kind: 'sub', a: 15, b: 3 })).toEqual({ top: 20, jumps: [{ from: 15, to: 12 }] })
  })
  it('prechod cez 10 v dvoch krokoch', () => {
    expect(stairsJumps({ kind: 'add', a: 8, b: 5 }).jumps).toEqual([
      { from: 8, to: 10 },
      { from: 10, to: 13 },
    ])
    expect(stairsJumps({ kind: 'sub', a: 13, b: 5 }).jumps).toEqual([
      { from: 13, to: 10 },
      { from: 10, to: 8 },
    ])
  })
  it('skok presne na 10 nie je prechod', () => {
    expect(stairsJumps({ kind: 'add', a: 7, b: 3 }).jumps).toHaveLength(1)
    expect(stairsJumps({ kind: 'sub', a: 10, b: 4 }).jumps).toHaveLength(1)
  })
  it('schody majú najviac 20 schodov', () => {
    expect(supports('schody', { kind: 'add', a: 15, b: 6 })).toBe(false)
    expect(supports('schody', { kind: 'add', a: 34, b: 5 })).toBe(false)
    expect(supports('schody', { kind: 'add', a: 4, b: 0 })).toBe(false)
    expect(supports('schody', { kind: 'count', n: 4 })).toBe(false)
  })
})
