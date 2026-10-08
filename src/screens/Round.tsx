import { useCallback, useEffect, useRef, useState } from 'react'
import { Hlasnejsi } from '../activities/Hlasnejsi'
import { Kamarati } from '../activities/Kamarati'
import { Ladenie } from '../activities/Ladenie'
import { Schody } from '../activities/Schody'
import { Skusobna } from '../activities/Skusobna'
import { Slovna } from '../activities/Slovna'
import { formatMoney } from '../engine/money'
import type { ItemResult, Task } from '../engine/types'
import type { RoundState } from '../state/game'
import { Lightning, Star } from '../ui/art'
import { BandStage } from '../ui/band'
import { sfx } from '../ui/sound'
import { Wallet } from './Shop'

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
    case 'schody':
      return <Schody task={task} onDone={onDone} />
    case 'slovna':
      return <Slovna task={task} onDone={onDone} />
    default:
      return <Skusobna task={task} onDone={onDone} />
  }
}

/** Krátko ukáže „+2 €“, keď pribudnú peniaze. */
function useEarnPop(money: number): number | null {
  const prev = useRef(money)
  const [pop, setPop] = useState<number | null>(null)
  useEffect(() => {
    const diff = money - prev.current
    prev.current = money
    if (diff <= 0) return
    sfx.coin()
    setPop(diff)
    const t = setTimeout(() => setPop(null), 1300)
    return () => clearTimeout(t)
  }, [money])
  return pop
}

export function Round({
  round,
  money,
  owned,
  snack,
  onTaskDone,
  onHome,
  onNextRound,
  onShop,
}: {
  round: RoundState
  money: number
  owned: string[]
  snack: string | null
  onTaskDone: (r: ItemResult[]) => void
  onHome: () => void
  onNextRound: () => void
  onShop: () => void
}) {
  const task = round.tasks[round.index]
  const concert = round.kind === 'concert'
  const finished = !task
  // Na koncerte kapela zahrá po každej správnej odpovedi.
  const [playing, setPlaying] = useState(false)
  const done = useCallback(
    (r: ItemResult[]) => {
      if (concert && r.every((x) => x.outcome !== 'wrong')) setPlaying(true)
      onTaskDone(r)
    },
    [onTaskDone, concert],
  )
  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => setPlaying(false), 2200)
    return () => clearTimeout(t)
  }, [playing])
  const pop = useEarnPop(money)

  useEffect(() => {
    if (finished) sfx.cheer()
  }, [finished])

  return (
    <main className={`screen round ${concert ? 'concert' : ''}`}>
      <div className="round-top">
        <button type="button" className="btn btn-ghost" onClick={onHome} aria-label="Domov">
          ⌂
        </button>
        {concert && <div className="concert-title">Koncert</div>}
        <div className="wallet-wrap">
          <Wallet money={money} />
          {pop !== null && <span className="earn-pop">+{formatMoney(pop)}</span>}
        </div>
        <Setlist round={round} />
      </div>
      {concert && task && <BandStage owned={owned} snack={snack} playing={playing} className="stage-small" />}
      {task ? (
        <ActivityView key={task.id} task={task} onDone={done} />
      ) : (
        <section className="center round-done">
          <h1>
            <Star size={44} /> {concert ? 'Koncert skončil!' : 'Setlist dohraný!'} <Star size={44} />
          </h1>
          {!concert && <BandStage owned={owned} snack={snack} playing />}
          <p className="intro">
            {concert ? 'Publikum šalie!' : 'Publikum tlieska.'} Zarobila si <strong>{formatMoney(round.earned)}</strong>.
          </p>
          <div className="btn-row">
            <button type="button" className="btn btn-big" onClick={onShop}>
              Ísť do obchodu <Lightning size={30} />
            </button>
            {!concert && (
              <button type="button" className="btn" onClick={onNextRound}>
                Ďalší setlist
              </button>
            )}
            <button type="button" className="btn" onClick={onHome}>
              Domov
            </button>
          </div>
        </section>
      )}
    </main>
  )
}
