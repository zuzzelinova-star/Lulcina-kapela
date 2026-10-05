import { useEffect, useState } from 'react'
import { resultOf } from '../engine/facts'
import type { Answer, Fact } from '../engine/types'
import { LADDER_INDEX, type PlacementState } from '../state/game'
import { Fairy, Lightning, Star, Unicorn } from '../ui/art'
import { Choices, Keypad } from '../ui/Keypad'
import { FactPicture } from '../ui/visuals'
import { BOX, Equation, type Token } from '../activities/Equation'
import { praise } from '../activities/Feedback'
import { promptFor } from '../activities/common'

function tokens(fact: Fact): Token[] {
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

/** Konkurz do kapely – rozraďovacia hra bez nápovedí, chyba nič nestojí. */
export function Placement({
  placement,
  onStart,
  onAnswer,
  onFinish,
}: {
  placement: PlacementState | null
  onStart: () => void
  onAnswer: (correct: boolean) => void
  onFinish: () => void
}) {
  if (!placement) {
    return (
      <main className="screen center">
        <h1>Konkurz do kapely</h1>
        <div className="cast-row">
          <Unicorn size={130} />
          <Fairy size={110} />
        </div>
        <p className="intro">Kapela potrebuje manažérku, ktorá vie počítať. Vyskúšame pár úloh. Nič sa nedá pokaziť!</p>
        <button type="button" className="btn btn-big" onClick={onStart}>
          Začať konkurz
        </button>
      </main>
    )
  }
  if (!placement.question) {
    const passed = placement.progress.passedUpTo
    const next = LADDER_INDEX.skills.find((s) => s.order > passed) ?? LADDER_INDEX.skills[LADDER_INDEX.skills.length - 1]
    return (
      <main className="screen center">
        <h1>
          <Star size={40} /> Si v kapele! <Star size={40} />
        </h1>
        <div className="cast-row">
          <Unicorn size={130} />
          <Fairy size={110} />
        </div>
        <p className="intro">Kapela začne nacvičovať: {next.kidTitle}.</p>
        <button type="button" className="btn btn-big" onClick={onFinish}>
          Na pódium <Lightning size={30} />
        </button>
      </main>
    )
  }
  return <PlacementQuestion key={placement.progress.usedItems.length} fact={placement.question.fact} count={placement.progress.usedItems.length} onAnswer={onAnswer} />
}

function PlacementQuestion({ fact, count, onAnswer }: { fact: Fact; count: number; onAnswer: (correct: boolean) => void }) {
  const [value, setValue] = useState('')
  const [result, setResult] = useState<null | boolean>(null)
  const correct = resultOf(fact)
  const showPicture = fact.kind === 'count' || fact.kind === 'compare'
  const choices = fact.kind === 'compare'

  useEffect(() => {
    if (result === null) return
    const t = setTimeout(() => onAnswer(result), result ? 800 : 1400)
    return () => clearTimeout(t)
  }, [result, onAnswer])

  const answer = (v: Answer) => {
    if (result !== null) return
    setResult(v === correct)
  }

  return (
    <main className="screen">
      <div className="activity">
        <h2 className="activity-title">Konkurz · úloha {count + 1}</h2>
        <p className="prompt">{fact.kind === 'compare' ? 'Ktoré číslo je väčšie? Vyber znak.' : promptFor(fact)}</p>
        <div className="activity-body">
          {showPicture && (
            <div className="picture">
              <FactPicture fact={fact} />
            </div>
          )}
          <div className="answer-area">
            <Equation tokens={tokens(fact)} value={result === null ? (choices ? '' : value) : String(correct)} state={result === null ? undefined : result ? 'ok' : 'reveal'} />
            {result === null &&
              (choices ? (
                <Choices<Answer> options={['<', '=', '>']} onPick={answer} />
              ) : (
                <Keypad value={value} onChange={setValue} onSubmit={() => answer(Number(value))} />
              ))}
            {result === true && (
              <div className="feedback feedback-ok">
                <Star size={32} /> {praise(String(count))}
              </div>
            )}
            {result === false && <div className="feedback feedback-hint">Nevadí, toto spolu nacvičíme!</div>}
          </div>
        </div>
      </div>
    </main>
  )
}
