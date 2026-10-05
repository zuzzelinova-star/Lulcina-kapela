/** Príklad s políčkom ▢, do ktorého sa píše odpoveď. */
export type Token = string | number | { box: true }

export function Equation({ tokens, value, state }: { tokens: Token[]; value: string; state?: 'ok' | 'bad' | 'reveal' }) {
  return (
    <div className="equation" aria-live="polite">
      {tokens.map((t, i) =>
        typeof t === 'object' ? (
          <span key={i} className={`box ${state ? `box-${state}` : ''}`}>
            {value || ' '}
          </span>
        ) : (
          <span key={i} className="eq-part">
            {t}
          </span>
        ),
      )}
    </div>
  )
}

export const BOX: Token = { box: true }
