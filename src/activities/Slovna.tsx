import { useState } from 'react'
import { resultOf } from '../engine/facts'
import type { ItemResult, Task } from '../engine/types'
import { wordProblem } from '../engine/wordProblems'
import { Fairy, Unicorn } from '../ui/art'
import { Keypad } from '../ui/Keypad'
import { HintPicture } from '../ui/visuals'
import { hash } from './common'
import { BOX, Equation } from './Equation'
import { Feedback } from './Feedback'
import { ActivityHeader } from './Header'
import { useAttempt } from './useAttempt'

/** Slovná úloha z prostredia kapely, s čítaním nahlas. */
export function Slovna({ task, onDone }: { task: Task; onDone: (results: ItemResult[]) => void }) {
  const fact = task.facts[0]
  if (fact.kind !== 'add' && fact.kind !== 'sub') throw new Error('Slovná úloha vie len sčítanie a odčítanie')
  const text = wordProblem(fact, hash(task.id))
  const answer = resultOf(fact) as number
  const [value, setValue] = useState('')
  const { phase, submit, next } = useAttempt((outcome, ms) => onDone([{ itemId: task.itemIds[0], outcome, ms }]))
  const done = phase === 'success' || phase === 'reveal'
  const showMath = phase !== 'ask'

  return (
    <div className="activity">
      <ActivityHeader title="Slovná úloha" prompt="" speech={text} />
      <div className="activity-body">
        <div className="story">
          <div className="story-cast" aria-hidden="true">
            <Fairy size={64} />
            <Unicorn size={78} />
          </div>
          <p className="story-text">{text}</p>
          {showMath && <HintPicture fact={fact} />}
        </div>
        <div className="answer-area">
          {showMath ? (
            <Equation tokens={[fact.a, fact.kind === 'add' ? '+' : '−', fact.b, '=', BOX]} value={done ? String(answer) : value} state={phase === 'success' ? 'ok' : phase === 'reveal' ? 'reveal' : undefined} />
          ) : (
            <Equation tokens={[BOX]} value={value} />
          )}
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
