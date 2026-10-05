import { describe, expect, it } from 'vitest'
import { LADDER } from '../content/ladder'
import { addDays } from './dates'
import { indexLadder } from './items'
import {
  applyOutcome,
  currentSkill,
  dueReviewItems,
  MASTERED_LEVEL,
  newItemState,
  skillProgress,
  updateUnlocks,
  type ItemStates,
} from './mastery'
import type { ItemState, Outcome } from './types'

const D1 = '2026-10-05'
const D2 = addDays(D1, 1)
const D3 = addDays(D1, 2)

function run(steps: [Outcome, string][], start?: ItemState): ItemState {
  let s = start
  for (const [o, day] of steps) s = applyOutcome(s, o, day, 1500, 0)
  return s!
}

describe('postup úrovní', () => {
  it('správne bez nápovede = o úroveň vyššie', () => {
    expect(run([['correct', D1]]).level).toBe(1)
  })

  it('nápoveda aj chyba = o úroveň nižšie, nie pod 0', () => {
    const at2 = { ...newItemState(), level: 2 }
    expect(applyOutcome(at2, 'hinted', D1, 0, 0).level).toBe(1)
    expect(applyOutcome(at2, 'wrong', D1, 0, 0).level).toBe(1)
    expect(applyOutcome(newItemState(), 'wrong', D1, 0, 0).level).toBe(0)
  })

  it('po chybe je položka hneď znova na rade', () => {
    const s = applyOutcome({ ...newItemState(), level: 3, nextDue: addDays(D1, 7) }, 'wrong', D1, 0, 0)
    expect(s.nextDue).toBe(D1)
    expect(s.reviewStep).toBe(0)
  })

  it('úroveň neprekročí 4', () => {
    const s = run([
      ['correct', D1],
      ['correct', addDays(D1, 1)],
      ['correct', addDays(D1, 2)],
      ['correct', addDays(D1, 10)],
      ['correct', addDays(D1, 30)],
      ['correct', addDays(D1, 60)],
    ])
    expect(s.level).toBe(4)
  })
})

describe('najviac jedna úroveň za deň', () => {
  it('viac správnych odpovedí v jeden deň = len +1', () => {
    const s = run([
      ['correct', D1],
      ['correct', D1],
      ['correct', D1],
    ])
    expect(s.level).toBe(1)
    expect(s.attempts).toBe(3)
  })

  it('na úroveň 3 treba tri rôzne dni', () => {
    const s = run([
      ['correct', D1],
      ['correct', D1],
      ['correct', D2],
      ['correct', D2],
      ['correct', D3],
    ])
    expect(s.level).toBe(3)
  })

  it('po chybe v ten istý deň už nestúpne (oprava v kole nezmaže chybu)', () => {
    const s = run([
      ['wrong', D1],
      ['correct', D1],
    ], { ...newItemState(), level: 2 })
    expect(s.level).toBe(1)
    expect(s.nextDue).toBe(D2)
  })

  it('na druhý deň môže znova stúpnuť', () => {
    const s = run([
      ['wrong', D1],
      ['correct', D2],
    ], { ...newItemState(), level: 2 })
    expect(s.level).toBe(2)
  })
})

describe('plánovanie opakovania', () => {
  it('pod úrovňou 3 je položka na rade nasledujúci deň', () => {
    expect(run([['correct', D1]]).nextDue).toBe(D2)
  })

  it('osvojené položky sa vracajú po 1, 3, 7 a 14 dňoch', () => {
    let s: ItemState = { ...newItemState(), level: 2, lastChangeDay: null }
    let day = D1
    const gaps: number[] = []
    for (let i = 0; i < 5; i++) {
      s = applyOutcome(s, 'correct', day, 0, 0)
      const due = s.nextDue!
      let gap = 0
      while (addDays(day, gap) !== due) gap++
      gaps.push(gap)
      day = due
    }
    expect(gaps).toEqual([1, 3, 7, 14, 14])
    expect(s.level).toBe(4)
  })

  it('pokazené opakovanie: úroveň klesne a plán začína odznova', () => {
    let s: ItemState = { ...newItemState(), level: 4, reviewStep: 3, nextDue: D1 }
    s = applyOutcome(s, 'wrong', D1, 0, 0)
    expect(s.level).toBe(3)
    expect(s.nextDue).toBe(D1)
    s = applyOutcome(s, 'correct', D2, 0, 0)
    expect(s.level).toBe(4)
    expect(s.nextDue).toBe(addDays(D2, 1))
  })

  it('ukladá čas odpovede a pamätá si posledných 10', () => {
    let s: ItemState | undefined
    for (let i = 0; i < 12; i++) s = applyOutcome(s, 'correct', D1, 1000 + i, 0)
    expect(s!.times).toHaveLength(10)
    expect(s!.times[9]).toBe(1011)
  })
})

describe('osvojenie zručnosti', () => {
  const index = indexLadder(LADDER)
  const items = (skillId: string) => index.itemsBySkill.get(skillId)!
  const withLevel = (skillId: string, share: number, level = MASTERED_LEVEL): ItemStates => {
    const list = items(skillId)
    const n = Math.ceil(list.length * share)
    const out: ItemStates = {}
    list.slice(0, n).forEach((it) => (out[it.id] = { ...newItemState(), level }))
    return out
  }

  it('90 % položiek na úrovni 3+ = osvojená', () => {
    expect(skillProgress(index, 'rozklad5', withLevel('rozklad5', 0.9)).isMastered).toBe(true)
    expect(skillProgress(index, 'rozklad5', withLevel('rozklad5', 0.85)).isMastered).toBe(false)
    expect(skillProgress(index, 'rozklad5', withLevel('rozklad5', 1, 2)).isMastered).toBe(false)
  })

  it('osvojením sa odomkne ďalšia zručnosť', () => {
    const states = withLevel('pocet10', 1)
    const r = updateUnlocks(index, 1, states)
    expect(r.unlockedUpTo).toBe(2)
    expect(r.newlyUnlocked.map((s) => s.id)).toEqual(['rozklad5'])
    expect(currentSkill(index, r.unlockedUpTo, states).id).toBe('rozklad5')
  })

  it('neosvojená zručnosť nič neodomkne', () => {
    expect(updateUnlocks(index, 1, withLevel('pocet10', 0.5)).unlockedUpTo).toBe(1)
  })

  it('pokazená staršia zručnosť sa znova otvorí ako aktuálna', () => {
    const states = { ...withLevel('pocet10', 1), ...withLevel('rozklad5', 1) }
    expect(currentSkill(index, 3, states).id).toBe('rozklad10')
    // Zhoršíme 20 % položiek počtu.
    for (const it of items('pocet10').slice(0, Math.ceil(items('pocet10').length * 0.2))) {
      states[it.id] = { ...states[it.id], level: 2 }
    }
    expect(currentSkill(index, 3, states).id).toBe('pocet10')
  })

  it('na opakovanie idú len položky odomknutých zručností okrem aktuálnej, ktoré sú na rade', () => {
    const states: ItemStates = {}
    const [a, b] = items('pocet10')
    states[a.id] = { ...newItemState(), level: 3, nextDue: D1 }
    states[b.id] = { ...newItemState(), level: 3, nextDue: D3 }
    for (const it of items('pocet10').slice(2)) states[it.id] = { ...newItemState(), level: 3, nextDue: D3 }
    const due = dueReviewItems(index, 2, states, D1, 'rozklad5')
    expect(due).toEqual([a.id])
  })
})
