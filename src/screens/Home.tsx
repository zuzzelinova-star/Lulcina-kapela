import { currentSkill, skillProgress } from '../engine/mastery'
import { CONCERT_MIN_ITEMS, concertPool } from '../engine/setlist'
import { LADDER_INDEX, type GameState } from '../state/game'
import { Lightning } from '../ui/art'
import { BandStage } from '../ui/band'
import { Wallet } from './Shop'

export function Home({
  state,
  today,
  onPlay,
  onPlacement,
  onShop,
  onConcert,
}: {
  state: GameState
  today: string
  onPlay: () => void
  onPlacement: () => void
  onShop: () => void
  onConcert: () => void
}) {
  const skill = currentSkill(LADDER_INDEX, state.unlockedUpTo, state.items)
  const progress = skillProgress(LADDER_INDEX, skill.id, state.items)
  const inRound = state.round !== null && state.round.index < state.round.tasks.length
  const canConcert = concertPool(LADDER_INDEX, state.items, state.unlockedUpTo).length >= CONCERT_MIN_ITEMS
  const snack = state.snack?.day === today ? state.snack.id : null

  return (
    <main className="screen home">
      <header className="home-header">
        <div className="home-top">
          <h1>
            <Lightning size={34} /> Elektrické víly
          </h1>
          {state.placementDone && <Wallet money={state.money} />}
        </div>
        <p className="hello">Ahoj, {state.nickname}! Si manažérka kapely.</p>
      </header>
      <BandStage owned={state.owned} snack={snack} />
      {state.placementDone ? (
        <>
          <section className="now-learning">
            <div className="now-label">Kapela nacvičuje</div>
            <div className="now-skill">{skill.kidTitle}</div>
            <div className="meter" aria-label={`Hotovo ${progress.mastered} z ${progress.total}`}>
              <div className="meter-fill" style={{ width: `${Math.round(progress.ratio * 100)}%` }} />
            </div>
          </section>
          <button type="button" className="btn btn-big" onClick={onPlay}>
            {inRound && state.round?.kind === 'setlist' ? 'Pokračovať v setliste' : inRound ? 'Pokračovať v koncerte' : 'Hrať setlist'}
          </button>
          <div className="home-row">
            <button type="button" className="btn" onClick={onShop}>
              Obchod
            </button>
            {canConcert && !inRound && (
              <button type="button" className="btn" onClick={onConcert}>
                Koncert
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="intro">Kapela hľadá manažérku. Ukáž, čo vieš!</p>
          <button type="button" className="btn btn-big" onClick={onPlacement}>
            Ísť na konkurz
          </button>
        </>
      )}
      <footer className="build">Verzia {__BUILD_ID__}</footer>
    </main>
  )
}
