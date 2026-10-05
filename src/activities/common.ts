import { resultOf } from '../engine/facts'
import type { Answer, Fact } from '../engine/types'

/** Jednoduchý hash reťazca – na stabilné „náhodné“ rozhodnutia v rámci úlohy. */
export function hash(s: string): number {
  let h = 2166136261
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0
  return h
}

export function answerText(a: Answer): string {
  return String(a)
}

/** Ponuka odpovedí: správna a blízke čísla, nikdy záporné. */
export function numberOptions(fact: Fact, seed: string, count = 4): number[] {
  const correct = resultOf(fact) as number
  const set = new Set<number>([correct])
  const deltas = [1, -1, 2, -2, 10, -10, 3, -3]
  let h = hash(seed)
  for (let i = 0; set.size < count && i < 40; i++) {
    const d = deltas[(h + i) % deltas.length]
    const v = correct + d
    if (v >= 0 && v <= 100) set.add(v)
    h = (h * 7 + 3) >>> 0
  }
  return [...set].sort((a, b) => a - b)
}

/** Krátke zadanie (najviac jedna veta) – neskôr sa bude čítať nahlas. */
export function promptFor(fact: Fact): string {
  switch (fact.kind) {
    case 'count':
      return 'Koľko je bodiek?'
    case 'compare':
      return 'Ktoré číslo je väčšie?'
    case 'add':
    case 'sub':
      return 'Koľko to je?'
    case 'split':
      return 'Koľko chýba do celku?'
    case 'placeValue':
      return 'Aké je to číslo?'
  }
}
