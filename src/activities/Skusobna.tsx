import { useState } from 'react'
import { resultOf } from '../engine/facts'
import type { Answer, Fact, ItemResult, Task } from '../engine/types'
import { Choices, Keypad } from '../ui/Keypad'
import { FactPicture, HintPicture } from '../ui/visuals'
import { hash, numberOptions, promptFor, speechFor } from './common'
import { BOX, Equation, type Token } from './Equation'
import { Feedback } from './Feedback'
import { ActivityHeader } from './Header'
import { useAttempt } from './useAttempt'

function tokensFor(fact: Fact): Token[] {
  switch (fact.kind) {
    case 'count':
    case 'placeValue':
      return [BOX]
    case 'compare':
      return [fact.a, BOX, fact.b]
    case 'add':
      return [fact.a, '+', fact.b, '=', BOX]
    case 'sub':
      return [fact.a, '−', fact.b, '=', BOX]
    case 'split':
      return [fact.total, '=', fact.part, '+', BOX]
  }
}

/** Skúšobňa: príklad s bodkami alebo desiatkovým rámčekom. */
export function Skusobna({ task, onDone }: { task: Task; onDone: (results: ItemResult[]) => void }) {
  const fact = task.facts[0]
  const correct = resultOf(fact)
  const [value, setValue] = useState('')
  const [wrong, setWrong] = useState<Answer[]>([])
  const { phase, submit, next } = useAttempt((outcome, ms) => onDone([{ itemId: task.itemIds[0], outcome, ms }]))
  // Pri počte a malých príkladoch niekedy výber z možností, inak klávesnica.
  const useChoices = fact.kind === 'compare' || ((fact.kind === 'count' || fact.kind === 'placeValue') && hash(task.id) % 2 === 0) || hash(task.id) % 4 === 0
  const answer = (v: Answer) => {
    const ok = v === correct
    if (!ok) setWrong((w) => [...w, v])
    if (!ok) setValue('')
    submit(ok)
  }
  const done = phase === 'success' || phase === 'reveal'
  const shown = phase === 'reveal' ? String(correct) : phase === 'success' ? String(correct) : useChoices ? '' : value

  return (
    <div className="activity">
      <ActivityHeader title="Skúšobňa" prompt={fact.kind === 'compare' ? 'Ktoré číslo je väčšie? Vyber znak.' : promptFor(fact)} speech={speechFor(fact)} />
      <div className="activity-body">
        <div className="picture">{phase === 'ask' || phase === 'success' ? <FactPicture fact={fact} /> : <HintPicture fact={fact} />}</div>
        <div className="answer-area">
          <Equation tokens={tokensFor(fact)} value={shown} state={phase === 'success' ? 'ok' : phase === 'reveal' ? 'reveal' : undefined} />
          {!done &&
            (useChoices ? (
              <Choices<Answer> options={fact.kind === 'compare' ? ['<', '=', '>'] : numberOptions(fact, task.id)} onPick={answer} wrong={wrong} />
            ) : (
              <Keypad value={value} onChange={setValue} onSubmit={() => answer(Number(value))} />
            ))}
          <Feedback phase={phase} seed={task.id} answer={String(correct)} onNext={next} />
        </div>
      </div>
    </div>
  )
}
