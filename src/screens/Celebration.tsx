import { LADDER_INDEX } from '../state/game'
import { Lightning, Star } from '../ui/art'
import { BandStage } from '../ui/band'

/** Oslava osvojenej zručnosti: nový koncert. */
export function Celebration({
  skillIds,
  owned,
  canConcert,
  onConcert,
  onClose,
}: {
  skillIds: string[]
  owned: string[]
  canConcert: boolean
  onConcert: () => void
  onClose: () => void
}) {
  const skills = skillIds.map((id) => LADDER_INDEX.skillById.get(id)!).filter(Boolean)
  const last = skills[skills.length - 1]
  const next = last ? LADDER_INDEX.skills.find((s) => s.order > last.order) : undefined
  return (
    <div className="overlay" role="dialog" aria-label="Nový koncert">
      <div className="celebration">
        <h1>
          <Star size={40} /> Nový koncert! <Star size={40} />
        </h1>
        <BandStage owned={owned} playing />
        <p className="intro">Kapela už vie: {skills.map((s) => s.kidTitle).join(', ')}.</p>
        {next && <p className="intro">Ďalšia pesnička: {next.kidTitle}</p>}
        {canConcert ? (
          <div className="btn-row">
            <button type="button" className="btn btn-big" onClick={onConcert}>
              Zahrať koncert <Lightning size={30} />
            </button>
            <button type="button" className="btn" onClick={onClose}>
              Neskôr
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-big" onClick={onClose}>
            Hurá! <Lightning size={30} />
          </button>
        )}
      </div>
    </div>
  )
}
