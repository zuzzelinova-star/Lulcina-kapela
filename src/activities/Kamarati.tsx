import { useEffect, useMemo, useRef, useState } from 'react'
import { pairKey, pairLeft } from '../engine/activities'
import { mulberry32, shuffle } from '../engine/rng'
import type { ItemResult, Outcome, Task } from '../engine/types'
import { Lightning, Note, Star } from '../ui/art'
import { HintPicture } from '../ui/visuals'
import { hash } from './common'
import { praise } from './Feedback'

/** Kamaráti: spájanie nôt, ktoré spolu dajú rovnaké číslo (najprv 10, neskôr iné). */
export function Kamarati({ task, onDone }: { task: Task; onDone: (results: ItemResult[]) => void }) {
  const total = pairKey(task.facts[0])!
  const { lefts, rights } = useMemo(() => {
    const rng = mulberry32(hash(task.id))
    const l = task.facts.map((f, i) => ({ item: i, value: pairLeft(f) }))
    const r = task.facts.map((f, i) => ({ item: i, value: total - pairLeft(f) }))
    return { lefts: shuffle(rng, l), rights: shuffle(rng, r) }
  }, [task, total])

  const [selLeft, setSelLeft] = useState<number | null>(null)
  const [selRight, setSelRight] = useState<number | null>(null)
  /** item index → index pravej noty, s ktorou je spojený */
  const [matched, setMatched] = useState<Record<number, number>>({})
  const [misses, setMisses] = useState<Record<number, number>>({})
  const [help, setHelp] = useState<{ item: number; kind: 'hint' | 'reveal' } | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const results = useRef<Record<number, { outcome: Outcome; ms: number }>>({})
  const firstMs = useRef<Record<number, number>>({})
  const lastEvent = useRef(performance.now())
  const doneSent = useRef(false)

  const allMatched = Object.keys(matched).length === task.facts.length

  useEffect(() => {
    if (!allMatched || help || doneSent.current) return
    const t = setTimeout(() => {
      doneSent.current = true
      onDone(task.itemIds.map((itemId, i) => ({ itemId, ...results.current[i] })))
    }, 1000)
    return () => clearTimeout(t)
  }, [allMatched, help, onDone, task.itemIds])

  const tryPair = (li: number, ri: number) => {
    const left = lefts[li]
    const right = rights[ri]
    const item = left.item
    if (firstMs.current[item] === undefined) firstMs.current[item] = performance.now() - lastEvent.current
    setSelLeft(null)
    setSelRight(null)
    if (left.value + right.value === total) {
      const m = misses[item] ?? 0
      results.current[item] = { outcome: m === 0 ? 'correct' : 'hinted', ms: firstMs.current[item] }
      setMatched((x) => ({ ...x, [item]: ri }))
      setHelp(null)
      setFlash(praise(`${task.id}${item}`))
      lastEvent.current = performance.now()
      return
    }
    const m = (misses[item] ?? 0) + 1
    setMisses((x) => ({ ...x, [item]: m }))
    if (m === 1) {
      setHelp({ item, kind: 'hint' })
      setFlash(null)
    } else {
      // Druhá chyba: ukážeme správneho kamaráta s obrázkom.
      const correctRi = rights.findIndex((r, idx) => r.value === total - left.value && !Object.values(matched).includes(idx))
      results.current[item] = { outcome: 'wrong', ms: firstMs.current[item] }
      setMatched((x) => ({ ...x, [item]: correctRi }))
      setHelp({ item, kind: 'reveal' })
      setFlash(null)
      lastEvent.current = performance.now()
    }
  }

  const pickLeft = (li: number) => {
    if (matched[lefts[li].item] !== undefined) return
    if (help?.kind === 'hint') setHelp(null)
    if (selRight !== null) tryPair(li, selRight)
    else setSelLeft(li)
  }
  const pickRight = (ri: number) => {
    if (Object.values(matched).includes(ri)) return
    if (help?.kind === 'hint') setHelp(null)
    if (selLeft !== null) tryPair(selLeft, ri)
    else setSelRight(ri)
  }

  const helpFact = help ? task.facts[help.item] : null
  const helpLeft = help ? pairLeft(task.facts[help.item]) : 0

  return (
    <div className="activity">
      <h2 className="activity-title">Kamaráti do {total}</h2>
      <p className="prompt">Spoj noty, ktoré spolu dajú {total}.</p>
      <div className="kamarati">
        <div className="notes">
          {lefts.map((l, li) => {
            const isMatched = matched[l.item] !== undefined
            return (
              <button
                key={li}
                type="button"
                className={`note-btn ${selLeft === li ? 'selected' : ''} ${isMatched ? 'matched' : ''}`}
                onClick={() => pickLeft(li)}
                disabled={isMatched}
              >
                <Note size={30} /> {l.value}
              </button>
            )
          })}
        </div>
        <div className="kamarati-mid" aria-hidden="true">
          <Lightning size={36} />
          <span className="kamarati-total">{total}</span>
        </div>
        <div className="notes">
          {rights.map((r, ri) => {
            const isMatched = Object.values(matched).includes(ri)
            return (
              <button
                key={ri}
                type="button"
                className={`note-btn note-right ${selRight === ri ? 'selected' : ''} ${isMatched ? 'matched' : ''}`}
                onClick={() => pickRight(ri)}
                disabled={isMatched}
              >
                <Note size={30} color="var(--strieborna)" /> {r.value}
              </button>
            )
          })}
        </div>
      </div>
      {help && helpFact && (
        <div className={`feedback ${help.kind === 'hint' ? 'feedback-hint' : 'feedback-reveal'}`} role="status">
          <div className="picture picture-small">
            <HintPicture fact={helpFact} />
          </div>
          {help.kind === 'hint' ? (
            <div>
              Skoro! Koľko treba k {helpLeft}, aby bolo {total}?
            </div>
          ) : (
            <>
              <div>
                Nevadí! {helpLeft} a <strong>{total - helpLeft}</strong> sú kamaráti.
              </div>
              <button type="button" className="btn btn-primary" onClick={() => setHelp(null)}>
                Ďalej <Lightning size={28} />
              </button>
            </>
          )}
        </div>
      )}
      {!help && flash && (
        <div className="feedback feedback-ok" role="status">
          <Star size={30} /> {allMatched ? 'Všetci kamaráti sú spolu!' : flash}
        </div>
      )}
    </div>
  )
}
