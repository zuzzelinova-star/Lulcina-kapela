import type { Answer, Fact, Family, Range } from './types'

export function inRange(x: number, [min, max]: Range): boolean {
  return x >= min && x <= max
}

function multipleOk(x: number, m?: number): boolean {
  return m === undefined || x % m === 0
}

/** Prechod cez desiatku pri sčítaní (súčet jednotiek je aspoň 10). */
export function hasCarry(a: number, b: number): boolean {
  return (a % 10) + (b % 10) >= 10
}

/** Prechod cez desiatku pri odčítaní (treba si požičať desiatku). */
export function hasBorrow(a: number, b: number): boolean {
  return a % 10 < b % 10
}

/** Správna odpoveď, ak sa pýtame na výsledok. */
export function resultOf(fact: Fact): Answer {
  switch (fact.kind) {
    case 'count':
      return fact.n
    case 'compare':
      return fact.a < fact.b ? '<' : fact.a > fact.b ? '>' : '='
    case 'add':
      return fact.a + fact.b
    case 'sub':
      return fact.a - fact.b
    case 'split':
      return fact.total - fact.part
    case 'placeValue':
      return fact.n
  }
}

/** Patrí príklad do množiny? Používa sa pri vymenovaní aj v testoch. */
export function matchesFamily(fact: Fact, family: Family): boolean {
  switch (family.type) {
    case 'count':
      return fact.kind === 'count' && inRange(fact.n, family.n)
    case 'compare': {
      if (fact.kind !== 'compare') return false
      const diff = Math.abs(fact.a - fact.b)
      return (
        inRange(fact.a, family.a) &&
        inRange(fact.b, family.b) &&
        (family.maxDiff === undefined || diff <= family.maxDiff) &&
        (diff > 0 || family.allowEqual === true)
      )
    }
    case 'add': {
      if (fact.kind !== 'add') return false
      const { a, b } = fact
      const carry = hasCarry(a, b)
      if (family.carry === 'none' && carry) return false
      if (family.carry === 'required' && !carry) return false
      if (family.relation === 'double' && a !== b) return false
      if (family.relation === 'nearDouble' && Math.abs(a - b) !== 1) return false
      return (
        inRange(a, family.a) &&
        inRange(b, family.b) &&
        inRange(a + b, family.result) &&
        multipleOk(a, family.aMultipleOf) &&
        multipleOk(b, family.bMultipleOf)
      )
    }
    case 'sub': {
      if (fact.kind !== 'sub') return false
      const { a, b } = fact
      const borrow = hasBorrow(a, b)
      if (family.borrow === 'none' && borrow) return false
      if (family.borrow === 'required' && !borrow) return false
      return (
        a - b >= 0 &&
        inRange(a, family.a) &&
        inRange(b, family.b) &&
        inRange(a - b, family.result) &&
        multipleOk(a, family.aMultipleOf) &&
        multipleOk(b, family.bMultipleOf)
      )
    }
    case 'split': {
      if (fact.kind !== 'split') return false
      const partRange = family.part ?? [0, fact.total]
      return (
        inRange(fact.total, family.total) &&
        fact.part >= 0 &&
        fact.part <= fact.total &&
        inRange(fact.part, partRange) &&
        multipleOk(fact.part, family.partMultipleOf)
      )
    }
    case 'placeValue':
      return fact.kind === 'placeValue' && inRange(fact.n, family.n) && multipleOk(fact.n, family.multipleOf)
  }
}

function* span([min, max]: Range): Generator<number> {
  for (let x = min; x <= max; x++) yield x
}

/** Vymenuje všetky príklady množiny (každý presne raz). */
export function enumerateFamily(family: Family): Fact[] {
  const out: Fact[] = []
  const push = (fact: Fact) => {
    if (matchesFamily(fact, family)) out.push(fact)
  }
  switch (family.type) {
    case 'count':
      for (const n of span(family.n)) push({ kind: 'count', n })
      break
    case 'compare':
      // Porovnanie berieme ako neusporiadanú dvojicu (a ≤ b); poradie na obrazovke sa losuje.
      for (const a of span(family.a)) for (const b of span(family.b)) if (a <= b) push({ kind: 'compare', a, b })
      break
    case 'add':
      for (const a of span(family.a)) for (const b of span(family.b)) push({ kind: 'add', a, b })
      break
    case 'sub':
      for (const a of span(family.a)) for (const b of span(family.b)) push({ kind: 'sub', a, b })
      break
    case 'split':
      for (const total of span(family.total)) for (let part = 0; part <= total; part++) push({ kind: 'split', total, part })
      break
    case 'placeValue':
      for (const n of span(family.n)) push({ kind: 'placeValue', n })
      break
  }
  return out
}

/** Stabilný textový kľúč príkladu, napr. "add:8+5". */
export function factKey(fact: Fact): string {
  switch (fact.kind) {
    case 'count':
      return `count:${fact.n}`
    case 'compare':
      return `compare:${fact.a}?${fact.b}`
    case 'add':
      return `add:${fact.a}+${fact.b}`
    case 'sub':
      return `sub:${fact.a}-${fact.b}`
    case 'split':
      return `split:${fact.total}=${fact.part}+?`
    case 'placeValue':
      return `pv:${fact.n}`
  }
}

/** Čitateľný zápis príkladu pre rodiča, napr. "8 + 5". */
export function factLabel(fact: Fact): string {
  switch (fact.kind) {
    case 'count':
      return `počet ${fact.n}`
    case 'compare':
      return `${fact.a} ? ${fact.b}`
    case 'add':
      return `${fact.a} + ${fact.b}`
    case 'sub':
      return `${fact.a} − ${fact.b}`
    case 'split':
      return `${fact.total} = ${fact.part} + ▢`
    case 'placeValue':
      return `${Math.floor(fact.n / 10)} D + ${fact.n % 10} J`
  }
}
