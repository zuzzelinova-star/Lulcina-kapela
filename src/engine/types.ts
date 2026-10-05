// Spoločné typy jadra hry. Všetko tu je čisté dáta, bez väzby na UI.

/** Uzavretý interval [min, max]. */
export type Range = [number, number]

/** Konkrétny príklad, ktorý dieťa rieši. */
export type Fact =
  | { kind: 'count'; n: number }
  | { kind: 'compare'; a: number; b: number }
  | { kind: 'add'; a: number; b: number }
  | { kind: 'sub'; a: number; b: number }
  | { kind: 'split'; total: number; part: number }
  | { kind: 'placeValue'; n: number }

export type FactKind = Fact['kind']

/** Odpoveď je číslo alebo znamienko porovnania. */
export type Answer = number | '<' | '>' | '='

export type ActivityId =
  | 'skusobna'
  | 'kamarati'
  | 'ladenie'
  | 'hlasnejsi'
  | 'schody'
  | 'slovna'

/** Množina príkladov zadaná podmienkami (dátový zápis v rebríku). */
export type Family =
  | { type: 'count'; n: Range }
  | { type: 'compare'; a: Range; b: Range; maxDiff?: number; allowEqual?: boolean }
  | {
      type: 'add'
      a: Range
      b: Range
      result: Range
      /** Prechod cez desiatku v jednotkách (napr. 8+5). */
      carry: 'none' | 'required' | 'any'
      relation?: 'double' | 'nearDouble'
      aMultipleOf?: number
      bMultipleOf?: number
    }
  | {
      type: 'sub'
      a: Range
      b: Range
      result: Range
      /** Prechod cez desiatku v jednotkách (napr. 13−5). */
      borrow: 'none' | 'required' | 'any'
      aMultipleOf?: number
      bMultipleOf?: number
    }
  | { type: 'split'; total: Range; part?: Range; partMultipleOf?: number }
  | { type: 'placeValue'; n: Range; multipleOf?: number }

/**
 * Položka rebríka. Buď je to jeden konkrétny príklad (`fact`),
 * alebo vzor (`pattern`), z ktorého sa pri každom zadaní vyberie náhodný príklad.
 */
export interface ItemDef {
  id: string
  skillId: string
  fact?: Fact
  pattern?: { name: string; of: Family }
}

export interface PatternFamily {
  pattern: string
  /** Krátky popis vzoru pre rodičovskú časť. */
  name: string
  of: Family
}

export interface SkillDef {
  id: string
  order: number
  title: string
  /** Kratší názov pre dieťa, napr. na domovskej obrazovke. */
  kidTitle: string
  /** Množiny, z ktorých sa vymenujú všetky položky. */
  families?: Family[]
  /** Vzory – každý je jedna položka s náhodnými číslami. */
  patterns?: PatternFamily[]
  activities: ActivityId[]
  /** Koľko úloh z tejto zručnosti dať na konkurze (0 = netestuje sa). */
  placement: number
}

export type Outcome = 'correct' | 'hinted' | 'wrong'

export interface ItemState {
  level: number
  /** Deň posledného pokusu (YYYY-MM-DD). */
  lastAttempt: string | null
  /** Deň, odkedy je položka znova na rade (YYYY-MM-DD). null = hneď. */
  nextDue: string | null
  attempts: number
  /** Deň poslednej zmeny úrovne (hore aj dole). Bráni viac ako jednej zmene nahor za deň. */
  lastChangeDay: string | null
  /** Index do intervalov opakovania (1, 3, 7, 14 dní). */
  reviewStep: number
  /** Posledné časy odpovede v ms. */
  times: number[]
  /** Čas poslednej zmeny (ms od epochy) – pre budúcu synchronizáciu. */
  updatedAt: number
}

export interface Task {
  id: string
  activity: ActivityId
  itemIds: string[]
  facts: Fact[]
  /** Opakovanie položky po chybe – nemá vlastné políčko v setliste. */
  retry?: boolean
}

export interface ItemResult {
  itemId: string
  outcome: Outcome
  ms: number
}
