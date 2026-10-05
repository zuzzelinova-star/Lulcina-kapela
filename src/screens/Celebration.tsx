import { LADDER_INDEX } from '../state/game'
import { Fairy, Lightning, Stage, Star, Unicorn } from '../ui/art'

/** Oslava osvojenej zručnosti: nový koncert. */
export function Celebration({ skillIds, onClose }: { skillIds: string[]; onClose: () => void }) {
  const skills = skillIds.map((id) => LADDER_INDEX.skillById.get(id)!).filter(Boolean)
  const last = skills[skills.length - 1]
  const next = last ? LADDER_INDEX.skills.find((s) => s.order > last.order) : undefined
  return (
    <div className="overlay" role="dialog" aria-label="Nový koncert">
      <div className="celebration">
        <h1>
          <Star size={40} /> Nový koncert! <Star size={40} />
        </h1>
        <Stage>
          <Fairy size={110} />
          <Unicorn size={140} />
        </Stage>
        <p className="intro">Kapela už vie: {skills.map((s) => s.kidTitle).join(', ')}.</p>
        {next && <p className="intro">Ďalšia pesnička: {next.kidTitle}</p>}
        <button type="button" className="btn btn-big" onClick={onClose}>
          Hurá! <Lightning size={30} />
        </button>
      </div>
    </div>
  )
}
