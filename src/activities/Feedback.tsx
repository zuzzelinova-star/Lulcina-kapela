import { Lightning, Star } from '../ui/art'
import type { Phase } from './useAttempt'

const PRAISE = ['Super!', 'Výborne!', 'Paráda!', 'Rock!', 'Bravó!', 'Presne tak!']

export function praise(seed: string): string {
  let h = 0
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return PRAISE[h % PRAISE.length]
}

/** Krátka správa pod úlohou. Nikdy netrestá. */
export function Feedback({ phase, seed, answer, onNext }: { phase: Phase; seed: string; answer?: string; onNext: () => void }) {
  if (phase === 'success')
    return (
      <div className="feedback feedback-ok" role="status">
        <Star size={36} /> {praise(seed)} <Star size={36} />
      </div>
    )
  if (phase === 'hint')
    return (
      <div className="feedback feedback-hint" role="status">
        Skoro! Pozri sa na obrázok a skús ešte raz.
      </div>
    )
  if (phase === 'reveal')
    return (
      <div className="feedback feedback-reveal" role="status">
        <div>
          Nevadí! Správne je <strong>{answer}</strong>.
        </div>
        <button type="button" className="btn btn-primary" onClick={onNext}>
          Ďalej <Lightning size={28} />
        </button>
      </div>
    )
  return null
}
