import { describe, expect, it } from 'vitest'
import { addDays } from '../engine/dates'
import { initialState, reducer, type GameState } from './game'

const TODAY = '2026-10-05'

function start(): GameState {
  return reducer({ ...initialState(), placementDone: true, unlockedUpTo: 4 }, { type: 'roundStart', today: TODAY, seed: 1 })
}

describe('priebeh kola', () => {
  it('správne odpovede posúvajú setlist a na konci zvýšia počet kôl', () => {
    let s = start()
    const n = s.round!.tasks.length
    for (let i = 0; i < n; i++) {
      const t = s.round!.tasks[s.round!.index]
      s = reducer(s, {
        type: 'taskDone',
        results: t.itemIds.map((itemId) => ({ itemId, outcome: 'correct', ms: 2000 })),
        today: TODAY,
        now: 1,
        seed: i,
      })
    }
    expect(s.round!.index).toBe(n)
    expect(s.roundsCompleted).toBe(1)
    expect(s.daysPlayed).toEqual([TODAY])
  })

  it('chyba vráti položku ešte raz v tom istom kole (len raz) a mince sa nestrácajú', () => {
    let s = start()
    const before = s.round!.tasks.length
    const first = s.round!.tasks[0]
    s = reducer(s, {
      type: 'taskDone',
      results: first.itemIds.map((itemId) => ({ itemId, outcome: 'wrong', ms: 5000 })),
      today: TODAY,
      now: 1,
      seed: 2,
    })
    expect(s.round!.tasks.length).toBe(before + first.itemIds.length)
    const retries = s.round!.tasks.filter((t) => t.retry)
    expect(retries.map((t) => t.itemIds[0]).sort()).toEqual([...first.itemIds].sort())
    // Druhá chyba na tej istej položke už ďalšie opakovanie nepridá.
    let guard = 0
    while (s.round!.index < s.round!.tasks.length && guard++ < 40) {
      const t = s.round!.tasks[s.round!.index]
      s = reducer(s, {
        type: 'taskDone',
        results: t.itemIds.map((itemId) => ({ itemId, outcome: 'wrong', ms: 5000 })),
        today: TODAY,
        now: 1,
        seed: guard,
      })
    }
    const counts = new Map<string, number>()
    for (const t of s.round!.tasks) for (const id of t.itemIds) counts.set(id, (counts.get(id) ?? 0) + 1)
    for (const id of first.itemIds) expect(counts.get(id)).toBeLessThanOrEqual(2)
  })

  it('osvojenie zručnosti odomkne ďalšiu a zapíše oslavu', () => {
    let s: GameState = { ...initialState(), placementDone: true, unlockedUpTo: 2 }
    // Zručnosť 1 je osvojená, zručnosť 2 skoro – chýba jedna položka na úroveň 3.
    const items: GameState['items'] = {}
    const yesterday = addDays(TODAY, -1)
    const mk = (level: number) => ({
      level,
      lastAttempt: yesterday,
      nextDue: TODAY,
      attempts: 3,
      lastChangeDay: yesterday,
      reviewStep: 0,
      times: [],
      updatedAt: 0,
    })
    // pocet10: 37 položiek, rozklad5: 18 položiek
    for (let n = 1; n <= 10; n++) items[`pocet10/count:${n}`] = mk(3)
    for (let a = 1; a <= 10; a++)
      for (let b = a; b <= Math.min(10, a + 2); b++) items[`pocet10/compare:${a}?${b}`] = mk(3)
    const splits: string[] = []
    for (let t = 2; t <= 5; t++) for (let p = 0; p <= t; p++) splits.push(`rozklad5/split:${t}=${p}+?`)
    splits.forEach((id, i) => (items[id] = mk(i < 16 ? 3 : 2)))
    s = { ...s, items }
    s = reducer(s, { type: 'roundStart', today: TODAY, seed: 3 })
    s = {
      ...s,
      round: {
        ...s.round!,
        tasks: [{ id: 'x', activity: 'ladenie', itemIds: [splits[16]], facts: [{ kind: 'split', total: 5, part: 3 }] }],
        index: 0,
      },
    }
    s = reducer(s, { type: 'taskDone', results: [{ itemId: splits[16], outcome: 'correct', ms: 1 }], today: TODAY, now: 1, seed: 1 })
    expect(s.unlockedUpTo).toBe(3)
    expect(s.celebrate).toEqual(['rozklad5'])
  })
})

describe('konkurz v stave hry', () => {
  it('po dokončení nastaví odomknuté zručnosti', () => {
    let s = reducer(initialState(), { type: 'placementStart', seed: 1 })
    let i = 0
    while (!s.placementDone && i < 50) {
      s = reducer(s, { type: 'placementAnswer', correct: s.placement!.progress.skillOrder <= 4, today: TODAY, now: 1, seed: i++ })
    }
    expect(s.placementDone).toBe(true)
    expect(s.unlockedUpTo).toBe(5)
  })
})
