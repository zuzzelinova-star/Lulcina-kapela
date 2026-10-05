import { useCallback, useEffect, useReducer, useState } from 'react'
import { dayKey } from './engine/dates'
import { randomSeed } from './engine/rng'
import type { ItemResult } from './engine/types'
import { Celebration } from './screens/Celebration'
import { Home } from './screens/Home'
import { Placement } from './screens/Placement'
import { Round } from './screens/Round'
import { reducer } from './state/game'
import { loadState, saveState } from './state/storage'

type Screen = 'home' | 'placement' | 'round'

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  const [screen, setScreen] = useState<Screen>('home')

  useEffect(() => saveState(state), [state])

  // Na skúšanie: adresa s ?reset vymaže progres (po potvrdení).
  useEffect(() => {
    const url = new URL(window.location.href)
    if (!url.searchParams.has('reset')) return
    if (window.confirm('Naozaj vymazať celý progres?')) dispatch({ type: 'reset' })
    url.searchParams.delete('reset')
    window.history.replaceState(null, '', url.toString())
  }, [])

  const onTaskDone = useCallback(
    (results: ItemResult[]) => dispatch({ type: 'taskDone', results, today: dayKey(new Date()), now: Date.now(), seed: randomSeed() }),
    [],
  )
  const onPlacementAnswer = useCallback(
    (correct: boolean) => dispatch({ type: 'placementAnswer', correct, today: dayKey(new Date()), now: Date.now(), seed: randomSeed() }),
    [],
  )

  const play = () => {
    dispatch({ type: 'roundStart', today: dayKey(new Date()), seed: randomSeed() })
    setScreen('round')
  }

  let content
  if (screen === 'placement' || (state.placement && !state.placementDone)) {
    content = (
      <Placement
        placement={state.placement}
        onStart={() => dispatch({ type: 'placementStart', seed: randomSeed() })}
        onAnswer={onPlacementAnswer}
        onFinish={() => {
          dispatch({ type: 'placementFinish' })
          setScreen('home')
        }}
      />
    )
  } else if (screen === 'round' && state.round) {
    content = (
      <Round
        round={state.round}
        onTaskDone={onTaskDone}
        onHome={() => {
          // Dohraný setlist zavrieme, rozohraný ostane na neskôr.
          if (state.round && state.round.index >= state.round.tasks.length) dispatch({ type: 'roundClose' })
          setScreen('home')
        }}
        onNextRound={() => {
          dispatch({ type: 'roundClose' })
          play()
        }}
      />
    )
  } else {
    content = <Home state={state} onPlay={play} onPlacement={() => setScreen('placement')} />
  }

  return (
    <>
      {content}
      {state.celebrate.length > 0 && <Celebration skillIds={state.celebrate} onClose={() => dispatch({ type: 'celebrationSeen' })} />}
    </>
  )
}
