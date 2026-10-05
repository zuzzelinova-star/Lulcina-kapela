/** Vlastná číselná klávesnica – veľké tlačidlá, žiadna systémová klávesnica. */
export function Keypad({
  value,
  onChange,
  onSubmit,
  maxLength = 3,
  disabled = false,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  maxLength?: number
  disabled?: boolean
}) {
  const press = (d: string) => {
    if (disabled) return
    const next = value === '0' ? d : value + d
    if (next.length <= maxLength) onChange(next)
  }
  return (
    <div className="keypad" aria-label="Číselná klávesnica">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
        <button key={d} type="button" className="key" onClick={() => press(d)} disabled={disabled}>
          {d}
        </button>
      ))}
      <button type="button" className="key key-del" onClick={() => onChange(value.slice(0, -1))} disabled={disabled || value === ''} aria-label="Zmazať">
        ⌫
      </button>
      <button type="button" className="key" onClick={() => press('0')} disabled={disabled}>
        0
      </button>
      <button type="button" className="key key-ok" onClick={onSubmit} disabled={disabled || value === ''} aria-label="Hotovo">
        ✓
      </button>
    </div>
  )
}

export function Choices<T extends string | number>({
  options,
  onPick,
  disabled = false,
  wrong = [],
}: {
  options: T[]
  onPick: (v: T) => void
  disabled?: boolean
  wrong?: T[]
}) {
  return (
    <div className="choices">
      {options.map((o) => (
        <button key={String(o)} type="button" className={`choice ${wrong.includes(o) ? 'choice-wrong' : ''}`} onClick={() => onPick(o)} disabled={disabled || wrong.includes(o)}>
          {o}
        </button>
      ))}
    </div>
  )
}
