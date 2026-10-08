import { useRef, useState } from 'react'
import { stairsJumps } from '../engine/activities'
import type { ItemResult, Outcome, Task } from '../engine/types'
import { Keypad } from '../ui/Keypad'
import { sfx } from '../ui/sound'
import { stopSpeaking } from '../ui/speech'
import { Lightning } from '../ui/art'
import { BOX, Equation, type Token } from './Equation'
import { praise } from './Feedback'
import { ActivityHeader } from './Header'

interface Step {
  prompt: string
  tokens: Token[]
  answer: number
  /** Kam víla doskočí po správnej odpovedi. */
  landTo: number
}

/**
 * Schody na pódium: víla skáče po číselnej osi.
 * Pri prechode cez 10 dva kroky: najprv „koľko do 10“, potom „kde skončí“ (8 + 2 + 3).
 */
export function Schody({ task, onDone }: { task: Task; onDone: (results: ItemResult[]) => void }) {
  const fact = task.facts[0]
  if (fact.kind !== 'add' && fact.kind !== 'sub') throw new Error('Schody vedia len sčítanie a odčítanie')
  const { top, jumps } = stairsJumps(fact)
  const plus = fact.kind === 'add'
  const end = plus ? fact.a + fact.b : fact.a - fact.b
  const op = plus ? '+' : '−'
  const steps: Step[] =
    jumps.length === 1
      ? [{ prompt: `Víla skočí o ${fact.b} ${plus ? 'hore' : 'dole'}. Kde bude?`, tokens: [fact.a, op, fact.b, '=', BOX], answer: end, landTo: end }]
      : [
          {
            prompt: plus ? 'Koľko schodov je do 10?' : 'Koľko schodov je dole na 10?',
            tokens: [fact.a, op, BOX, '=', 10],
            answer: Math.abs(10 - fact.a),
            landTo: 10,
          },
          {
            prompt: 'A teraz zvyšok. Kde skončí?',
            tokens: [fact.a, op, Math.abs(10 - fact.a), op, Math.abs(end - 10), '=', BOX],
            answer: end,
            landTo: end,
          },
        ]

  const [stepIndex, setStepIndex] = useState(0)
  const [pos, setPos] = useState(fact.a)
  const [value, setValue] = useState('')
  const [phase, setPhase] = useState<'ask' | 'hint' | 'ok' | 'reveal'>('ask')
  const worst = useRef<Outcome>('correct')
  const started = useRef(performance.now())
  const firstMs = useRef<number | null>(null)
  const sent = useRef(false)
  const step = steps[stepIndex]
  const last = stepIndex === steps.length - 1

  const finish = () => {
    if (sent.current) return
    sent.current = true
    onDone([{ itemId: task.itemIds[0], outcome: worst.current, ms: firstMs.current ?? 0 }])
  }

  const advance = () => {
    setPos(step.landTo)
    if (last) {
      setTimeout(finish, 900)
    } else {
      setTimeout(() => {
        setStepIndex((i) => i + 1)
        setValue('')
        setPhase('ask')
      }, 900)
    }
  }

  const submit = () => {
    if (phase === 'ok' || phase === 'reveal') return
    stopSpeaking()
    if (firstMs.current === null) firstMs.current = performance.now() - started.current
    if (Number(value) === step.answer) {
      sfx.correct()
      setPhase('ok')
      advance()
      return
    }
    sfx.soft()
    setValue('')
    if (phase === 'ask') {
      if (worst.current === 'correct') worst.current = 'hinted'
      setPhase('hint')
    } else {
      worst.current = 'wrong'
      setPhase('reveal')
    }
  }

  const highlight = phase === 'hint' || phase === 'reveal' ? step.landTo : null

  return (
    <div className="activity">
      <ActivityHeader title="Schody na pódium" prompt={step.prompt} speech={`Víla stojí na schode ${pos}. ${step.prompt}`} />
      <div className="activity-body">
        <div className="picture">
          <Stairs top={top} pos={pos} highlight={highlight} from={jumps[Math.min(stepIndex, jumps.length - 1)].from} />
        </div>
        <div className="answer-area">
          <Equation tokens={step.tokens} value={phase === 'ok' || phase === 'reveal' ? String(step.answer) : value} state={phase === 'ok' ? 'ok' : phase === 'reveal' ? 'reveal' : undefined} />
          {(phase === 'ask' || phase === 'hint') && <Keypad value={value} onChange={setValue} onSubmit={submit} />}
          {phase === 'hint' && (
            <div className="feedback feedback-hint" role="status">
              Skoro! Pozri sa na svietiaci schod a skús ešte raz.
            </div>
          )}
          {phase === 'ok' && (
            <div className="feedback feedback-ok" role="status">
              <Lightning size={30} /> {praise(`${task.id}${stepIndex}`)}
            </div>
          )}
          {phase === 'reveal' && (
            <div className="feedback feedback-reveal" role="status">
              <div>
                Nevadí! Správne je <strong>{step.answer}</strong>.
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setPhase('ok')
                  advance()
                }}
              >
                Ďalej <Lightning size={28} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/** Schody 0–10 alebo 0–20 s vílou (hviezdou) na aktuálnom schode. */
function Stairs({ top, pos, highlight, from }: { top: number; pos: number; highlight: number | null; from: number }) {
  const n = top + 1
  const w = 300 / n
  const stepH = top === 10 ? 9 : 5
  const base = 150
  const x = (i: number) => 10 + i * w
  const y = (i: number) => base - i * stepH
  return (
    <svg className="stairs" viewBox="0 0 320 175" role="img" aria-label={`Schody, víla je na schode ${pos}`}>
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>
          <rect
            x={x(i)}
            y={y(i)}
            width={w - 1.5}
            height={base - y(i) + 8}
            rx="2"
            fill={i === 10 ? '#5a2a9a' : i === highlight ? 'var(--ruzova)' : '#2c1650'}
            stroke={i === highlight ? '#fff' : 'rgba(200,200,220,0.4)'}
            strokeWidth={i === highlight ? 2 : 1}
          />
          <text x={x(i) + w / 2 - 0.75} y="172" textAnchor="middle" fontSize={top === 10 ? 13 : 9} fontWeight="700" fill={i === 10 ? 'var(--ruzova)' : 'var(--biela)'}>
            {i}
          </text>
        </g>
      ))}
      {/* oblúk skoku pri nápovede */}
      {highlight !== null && (
        <path
          d={`M${x(from) + w / 2} ${y(from) - 4} Q${(x(from) + x(highlight)) / 2 + w / 2} ${Math.min(y(from), y(highlight)) - 40} ${x(highlight) + w / 2} ${y(highlight) - 4}`}
          fill="none"
          stroke="var(--ruzova)"
          strokeWidth="2.5"
          strokeDasharray="5 4"
        />
      )}
      {/* víla ako hviezda s krídlami */}
      <g className="stairs-fairy" style={{ transform: `translate(${x(pos) + w / 2}px, ${y(pos) - 14}px)` }}>
        <ellipse cx="-8" cy="-2" rx="8" ry="5" fill="#ffb3f0" opacity="0.7" />
        <ellipse cx="8" cy="-2" rx="8" ry="5" fill="#ffb3f0" opacity="0.7" />
        <circle cx="0" cy="-6" r="6" fill="#f5d0b5" />
        <path d="M-6 -7 Q0 -16 6 -7" fill="#7a2fd0" />
        <polygon points="-5,0 5,0 7,10 -7,10" fill="#2a1446" />
      </g>
    </svg>
  )
}
