import { describe, expect, it } from 'vitest'
import { addDays } from '../engine/dates'
import { currentSkill } from '../engine/mastery'
import { initialState, LADDER_INDEX, migrate, reducer, type GameState } from './game'

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
  it('po dokončení začína od základov a známe zručnosti sa rýchlo osvoja', () => {
    let s = reducer(initialState(), { type: 'placementStart', seed: 1 })
    let i = 0
    while (!s.placementDone && i < 50) {
      s = reducer(s, { type: 'placementAnswer', correct: s.placement!.progress.skillOrder <= 4, today: TODAY, now: 1, seed: i++ })
    }
    expect(s.placementDone).toBe(true)
    expect(s.unlockedUpTo).toBe(1)
    expect(currentSkill(LADDER_INDEX, s.unlockedUpTo, s.items).id).toBe('pocet10')

    // Prvý setlist je z počítania bodiek; správne odpovede posúvajú príklady rovno na osvojenie.
    s = reducer(s, { type: 'roundStart', today: TODAY, seed: 7 })
    const first = s.round!.tasks[0]
    expect(first.itemIds[0].startsWith('pocet10/')).toBe(true)
    s = reducer(s, {
      type: 'taskDone',
      results: first.itemIds.map((itemId) => ({ itemId, outcome: 'correct', ms: 900 })),
      today: TODAY,
      now: 2,
      seed: 1,
    })
    expect(s.items[first.itemIds[0]].level).toBe(3)
  })
})

describe('migrácia uloženého stavu', () => {
  it('verzia 1: preskočené zručnosti z konkurzu sa vrátia, odohrané odpovede ostanú', () => {
    const skipped = { level: 3, lastAttempt: null, nextDue: '2026-10-06', attempts: 0, lastChangeDay: TODAY, reviewStep: 1, times: [], updatedAt: 1 }
    const played = { level: 1, lastAttempt: TODAY, nextDue: '2026-10-06', attempts: 2, lastChangeDay: TODAY, reviewStep: 0, times: [3000], updatedAt: 2 }
    const v1 = {
      ...initialState(),
      version: 1,
      placementDone: true,
      unlockedUpTo: 6,
      items: { 'scitanie10/add:3+4': skipped, 'cisla20/pv:13': played },
      round: { tasks: [], index: 0, retried: [], startedDay: TODAY },
      money: undefined,
    }
    const s = migrate(v1 as unknown as Record<string, unknown>)
    expect(s.version).toBe(3)
    expect(s.unlockedUpTo).toBe(1)
    expect(s.round).toBeNull()
    expect(s.items['scitanie10/add:3+4'].level).toBe(2)
    expect(s.items['scitanie10/add:3+4'].lastChangeDay).toBeNull()
    expect(s.items['cisla20/pv:13']).toEqual(played)
    expect(currentSkill(LADDER_INDEX, s.unlockedUpTo, s.items).id).toBe('pocet10')
    expect(s.money).toBe(0)
    expect(s.owned).toEqual([])
    expect(s.settings).toEqual({ sound: true, speech: true })
  })

  it('verzia 2: rozohrané kolo dostane druh a zárobok, nové polia predvolené hodnoty', () => {
    const v2 = { ...initialState(), version: 2, round: { tasks: [], index: 0, retried: [], startedDay: TODAY } }
    delete (v2 as Record<string, unknown>).money
    delete (v2 as Record<string, unknown>).settings
    const s = migrate(v2 as unknown as Record<string, unknown>)
    expect(s.round!.kind).toBe('setlist')
    expect(s.round!.earned).toBe(0)
    expect(s.money).toBe(0)
    expect(s.settings.speech).toBe(true)
  })
})

describe('peniaze a obchod v stave hry', () => {
  it('správne odpovede zarábajú, chyba nič neberie, dokončený setlist dá bonus', () => {
    let s = start()
    const first = s.round!.tasks[0]
    s = reducer(s, { type: 'taskDone', results: first.itemIds.map((itemId) => ({ itemId, outcome: 'wrong', ms: 1 })), today: TODAY, now: 1, seed: 1 })
    expect(s.money).toBe(0)
    let guard = 0
    while (s.round!.index < s.round!.tasks.length && guard++ < 50) {
      const t = s.round!.tasks[s.round!.index]
      s = reducer(s, { type: 'taskDone', results: t.itemIds.map((itemId) => ({ itemId, outcome: 'correct', ms: 1 })), today: TODAY, now: 1, seed: guard })
    }
    const answered = s.round!.tasks.slice(1).reduce((n, t) => n + t.itemIds.length, 0)
    expect(s.money).toBe(answered * 200 + 500)
    expect(s.round!.earned).toBe(s.money)
  })

  it('nákup odpočíta peniaze; vec sa nedá kúpiť dvakrát ani na dlh', () => {
    let s: GameState = { ...initialState(), money: 1000 }
    s = reducer(s, { type: 'buy', itemId: 'okuliare', today: TODAY })
    expect(s.money).toBe(600)
    expect(s.owned).toEqual(['okuliare'])
    s = reducer(s, { type: 'buy', itemId: 'okuliare', today: TODAY })
    expect(s.money).toBe(600)
    s = reducer(s, { type: 'buy', itemId: 'bubenicka', today: TODAY })
    expect(s.money).toBe(600)
    s = reducer(s, { type: 'buy', itemId: 'limonada', today: TODAY })
    s = reducer(s, { type: 'buy', itemId: 'limonada', today: TODAY })
    expect(s.money).toBe(200)
    expect(s.owned).toEqual(['okuliare'])
    expect(s.snack).toEqual({ id: 'limonada', day: TODAY })
  })

  it('koncert: len osvojené príklady, žiadne opakovanie po chybe, bonus na konci', () => {
    let s: GameState = { ...initialState(), placementDone: true, unlockedUpTo: 2 }
    const items: GameState['items'] = {}
    for (const it of LADDER_INDEX.itemsBySkill.get('pocet10')!) {
      items[it.id] = { level: 3, lastAttempt: null, nextDue: '2026-12-01', attempts: 3, lastChangeDay: null, reviewStep: 1, times: [], updatedAt: 0 }
    }
    s = { ...s, items }
    s = reducer(s, { type: 'concertStart', today: TODAY, seed: 4 })
    expect(s.round!.kind).toBe('concert')
    const n = s.round!.tasks.length
    for (let i = 0; i < n; i++) {
      const t = s.round!.tasks[s.round!.index]
      expect(t.itemIds.every((id) => id.startsWith('pocet10/'))).toBe(true)
      s = reducer(s, { type: 'taskDone', results: t.itemIds.map((itemId) => ({ itemId, outcome: i === 0 ? 'wrong' : 'correct', ms: 1 })), today: TODAY, now: 1, seed: i })
    }
    expect(s.round!.tasks.length).toBe(n)
    expect(s.money).toBe((n - 1) * 100 + 300)
    expect(s.roundsCompleted).toBe(0)
  })

  it('bez osvojených príkladov sa koncert nezačne', () => {
    const s = reducer({ ...initialState(), placementDone: true }, { type: 'concertStart', today: TODAY, seed: 1 })
    expect(s.round).toBeNull()
  })
})
