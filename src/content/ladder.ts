import type { SkillDef } from '../engine/types'

/**
 * Rebrík zručností. Každá zručnosť je zadaná dátami:
 * - `families`: podmienky, z ktorých sa vymenujú všetky konkrétne príklady (každý = jedna položka),
 * - `patterns`: vzory pre veľké čísla (každý vzor = jedna položka, čísla sa losujú),
 * - `activities`: v ktorých aktivitách sa zručnosť precvičuje,
 * - `placement`: koľko úloh z nej dať na konkurze.
 *
 * Novú zručnosť (napr. násobilku) stačí pridať na koniec zoznamu.
 * Aktivity, ktoré ešte nie sú hotové, sa zatiaľ preskočia.
 */
export const LADDER: SkillDef[] = [
  {
    id: 'pocet10',
    order: 1,
    title: 'Počet do 10 na pohľad, porovnávanie',
    kidTitle: 'Počítame bodky',
    families: [
      { type: 'count', n: [1, 10] },
      { type: 'compare', a: [1, 10], b: [1, 10], maxDiff: 2, allowEqual: true },
    ],
    activities: ['skusobna', 'hlasnejsi'],
    placement: 1,
  },
  {
    id: 'rozklad5',
    order: 2,
    title: 'Rozklad čísel do 5',
    kidTitle: 'Rozklad do 5',
    families: [{ type: 'split', total: [2, 5] }],
    activities: ['kamarati', 'ladenie', 'skusobna'],
    placement: 1,
  },
  {
    id: 'rozklad10',
    order: 3,
    title: 'Rozklad čísel do 10, kamaráti do 10',
    kidTitle: 'Kamaráti do 10',
    families: [{ type: 'split', total: [6, 10] }],
    activities: ['kamarati', 'ladenie', 'skusobna'],
    placement: 1,
  },
  {
    id: 'scitanie10',
    order: 4,
    title: 'Sčítanie do 10',
    kidTitle: 'Sčítanie do 10',
    families: [{ type: 'add', a: [0, 10], b: [0, 10], result: [0, 10], carry: 'any' }],
    activities: ['skusobna', 'ladenie', 'kamarati', 'schody', 'slovna'],
    placement: 2,
  },
  {
    id: 'odcitanie10',
    order: 5,
    title: 'Odčítanie do 10',
    kidTitle: 'Odčítanie do 10',
    families: [{ type: 'sub', a: [0, 10], b: [0, 10], result: [0, 10], borrow: 'any' }],
    activities: ['skusobna', 'ladenie', 'schody', 'slovna'],
    placement: 2,
  },
  {
    id: 'cisla20',
    order: 6,
    title: 'Čísla 11–20: desiatka a jednotky',
    kidTitle: 'Čísla do 20',
    families: [
      { type: 'placeValue', n: [10, 20] },
      { type: 'compare', a: [10, 20], b: [10, 20], maxDiff: 2 },
    ],
    activities: ['skusobna', 'ladenie', 'hlasnejsi'],
    placement: 2,
  },
  {
    id: 'do20bez',
    order: 7,
    title: 'Sčítanie a odčítanie do 20 bez prechodu',
    kidTitle: 'Do 20 bez prechodu',
    families: [
      { type: 'add', a: [10, 19], b: [1, 9], result: [11, 19], carry: 'none' },
      { type: 'sub', a: [11, 19], b: [1, 9], result: [10, 18], borrow: 'none' },
    ],
    activities: ['skusobna', 'ladenie', 'schody', 'slovna'],
    placement: 2,
  },
  {
    id: 'dvojicky',
    order: 8,
    title: 'Dvojičky a takmer dvojičky',
    kidTitle: 'Dvojičky',
    families: [
      { type: 'add', a: [1, 10], b: [1, 10], result: [2, 20], carry: 'any', relation: 'double' },
      { type: 'add', a: [1, 10], b: [1, 10], result: [2, 20], carry: 'any', relation: 'nearDouble' },
    ],
    activities: ['skusobna', 'ladenie', 'schody', 'slovna'],
    placement: 2,
  },
  {
    id: 'prechod-plus',
    order: 9,
    title: 'Sčítanie s prechodom cez 10 (doplnenie do desiatky)',
    kidTitle: 'Skok cez 10 – plus',
    families: [{ type: 'add', a: [2, 9], b: [2, 9], result: [11, 18], carry: 'required' }],
    activities: ['skusobna', 'ladenie', 'kamarati', 'schody', 'slovna'],
    placement: 2,
  },
  {
    id: 'prechod-minus',
    order: 10,
    title: 'Odčítanie s prechodom cez 10',
    kidTitle: 'Skok cez 10 – mínus',
    families: [{ type: 'sub', a: [11, 18], b: [2, 9], result: [2, 9], borrow: 'required' }],
    activities: ['skusobna', 'ladenie', 'schody', 'slovna'],
    placement: 2,
  },
  {
    id: 'cisla100',
    order: 11,
    title: 'Čísla do 100, desiatky a jednotky, celé desiatky',
    kidTitle: 'Čísla do 100',
    patterns: [
      { pattern: 'pv-2d', name: 'desiatky a jednotky (47)', of: { type: 'placeValue', n: [21, 99] } },
      { pattern: 'pv-tens', name: 'celé desiatky (70)', of: { type: 'placeValue', n: [10, 100], multipleOf: 10 } },
      {
        pattern: 'tens-plus-units',
        name: 'desiatky + jednotky (40 + 7)',
        of: { type: 'add', a: [20, 90], b: [1, 9], result: [21, 99], carry: 'none', aMultipleOf: 10 },
      },
      {
        pattern: 'tens-add',
        name: 'desiatky + desiatky (30 + 40)',
        of: { type: 'add', a: [10, 90], b: [10, 90], result: [20, 100], carry: 'any', aMultipleOf: 10, bMultipleOf: 10 },
      },
      {
        pattern: 'tens-sub',
        name: 'desiatky − desiatky (90 − 30)',
        of: { type: 'sub', a: [20, 100], b: [10, 90], result: [10, 90], borrow: 'none', aMultipleOf: 10, bMultipleOf: 10 },
      },
      { pattern: 'compare-100', name: 'porovnanie do 100', of: { type: 'compare', a: [10, 99], b: [10, 99], maxDiff: 30 } },
    ],
    activities: ['skusobna', 'ladenie', 'hlasnejsi', 'slovna'],
    placement: 0,
  },
  {
    id: 'do100bez',
    order: 12,
    title: 'Sčítanie a odčítanie do 100 bez prechodu',
    kidTitle: 'Do 100 bez prechodu',
    patterns: [
      { pattern: '2d+1d', name: '34 + 5', of: { type: 'add', a: [21, 98], b: [1, 9], result: [22, 99], carry: 'none' } },
      { pattern: '2d-1d', name: '38 − 5', of: { type: 'sub', a: [21, 99], b: [1, 9], result: [20, 98], borrow: 'none' } },
      {
        pattern: '2d+tens',
        name: '34 + 20',
        of: { type: 'add', a: [11, 89], b: [10, 80], result: [21, 99], carry: 'none', bMultipleOf: 10 },
      },
      {
        pattern: '2d-tens',
        name: '58 − 30',
        of: { type: 'sub', a: [21, 99], b: [10, 80], result: [11, 89], borrow: 'none', bMultipleOf: 10 },
      },
      { pattern: '2d+2d', name: '32 + 45', of: { type: 'add', a: [11, 88], b: [11, 88], result: [22, 99], carry: 'none' } },
      { pattern: '2d-2d', name: '78 − 35', of: { type: 'sub', a: [22, 99], b: [11, 88], result: [10, 88], borrow: 'none' } },
    ],
    activities: ['skusobna', 'ladenie', 'hlasnejsi', 'slovna'],
    placement: 0,
  },
  {
    id: 'do100s',
    order: 13,
    title: 'Sčítanie a odčítanie do 100 s prechodom',
    kidTitle: 'Do 100 s prechodom',
    patterns: [
      { pattern: '2d+1d-c', name: '38 + 5', of: { type: 'add', a: [11, 98], b: [2, 9], result: [20, 100], carry: 'required' } },
      { pattern: '2d-1d-b', name: '42 − 5', of: { type: 'sub', a: [20, 98], b: [2, 9], result: [11, 96], borrow: 'required' } },
      { pattern: '2d+2d-c', name: '38 + 25', of: { type: 'add', a: [11, 89], b: [11, 89], result: [30, 100], carry: 'required' } },
      { pattern: '2d-2d-b', name: '52 − 27', of: { type: 'sub', a: [30, 99], b: [11, 89], result: [2, 88], borrow: 'required' } },
      {
        pattern: 'to-100',
        name: '100 = 30 + ▢',
        of: { type: 'split', total: [100, 100], part: [10, 90], partMultipleOf: 10 },
      },
    ],
    activities: ['skusobna', 'ladenie', 'hlasnejsi', 'slovna'],
    placement: 0,
  },
]
