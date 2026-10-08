import { describe, expect, it } from 'vitest'
import { MONEY_STAGES, REWARDS } from '../content/money'
import { SHOP } from '../content/shop'
import { canBuy, changeNote, earnings, formatMoney, moneyStage, payMode, shopView } from './money'

describe('peniaze idú súbežne s rebríkom', () => {
  it('pred zručnosťou 4 len mince 1 € a 2 €, do 5 €', () => {
    const s = moneyStage(1)
    expect(s.denominations).toEqual([100, 200])
    expect(s.maxPayable).toBe(500)
    expect(s.change).toBe(false)
  })
  it('od zručnosti 4 celé eurá, od 7 výdavok, od 11 centy', () => {
    expect(moneyStage(4).denominations).toContain(1000)
    expect(moneyStage(6).change).toBe(false)
    expect(moneyStage(7).change).toBe(true)
    expect(moneyStage(7).denominations).toContain(2000)
    expect(moneyStage(10).cents).toBe(false)
    expect(moneyStage(11).cents).toBe(true)
    expect(moneyStage(13).denominations).toContain(50)
  })
  it('stupne sú zoradené a celé eurá nemajú centy', () => {
    for (let i = 1; i < MONEY_STAGES.length; i++) expect(MONEY_STAGES[i].fromSkill).toBeGreaterThan(MONEY_STAGES[i - 1].fromSkill)
    for (const s of MONEY_STAGES.filter((s) => !s.cents)) for (const d of s.denominations) expect(d % 100).toBe(0)
  })
})

describe('zárobok', () => {
  it('správne viac ako po nápovede, chyba nič neberie', () => {
    expect(earnings([{ itemId: 'x', outcome: 'correct', ms: 1 }])).toBe(REWARDS.correct)
    expect(earnings([{ itemId: 'x', outcome: 'hinted', ms: 1 }])).toBe(REWARDS.hinted)
    expect(earnings([{ itemId: 'x', outcome: 'wrong', ms: 1 }])).toBe(0)
    expect(REWARDS.hinted).toBeLessThan(REWARDS.correct)
    expect(REWARDS.hinted).toBeGreaterThan(0)
  })
})

describe('obchod', () => {
  it('lacné veci sú dostupné po jednom kole, členovia kapely asi po týždni', () => {
    // Jedno kolo: asi 13 úloh, väčšinou správne + bonus.
    const oneRound = 13 * REWARDS.correct * 0.8 + REWARDS.setlistBonus
    const cheap = SHOP.filter((i) => i.category !== 'kapela' && !i.requiresCents)
    expect(cheap.filter((i) => i.price <= oneRound).length).toBeGreaterThanOrEqual(8)
    const week = oneRound * 2 * 7
    for (const m of SHOP.filter((i) => i.category === 'kapela')) {
      expect(m.price).toBeGreaterThan(oneRound * 4)
      expect(m.price).toBeLessThanOrEqual(week)
    }
  })
  it('pred centami sú všetky ceny v celých eurách', () => {
    for (const i of SHOP.filter((i) => !i.requiresCents)) expect(i.price % 100).toBe(0)
  })
  it('pre začiatočníčku sú lacné veci, ktoré zaplatí sama (do 5 €)', () => {
    const payable = SHOP.filter((i) => !i.requiresCents && i.price <= moneyStage(1).maxPayable)
    expect(payable.length).toBeGreaterThanOrEqual(4)
  })
  it('kúpená vec sa druhýkrát kúpiť nedá, občerstvenie áno', () => {
    const okuliare = SHOP.find((i) => i.id === 'okuliare')!
    const limonada = SHOP.find((i) => i.id === 'limonada')!
    expect(canBuy(okuliare, [], 1000)).toBe(true)
    expect(canBuy(okuliare, ['okuliare'], 1000)).toBe(false)
    expect(canBuy(limonada, ['limonada'], 1000)).toBe(true)
    expect(canBuy(okuliare, [], 300)).toBe(false)
  })
  it('vec, ktorá potrebuje inú, je zamknutá', () => {
    const view = shopView(SHOP, [], 100000, moneyStage(4))
    expect(view.find((v) => v.item.id === 'basistka')!.locked).toBe(true)
    expect(view.find((v) => v.item.id === 'bubenicka')!.affordable).toBe(true)
  })
  it('veci s centami sa ukážu až od zručnosti 11', () => {
    expect(shopView(SHOP, [], 0, moneyStage(10)).some((v) => v.item.requiresCents)).toBe(false)
    expect(shopView(SHOP, [], 0, moneyStage(11)).some((v) => v.item.requiresCents)).toBe(true)
  })
})

describe('spôsob platenia', () => {
  it('drahé veci nad počtový rozsah sa kúpia zo sporenia', () => {
    expect(payMode(15000, moneyStage(4), 0.9)).toBe('savings')
    expect(payMode(600, moneyStage(1), 0.9)).toBe('savings')
    expect(payMode(400, moneyStage(1), 0.0)).toBe('exact')
  })
  it('výdavok až od zručnosti 7', () => {
    expect(payMode(700, moneyStage(4), 0.0)).toBe('exact')
    expect(payMode(700, moneyStage(7), 0.0)).toBe('change')
    expect(payMode(700, moneyStage(7), 0.9)).toBe('exact')
    expect(payMode(250, moneyStage(11), 0.0)).toBe('exact')
  })
  it('pri výdavku sa platí najbližšou väčšou bankovkou', () => {
    expect(changeNote(700, moneyStage(7))).toBe(1000)
    expect(changeNote(1300, moneyStage(7))).toBe(2000)
    expect(changeNote(300, moneyStage(7))).toBe(500)
  })
})

describe('zápis súm', () => {
  it('celé eurá, eurá s centami a samotné centy', () => {
    expect(formatMoney(500)).toBe('5 €')
    expect(formatMoney(250)).toBe('2,50 €')
    expect(formatMoney(80)).toBe('80 centov')
    expect(formatMoney(2)).toBe('2 centy')
    expect(formatMoney(1)).toBe('1 cent')
    expect(formatMoney(0)).toBe('0 €')
  })
})
