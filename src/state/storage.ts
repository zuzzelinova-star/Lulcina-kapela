import { initialState, type GameState } from './game'

const KEY = 'lulcina-kapela:v1'

/** Načíta uložený stav. Ak nič nie je alebo je poškodený, začne odznova. */
export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return initialState()
    const parsed = JSON.parse(raw) as Partial<GameState>
    if (parsed.version !== 1) return initialState()
    return { ...initialState(), ...parsed }
  } catch {
    return initialState()
  }
}

export function saveState(state: GameState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Plné alebo zablokované úložisko – hra beží ďalej, len sa neuloží.
  }
}
