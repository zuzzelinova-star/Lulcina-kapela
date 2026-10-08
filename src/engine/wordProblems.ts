import type { Fact } from './types'

/**
 * Slovné úlohy z prostredia kapely so správnym skloňovaním:
 * 1 víla, 2–4 víly, 0 a 5+ víl; slovesá podľa počtu a rodu.
 */
type Gender = 'm' | 'f' | 'n'

interface Noun {
  one: string
  /** Akuzatív jednotného čísla („má 1 hviezdu“), ak sa líši od nominatívu. */
  oneAcc?: string
  few: string
  many: string
  gender: Gender
}

const NOUNS: Record<string, Noun> = {
  vila: { one: 'víla', few: 'víly', many: 'víl', gender: 'f' },
  jednorozec: { one: 'jednorožec', few: 'jednorožce', many: 'jednorožcov', gender: 'm' },
  hviezda: { one: 'hviezda', oneAcc: 'hviezdu', few: 'hviezdy', many: 'hviezd', gender: 'f' },
  balon: { one: 'balón', few: 'balóny', many: 'balónov', gender: 'm' },
  listok: { one: 'lístok', few: 'lístky', many: 'lístkov', gender: 'm' },
  piesen: { one: 'pieseň', few: 'piesne', many: 'piesní', gender: 'f' },
  trsatko: { one: 'trsátko', few: 'trsátka', many: 'trsátok', gender: 'n' },
  fanusik: { one: 'fanúšik', few: 'fanúšikovia', many: 'fanúšikov', gender: 'm' },
}

/** Tvar podstatného mena podľa čísla. */
export function nounForm(noun: Noun, n: number): string {
  if (n === 1) return noun.one
  if (n >= 2 && n <= 4) return noun.few
  return noun.many
}

/** Tvar v akuzatíve („Víla má 1 hviezdu / 3 hviezdy / 5 hviezd“). */
export function nounAcc(noun: Noun, n: number): string {
  return n === 1 ? (noun.oneAcc ?? noun.one) : nounForm(noun, n)
}

/** Sloveso v minulom čase: [mužský, ženský, stredný, množné] tvar. */
type Verb = [string, string, string, string]

const VERBS: Record<string, Verb> = {
  prist: ['prišiel', 'prišla', 'prišlo', 'prišli'],
  odist: ['odišiel', 'odišla', 'odišlo', 'odišli'],
  prasknut: ['praskol', 'praskla', 'prasklo', 'praskli'],
  spadnut: ['spadol', 'spadla', 'spadlo', 'spadli'],
}

/** Sloveso v zhode s počtom: 1 → rod, 2–4 → množné číslo, 0 a 5+ → stredný rod. */
export function verbForm(verb: Verb, n: number, gender: Gender): string {
  if (n === 1) return gender === 'm' ? verb[0] : gender === 'f' ? verb[1] : verb[2]
  if (n >= 2 && n <= 4) return verb[3]
  return verb[2]
}

/** „je“ alebo „sú“ podľa počtu. */
export function isAre(n: number): string {
  return n >= 2 && n <= 4 ? 'sú' : 'je'
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

type Template = (a: number, b: number) => string

const ADD: Template[] = [
  (a, b) => {
    const v = NOUNS.vila
    const j = NOUNS.jednorozec
    return `Na pódiu ${isAre(a)} ${a} ${nounForm(v, a)}. ${cap(verbForm(VERBS.prist, b, j.gender))} ${b} ${nounForm(j, b)}. Koľko ich je spolu?`
  },
  (a, b) => {
    const n = NOUNS.fanusik
    return `Pred pódiom ${isAre(a)} ${a} ${nounForm(n, a)}. ${cap(verbForm(VERBS.prist, b, n.gender))} ešte ${b}. Koľko ich je teraz?`
  },
  (a, b) => `Víla má ${a} ${nounAcc(NOUNS.hviezda, a)}. Dostala ešte ${b}. Koľko hviezd má teraz?`,
  (a, b) => `Kapela zahrala ${a} ${nounAcc(NOUNS.piesen, a)} a potom ešte ${b}. Koľko piesní zahrala?`,
  (a, b) => `Jednorožec má ${a} ${nounAcc(NOUNS.trsatko, a)} a víla ${b}. Koľko trsátok majú spolu?`,
]

const SUB: Template[] = [
  (a, b) => {
    const j = NOUNS.jednorozec
    return `Na pódiu ${isAre(a)} ${a} ${nounForm(j, a)}. ${cap(verbForm(VERBS.odist, b, j.gender))} ${b}. Koľko ich zostalo?`
  },
  (a, b) => {
    const n = NOUNS.balon
    return `Na pódiu ${isAre(a)} ${a} ${nounForm(n, a)}. ${cap(verbForm(VERBS.prasknut, b, n.gender))} ${b}. Koľko balónov zostalo?`
  },
  (a, b) => `Víla mala ${a} ${nounAcc(NOUNS.listok, a)} na koncert. Rozdala ${b}. Koľko lístkov jej zostalo?`,
  (a, b) => {
    const n = NOUNS.hviezda
    return `Na stene ${isAre(a)} ${a} ${nounForm(n, a)}. ${cap(verbForm(VERBS.spadnut, b, n.gender))} ${b}. Koľko hviezd zostalo?`
  },
]

/** Dá sa príklad zadať ako slovná úloha? (bez nuly, tá v príbehu znie čudne) */
export function fitsWordProblem(fact: Fact): boolean {
  return (fact.kind === 'add' || fact.kind === 'sub') && fact.a >= 1 && fact.b >= 1
}

export function wordProblem(fact: Fact, seed: number): string {
  if (fact.kind === 'add') return ADD[seed % ADD.length](fact.a, fact.b)
  if (fact.kind === 'sub') return SUB[seed % SUB.length](fact.a, fact.b)
  throw new Error('Slovná úloha vie len sčítanie a odčítanie')
}

export const WORD_PROBLEM_TEMPLATES = { add: ADD.length, sub: SUB.length }
