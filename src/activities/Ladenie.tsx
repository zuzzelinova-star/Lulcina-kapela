import { useState } from 'react'
import type { Fact, ItemResult, Task } from '../engine/types'
import { Keypad } from '../ui/Keypad'
import { HintPicture } from '../ui/visuals'
import { hash } from './common'
import { BOX, Equation, type Token } from './Equation'
import { Feedback } from './Feedback'
import { useAttempt } from './useAttempt'

/** Ktoré číslo v príklade chýba a aká je správna odpoveď. */
export function missingNumber(fact: Fact, seed: number): { tokens: Token[]; answer: number } {
  switch (fact.kind) {
    case 'add': {
      const c = fact.a + fact.b
      return seed % 2 === 0 ? { tokens: [fact.a, '+', BOX, '=', c], answer: fact.b } : { tokens: [BOX, '+', fact.b, '=', c], answer: fact.a }
    }
    case 'sub': {
      const c = fact.a - fact.b
      return seed % 2 === 0 ? { tokens: [fact.a, '−', BOX, '=', c], answer: fact.b } : { tokens: [BOX, '−', fact.b, '=', c], answer: fact.a }
    }
    case 'split':
      return { tokens: [fact.total, '=', fact.part, '+', BOX], answer: fact.total - fact.part }
    case 'placeValue': {
      const tens = Math.floor(fact.n / 10) * 10
      const units = fact.n % 10
      return seed % 2 === 0 || units === 0 ? { tokens: [fact.n, '=', tens, '+', BOX], answer: units } : { tokens: [fact.n, '=', BOX, '+', units], answer: tens }
    }
    default:
      throw new Error(`Ladenie nevie zobraziť ${fact.kind}`)
  }
}

/** Ladenie gitary: chýbajúce číslo v príklade (4 + ▢ = 9). */
export function Ladenie({ task, onDone }: { task: Task; onDone: (results: ItemResult[]) => void }) {
  const fact = task.facts[0]
  const { tokens, answer } = missingNumber(fact, hash(task.id))
  const [value, setValue] = useState('')
  const { phase, submit, next } = useAttempt((outcome, ms) => onDone([{ itemId: task.itemIds[0], outcome, ms }]))
  const done = phase === 'success' || phase === 'reveal'

  return (
    <div className="activity">
      <h2 className="activity-title">Ladenie gitary</h2>
      <p className="prompt">Ktoré číslo chýba?</p>
      <div className="activity-body">
        <div className="picture">
          {phase === 'hint' || phase === 'reveal' ? <HintPicture fact={fact} /> : <GuitarNeck tuned={phase === 'success'} />}
        </div>
        <div className="answer-area">
          <Equation tokens={tokens} value={done ? String(answer) : value} state={phase === 'success' ? 'ok' : phase === 'reveal' ? 'reveal' : undefined} />
          {!done && (
            <Keypad
              value={value}
              onChange={setValue}
              onSubmit={() => {
                const ok = Number(value) === answer
                if (!ok) setValue('')
                submit(ok)
              }}
            />
          )}
          <Feedback phase={phase} seed={task.id} answer={String(answer)} onNext={next} />
        </div>
      </div>
    </div>
  )
}

/** Krk gitary s ladiacimi kolíkmi; po správnej odpovedi struny zažiaria. */
function GuitarNeck({ tuned }: { tuned: boolean }) {
  return (
    <svg viewBox="0 0 300 120" className={`guitar-neck ${tuned ? 'tuned' : ''}`} role="img" aria-label="Gitara">
      <rect x="10" y="30" width="230" height="60" rx="6" fill="#2a1a10" stroke="#141018" strokeWidth="3" />
      {[60, 110, 160, 210].map((x) => (
        <rect key={x} x={x} y="30" width="4" height="60" fill="var(--strieborna)" />
      ))}
      <path d="M240 24 L292 14 L292 106 L240 96 Z" fill="#141018" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <line x1="10" x2="262" y1={38 + i * 9} y2={38 + i * 9} className="string" stroke="var(--strieborna)" strokeWidth={1 + i * 0.3} />
          <circle cx={i < 3 ? 256 + i * 12 : 256 + (i - 3) * 12} cy={i < 3 ? 12 : 108} r="7" fill="var(--ruzova)" />
        </g>
      ))}
    </svg>
  )
}
