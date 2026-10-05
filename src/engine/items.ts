import { enumerateFamily, factKey } from './facts'
import { pick, type Rng } from './rng'
import type { Fact, ItemDef, SkillDef } from './types'

/** Všetky položky zručnosti v stabilnom poradí. */
export function skillItems(skill: SkillDef): ItemDef[] {
  const items: ItemDef[] = []
  const seen = new Set<string>()
  for (const family of skill.families ?? []) {
    for (const fact of enumerateFamily(family)) {
      const id = `${skill.id}/${factKey(fact)}`
      if (seen.has(id)) continue
      seen.add(id)
      items.push({ id, skillId: skill.id, fact })
    }
  }
  for (const p of skill.patterns ?? []) {
    items.push({ id: `${skill.id}/p:${p.pattern}`, skillId: skill.id, pattern: { name: p.name, of: p.of } })
  }
  return items
}

const patternCache = new Map<string, Fact[]>()

/** Konkrétny príklad pre položku. Vzor dostane zakaždým iné čísla. */
export function instantiate(item: ItemDef, rng: Rng): Fact {
  const fact = baseFact(item, rng)
  // Porovnanie je neusporiadaná dvojica – poradie na obrazovke losujeme.
  if (fact.kind === 'compare' && fact.a !== fact.b && rng() < 0.5) return { kind: 'compare', a: fact.b, b: fact.a }
  return fact
}

function baseFact(item: ItemDef, rng: Rng): Fact {
  if (item.fact) return item.fact
  if (!item.pattern) throw new Error(`Položka ${item.id} nemá príklad ani vzor`)
  let facts = patternCache.get(item.id)
  if (!facts) {
    facts = enumerateFamily(item.pattern.of)
    if (facts.length === 0) throw new Error(`Vzor ${item.id} je prázdny`)
    patternCache.set(item.id, facts)
  }
  return pick(rng, facts)
}

/** Index položiek celého rebríka podľa id. */
export interface LadderIndex {
  skills: SkillDef[]
  skillById: Map<string, SkillDef>
  items: Map<string, ItemDef>
  itemsBySkill: Map<string, ItemDef[]>
}

export function indexLadder(skills: SkillDef[]): LadderIndex {
  const sorted = [...skills].sort((a, b) => a.order - b.order)
  const items = new Map<string, ItemDef>()
  const itemsBySkill = new Map<string, ItemDef[]>()
  for (const skill of sorted) {
    const list = skillItems(skill)
    itemsBySkill.set(skill.id, list)
    for (const item of list) items.set(item.id, item)
  }
  return { skills: sorted, skillById: new Map(sorted.map((s) => [s.id, s])), items, itemsBySkill }
}
