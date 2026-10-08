import { useState } from 'react'
import { resultOf } from '../engine/facts'
import type { ItemResult, Task } from '../engine/types'
import { Lightning } from '../ui/art'
import { TenFrames } from '../ui/visuals'
import { BOX, Equation } from './Equation'
import { Feedback } from './Feedback'
import { ActivityHeader } from './Header'
import { useAttempt } from './useAttempt'

type Pick = 'left' | 'right' | 'same'

/** Kto je hlasnejší: dva reproduktory s číslami, hlasnejší je ten s väčším číslom. */
export function Hlasnejsi({ task, onDone }: { task: Task; onDone: (results: ItemResult[]) => void }) {
  const fact = task.facts[0]
  if (fact.kind !== 'compare') throw new Error('Kto je hlasnejší vie len porovnávanie')
  const sign = resultOf(fact)
  const correct: Pick = sign === '>' ? 'left' : sign === '<' ? 'right' : 'same'
  const [wrong, setWrong] = useState<Pick[]>([])
  const { phase, submit, next } = useAttempt((outcome, ms) => onDone([{ itemId: task.itemIds[0], outcome, ms }]))
  const done = phase === 'success' || phase === 'reveal'
  // Pri malých číslach ukážeme aj bodky (porovnanie na pohľad), pri veľkých stačia čísla.
  const dots = Math.max(fact.a, fact.b) <= 10

  const pick = (p: Pick) => {
    if (done || wrong.includes(p)) return
    if (p !== correct) setWrong((w) => [...w, p])
    submit(p === correct)
  }

  const speaker = (side: 'left' | 'right', n: number) => {
    const loud = done && (correct === side || correct === 'same')
    return (
      <button
        type="button"
        className={`speaker ${loud ? 'speaker-loud' : ''} ${wrong.includes(side) ? 'choice-wrong' : ''}`}
        onClick={() => pick(side)}
        disabled={done || wrong.includes(side)}
        aria-label={`Reproduktor ${n}`}
      >
        <Speaker />
        <span className="speaker-num">{n}</span>
        {dots && <TenFrames groups={[{ count: n, color: side === 'left' ? 'pink' : 'silver' }]} />}
      </button>
    )
  }

  return (
    <div className="activity">
      <ActivityHeader title="Kto je hlasnejší?" prompt="Ťukni na hlasnejší reproduktor." speech={`Kto je hlasnejší? ${fact.a} alebo ${fact.b}?`} />
      <div className="speakers">
        {speaker('left', fact.a)}
        {speaker('right', fact.b)}
      </div>
      {!done && (
        <button type="button" className={`btn same-btn ${wrong.includes('same') ? 'choice-wrong' : ''}`} onClick={() => pick('same')} disabled={wrong.includes('same')}>
          Sú rovnako hlasné
        </button>
      )}
      {done && <Equation tokens={[fact.a, BOX, fact.b]} value={String(sign)} state={phase === 'success' ? 'ok' : 'reveal'} />}
      <Feedback phase={phase} seed={task.id} answer={correct === 'same' ? 'rovnako' : `${Math.max(fact.a, fact.b)}`} onNext={next} />
      {phase === 'success' && (
        <div className="center" aria-hidden="true">
          <Lightning size={34} />
        </div>
      )}
    </div>
  )
}

function Speaker() {
  return (
    <svg viewBox="0 0 80 100" width="56" height="70" aria-hidden="true">
      <rect x="4" y="4" width="72" height="92" rx="10" fill="#141018" stroke="var(--strieborna)" strokeWidth="3" />
      <circle cx="40" cy="30" r="12" fill="#2a2230" stroke="var(--strieborna)" strokeWidth="2" />
      <circle cx="40" cy="30" r="4" fill="var(--ruzova)" />
      <circle cx="40" cy="68" r="20" fill="#2a2230" stroke="var(--strieborna)" strokeWidth="2" />
      <circle cx="40" cy="68" r="7" fill="var(--ruzova)" />
    </svg>
  )
}
