import type { Fact } from '../engine/types'

/** Skupina bodiek v desiatkových rámčekoch. */
export interface DotGroup {
  count: number
  color: 'pink' | 'silver' | 'purple'
  /** Prečiarknuté bodky (odčítanie). */
  crossed?: boolean
}

const COLORS = { pink: 'var(--ruzova)', silver: 'var(--strieborna)', purple: '#b04ce0' }

/**
 * Desiatkové rámčeky 2 × 5. Bodky sa plnia po radoch zľava,
 * takže 8 + 5 sa ukáže ako plná desiatka a 3 v ďalšom rámčeku.
 */
export function TenFrames({ groups, frames, numbered = false }: { groups: DotGroup[]; frames?: number; numbered?: boolean }) {
  const total = groups.reduce((s, g) => s + g.count, 0)
  const nFrames = Math.max(frames ?? 1, Math.ceil(total / 10), 1)
  const cell = 34
  const pad = 6
  const frameW = cell * 5 + pad * 2
  const frameH = cell * 2 + pad * 2
  const gap = 14
  const dots: { color: string; crossed: boolean }[] = []
  for (const g of groups) for (let i = 0; i < g.count; i++) dots.push({ color: COLORS[g.color], crossed: !!g.crossed })

  return (
    <svg
      className="tenframes"
      viewBox={`0 0 ${frameW} ${nFrames * frameH + (nFrames - 1) * gap}`}
      role="img"
      aria-label={`${total} bodiek`}
    >
      {Array.from({ length: nFrames }, (_, f) => {
        const oy = f * (frameH + gap)
        return (
          <g key={f} transform={`translate(0 ${oy})`}>
            <rect x="1" y="1" width={frameW - 2} height={frameH - 2} rx="10" fill="#120820" stroke="var(--strieborna)" strokeWidth="2" />
            {Array.from({ length: 10 }, (_, i) => {
              const cx = pad + (i % 5) * cell + cell / 2
              const cy = pad + Math.floor(i / 5) * cell + cell / 2
              const d = dots[f * 10 + i]
              return (
                <g key={i}>
                  <rect x={cx - cell / 2 + 2} y={cy - cell / 2 + 2} width={cell - 4} height={cell - 4} rx="6" fill="none" stroke="#4a3466" strokeWidth="1.5" />
                  {d && <circle cx={cx} cy={cy} r={cell / 2 - 6} fill={d.color} opacity={d.crossed ? 0.35 : 1} />}
                  {d?.crossed && (
                    <path d={`M${cx - 10} ${cy - 10} L${cx + 10} ${cy + 10} M${cx + 10} ${cy - 10} L${cx - 10} ${cy + 10}`} stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
                  )}
                  {d && numbered && (
                    <text x={cx} y={cy + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="#1a0b2e">
                      {f * 10 + i + 1}
                    </text>
                  )}
                </g>
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}

/** Desiatky ako tyčinky a jednotky ako kocky (pre čísla do 100). */
export function Base10({ parts }: { parts: { n: number; color: DotGroup['color']; crossed?: boolean }[] }) {
  const items: { kind: 'ten' | 'one'; color: string; crossed: boolean }[] = []
  for (const p of parts) {
    for (let i = 0; i < Math.floor(p.n / 10); i++) items.push({ kind: 'ten', color: COLORS[p.color], crossed: !!p.crossed })
    for (let i = 0; i < p.n % 10; i++) items.push({ kind: 'one', color: COLORS[p.color], crossed: !!p.crossed })
  }
  const tens = items.filter((i) => i.kind === 'ten')
  const ones = items.filter((i) => i.kind === 'one')
  const w = 16
  const h = 120
  const width = Math.max(tens.length * (w + 6) + (ones.length > 0 ? 20 + 2 * (w + 4) : 0), 40)
  return (
    <svg className="base10" viewBox={`0 0 ${width} ${h + 4}`} role="img" aria-label="desiatky a jednotky">
      {tens.map((t, i) => (
        <g key={`t${i}`} opacity={t.crossed ? 0.35 : 1}>
          <rect x={i * (w + 6) + 2} y="2" width={w} height={h} rx="3" fill={t.color} />
          {Array.from({ length: 9 }, (_, k) => (
            <line key={k} x1={i * (w + 6) + 2} x2={i * (w + 6) + 2 + w} y1={2 + ((k + 1) * h) / 10} y2={2 + ((k + 1) * h) / 10} stroke="#1a0b2e" strokeWidth="1" />
          ))}
          {t.crossed && <line x1={i * (w + 6)} y1={h} x2={i * (w + 6) + w + 4} y2="4" stroke="#fff" strokeWidth="3" />}
        </g>
      ))}
      {ones.map((o, i) => {
        const x = tens.length * (w + 6) + 20 + (i % 2) * (w + 4)
        const y = h - Math.floor(i / 2) * (w + 4) - w + 2
        return (
          <g key={`o${i}`} opacity={o.crossed ? 0.35 : 1}>
            <rect x={x} y={y} width={w} height={w} rx="3" fill={o.color} />
            {o.crossed && <line x1={x - 2} y1={y + w + 2} x2={x + w + 2} y2={y - 2} stroke="#fff" strokeWidth="3" />}
          </g>
        )
      })}
    </svg>
  )
}

function big(fact: Fact): boolean {
  switch (fact.kind) {
    case 'count':
    case 'placeValue':
      return fact.n > 20
    case 'compare':
    case 'add':
    case 'sub':
      return Math.max(fact.a, fact.b, fact.kind === 'add' ? fact.a + fact.b : 0) > 20
    case 'split':
      return fact.total > 20
  }
}

/** Základný obrázok k príkladu (Skúšobňa). */
export function FactPicture({ fact }: { fact: Fact }) {
  if (big(fact)) return <BigPicture fact={fact} />
  switch (fact.kind) {
    case 'count':
      return <TenFrames groups={[{ count: fact.n, color: 'pink' }]} />
    case 'compare':
      return (
        <div className="compare-pics">
          <TenFrames groups={[{ count: fact.a, color: 'pink' }]} />
          <TenFrames groups={[{ count: fact.b, color: 'silver' }]} />
        </div>
      )
    case 'add':
      return <TenFrames groups={[{ count: fact.a, color: 'pink' }, { count: fact.b, color: 'silver' }]} />
    case 'sub':
      return <TenFrames groups={[{ count: fact.a - fact.b, color: 'pink' }, { count: fact.b, color: 'pink', crossed: true }]} />
    case 'split':
      return <TenFrames groups={[{ count: fact.part, color: 'pink' }, { count: fact.total - fact.part, color: 'purple' }]} />
    case 'placeValue':
      return <TenFrames groups={[{ count: fact.n, color: 'pink' }]} frames={2} />
  }
}

function BigPicture({ fact }: { fact: Fact }) {
  switch (fact.kind) {
    case 'count':
    case 'placeValue':
      return <Base10 parts={[{ n: fact.n, color: 'pink' }]} />
    case 'compare':
      return (
        <div className="compare-pics">
          <Base10 parts={[{ n: fact.a, color: 'pink' }]} />
          <Base10 parts={[{ n: fact.b, color: 'silver' }]} />
        </div>
      )
    case 'add':
      return <Base10 parts={[{ n: fact.a, color: 'pink' }, { n: fact.b, color: 'silver' }]} />
    case 'sub':
      return <Base10 parts={[{ n: fact.a, color: 'pink' }]} />
    case 'split':
      return <Base10 parts={[{ n: fact.part, color: 'pink' }, { n: fact.total - fact.part, color: 'purple' }]} />
  }
}

/**
 * Nápoveda po prvej chybe. Pri prechode cez 10 ukáže doplnenie do desiatky
 * (8 + 5 = 8 + 2 + 3), pri odčítaní rozklad cez desiatku.
 */
export function HintPicture({ fact }: { fact: Fact }) {
  if (big(fact)) return <BigHint fact={fact} />
  switch (fact.kind) {
    case 'count':
      return <TenFrames groups={[{ count: fact.n, color: 'pink' }]} numbered />
    case 'compare':
      return <FactPicture fact={fact} />
    case 'add': {
      const { a, b } = fact
      if (a < 10 && a + b > 10) {
        const fill = 10 - a
        return (
          <figure className="hint">
            <TenFrames groups={[{ count: a, color: 'pink' }, { count: fill, color: 'silver' }, { count: b - fill, color: 'purple' }]} frames={2} />
            <figcaption>
              {a} + <span className="c-silver">{fill}</span> + <span className="c-purple">{b - fill}</span>
            </figcaption>
          </figure>
        )
      }
      return <TenFrames groups={[{ count: a, color: 'pink' }, { count: b, color: 'silver' }]} numbered />
    }
    case 'sub': {
      const { a, b } = fact
      if (a > 10 && a - b < 10) {
        const down = a - 10
        return (
          <figure className="hint">
            <TenFrames
              groups={[
                { count: a - b, color: 'pink' },
                { count: b - down, color: 'silver', crossed: true },
                { count: down, color: 'purple', crossed: true },
              ]}
              frames={2}
            />
            <figcaption>
              {a} − <span className="c-purple">{down}</span> − <span className="c-silver">{b - down}</span>
            </figcaption>
          </figure>
        )
      }
      return <TenFrames groups={[{ count: a - b, color: 'pink' }, { count: b, color: 'silver', crossed: true }]} numbered />
    }
    case 'split':
      return <TenFrames groups={[{ count: fact.part, color: 'pink' }, { count: fact.total - fact.part, color: 'purple' }]} numbered />
    case 'placeValue':
      return (
        <figure className="hint">
          <TenFrames groups={[{ count: Math.min(10, fact.n), color: 'pink' }, { count: Math.max(0, fact.n - 10), color: 'silver' }]} frames={2} />
          <figcaption>
            {fact.n >= 10 ? '10' : '0'} + <span className="c-silver">{fact.n % 10}</span>
          </figcaption>
        </figure>
      )
  }
}

function BigHint({ fact }: { fact: Fact }) {
  switch (fact.kind) {
    case 'add':
      return (
        <figure className="hint">
          <Base10 parts={[{ n: fact.a, color: 'pink' }, { n: fact.b, color: 'silver' }]} />
          <figcaption>
            desiatky: {Math.floor(fact.a / 10) * 10} + {Math.floor(fact.b / 10) * 10}, jednotky: {fact.a % 10} + {fact.b % 10}
          </figcaption>
        </figure>
      )
    case 'sub':
      return (
        <figure className="hint">
          <Base10 parts={[{ n: fact.a - fact.b, color: 'pink' }, { n: fact.b, color: 'silver', crossed: true }]} />
          <figcaption>
            {fact.a} − {Math.floor(fact.b / 10) * 10} − {fact.b % 10}
          </figcaption>
        </figure>
      )
    case 'placeValue':
    case 'count':
      return (
        <figure className="hint">
          <Base10 parts={[{ n: fact.n, color: 'pink' }]} />
          <figcaption>
            {Math.floor(fact.n / 10)} desiatok a {fact.n % 10} jednotiek
          </figcaption>
        </figure>
      )
    default:
      return <BigPicture fact={fact} />
  }
}
