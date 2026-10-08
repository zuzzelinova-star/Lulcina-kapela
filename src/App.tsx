import { useCallback, useEffect, useReducer, useState } from 'react'
import { dayKey } from './engine/dates'
import { moneyStage } from './engine/money'
import { randomSeed } from './engine/rng'
import { CONCERT_MIN_ITEMS, concertPool } from './engine/setlist'
import type { ItemResult } from './engine/types'
import { Celebration } from './screens/Celebration'
import { Home } from './screens/Home'
import { Placement } from './screens/Placement'
import { Round } from './screens/Round'
import { Shop } from './screens/Shop'
import { LADDER_INDEX, reducer } from './state/game'
import { loadState, saveState } from './state/storage'
import { setSoundEnabled } from './ui/sound'
import { initSpeech, setSpeechEnabled, stopSpeaking } from './ui/speech'

type Screen = 'home' | 'placement' | 'round' | 'shop'

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  const [screen, setScreenRaw] = useState<Screen>('home')
  const today = dayKey(new Date())

  const setScreen = (s: Screen) => {
    stopSpeaking()
    window.scrollTo(0, 0)
    setScreenRaw(s)
  }

  useEffect(() => saveState(state), [state])
  useEffect(() => initSpeech(), [])
  useEffect(() => setSoundEnabled(state.settings.sound), [state.settings.sound])
  useEffect(() => setSpeechEnabled(state.settings.speech), [state.settings.speech])

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
  const concert = () => {
    dispatch({ type: 'concertStart', today: dayKey(new Date()), seed: randomSeed() })
    setScreen('round')
  }
  const snack = state.snack?.day === today ? state.snack.id : null
  const roundFinished = state.round !== null && state.round.index >= state.round.tasks.length

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
  } else if (screen === 'shop') {
    content = (
      <Shop
        money={state.money}
        owned={state.owned}
        snack={snack}
        stage={moneyStage(state.unlockedUpTo)}
        onBuy={(itemId) => dispatch({ type: 'buy', itemId, today: dayKey(new Date()) })}
        onBack={() => setScreen('home')}
      />
    )
  } else if (screen === 'round' && state.round) {
    content = (
      <Round
        round={state.round}
        money={state.money}
        owned={state.owned}
        snack={snack}
        onTaskDone={onTaskDone}
        onHome={() => {
          // Dohrané kolo zavrieme, rozohrané ostane na neskôr.
          if (roundFinished) dispatch({ type: 'roundClose' })
          setScreen('home')
        }}
        onNextRound={() => {
          dispatch({ type: 'roundClose' })
          play()
        }}
        onShop={() => {
          dispatch({ type: 'roundClose' })
          setScreen('shop')
        }}
      />
    )
  } else {
    content = (
      <Home
        state={state}
        today={today}
        onPlay={() => {
          if (state.round && !roundFinished) setScreen('round')
          else play()
        }}
        onPlacement={() => setScreen('placement')}
        onShop={() => setScreen('shop')}
        onConcert={concert}
      />
    )
  }

  const canConcert = concertPool(LADDER_INDEX, state.items, state.unlockedUpTo).length >= CONCERT_MIN_ITEMS
  // Oslavu ukážeme až medzi úlohami, nie uprostred koncertu.
  const showCelebration = state.celebrate.length > 0 && !(screen === 'round' && state.round?.kind === 'concert' && !roundFinished)

  return (
    <>
      {content}
      {showCelebration && (
        <Celebration
          skillIds={state.celebrate}
          owned={state.owned}
          canConcert={canConcert && (state.round === null || roundFinished)}
          onConcert={() => {
            dispatch({ type: 'celebrationSeen' })
            dispatch({ type: 'roundClose' })
            concert()
          }}
          onClose={() => dispatch({ type: 'celebrationSeen' })}
        />
      )}
    </>
  )
}
