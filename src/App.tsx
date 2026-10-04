// Dočasná úvodná obrazovka – overenie, že nasadenie na GitHub Pages funguje.
export default function App() {
  return (
    <main className="placeholder">
      <svg viewBox="0 0 100 100" width="120" height="120" aria-hidden="true">
        <polygon points="55,5 25,55 48,55 40,95 75,40 52,40 62,5" fill="#ff2fd6" stroke="#c0c0d0" strokeWidth="2" />
      </svg>
      <h1>Lulčina kapela</h1>
      <p>Kapela sa pripravuje na prvý koncert…</p>
      <p className="build">Verzia: {__BUILD_ID__}</p>
    </main>
  )
}
