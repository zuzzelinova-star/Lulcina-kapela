import { skillProgress } from '../engine/mastery'
import { currentSkill } from '../engine/mastery'
import { LADDER_INDEX, type GameState } from '../state/game'
import { Fairy, Lightning, Stage, Unicorn } from '../ui/art'

export function Home({ state, onPlay, onPlacement }: { state: GameState; onPlay: () => void; onPlacement: () => void }) {
  const skill = currentSkill(LADDER_INDEX, state.unlockedUpTo, state.items)
  const progress = skillProgress(LADDER_INDEX, skill.id, state.items)
  const inRound = state.round !== null && state.round.index < state.round.tasks.length

  return (
    <main className="screen home">
      <header className="home-header">
        <h1>
          <Lightning size={34} /> Elektrické víly
        </h1>
        <p className="hello">Ahoj, {state.nickname}! Si manažérka kapely.</p>
      </header>
      <Stage>
        <Fairy size={120} />
        <Unicorn size={150} />
      </Stage>
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
            {inRound ? 'Pokračovať v setliste' : 'Hrať setlist'}
          </button>
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
