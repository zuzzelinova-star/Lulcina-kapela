import { useCallback } from 'react'
import { Hlasnejsi } from '../activities/Hlasnejsi'
import { Kamarati } from '../activities/Kamarati'
import { Ladenie } from '../activities/Ladenie'
import { Skusobna } from '../activities/Skusobna'
import type { ItemResult, Task } from '../engine/types'
import type { RoundState } from '../state/game'
import { Lightning, Star } from '../ui/art'

function Setlist({ round }: { round: RoundState }) {
  const slots = round.tasks.filter((t) => !t.retry)
  const done = round.tasks.slice(0, round.index).filter((t) => !t.retry).length
  const current = round.tasks[round.index]
  return (
    <ol className="setlist" aria-label={`Setlist: hotovo ${done} z ${slots.length}`}>
      {slots.map((t, i) => (
        <li key={t.id} className={`slot ${i < done ? 'slot-done' : ''} ${t === current ? 'slot-current' : ''}`}>
          {i < done ? '✓' : i + 1}
        </li>
      ))}
      {current?.retry && <li className="slot slot-encore">bis</li>}
    </ol>
  )
}

function ActivityView({ task, onDone }: { task: Task; onDone: (r: ItemResult[]) => void }) {
  switch (task.activity) {
    case 'kamarati':
      return <Kamarati task={task} onDone={onDone} />
    case 'hlasnejsi':
      return <Hlasnejsi task={task} onDone={onDone} />
    case 'ladenie':
      return <Ladenie task={task} onDone={onDone} />
    default:
      return <Skusobna task={task} onDone={onDone} />
  }
}

export function Round({
  round,
  onTaskDone,
  onHome,
  onNextRound,
}: {
  round: RoundState
  onTaskDone: (r: ItemResult[]) => void
  onHome: () => void
  onNextRound: () => void
}) {
  const task = round.tasks[round.index]
  const done = useCallback((r: ItemResult[]) => onTaskDone(r), [onTaskDone])

  return (
    <main className="screen round">
      <div className="round-top">
        <button type="button" className="btn btn-ghost" onClick={onHome} aria-label="Domov">
          ⌂
        </button>
        <Setlist round={round} />
      </div>
      {task ? (
        <ActivityView key={task.id} task={task} onDone={done} />
      ) : (
        <section className="center round-done">
          <h1>
            <Star size={44} /> Setlist dohraný! <Star size={44} />
          </h1>
          <p className="intro">Publikum tlieska. Kapela je čoraz lepšia!</p>
          <div className="btn-row">
            <button type="button" className="btn btn-big" onClick={onNextRound}>
              Ďalší setlist <Lightning size={30} />
            </button>
            <button type="button" className="btn" onClick={onHome}>
              Domov
            </button>
          </div>
        </section>
      )}
    </main>
  )
}
