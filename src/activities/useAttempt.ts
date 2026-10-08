import { useEffect, useRef, useState } from 'react'
import type { Outcome } from '../engine/types'
import { sfx } from '../ui/sound'
import { stopSpeaking } from '../ui/speech'

export type Phase = 'ask' | 'hint' | 'success' | 'reveal'

/**
 * Spoločný priebeh jednej odpovede:
 * 1. pokus → pri chybe nápoveda (obrázok) → 2. pokus → pri chybe ukážeme správnu odpoveď s obrázkom.
 * Čas meriame potichu od zobrazenia po prvú odpoveď.
 */
export function useAttempt(onFinish: (outcome: Outcome, ms: number) => void) {
  const [phase, setPhase] = useState<Phase>('ask')
  const started = useRef(performance.now())
  const firstMs = useRef<number | null>(null)
  const outcome = useRef<Outcome>('correct')
  const finished = useRef(false)

  const finish = () => {
    if (finished.current) return
    finished.current = true
    onFinish(outcome.current, firstMs.current ?? performance.now() - started.current)
  }

  useEffect(() => {
    if (phase !== 'success') return
    const t = setTimeout(finish, 900)
    return () => clearTimeout(t)
  }, [phase])

  const submit = (correct: boolean) => {
    if (phase === 'success' || phase === 'reveal') return
    if (firstMs.current === null) firstMs.current = performance.now() - started.current
    stopSpeaking()
    if (correct) {
      outcome.current = phase === 'ask' ? 'correct' : 'hinted'
      sfx.correct()
      setPhase('success')
    } else if (phase === 'ask') {
      sfx.soft()
      setPhase('hint')
    } else {
      sfx.soft()
      outcome.current = 'wrong'
      setPhase('reveal')
    }
  }

  return { phase, submit, next: finish }
}
