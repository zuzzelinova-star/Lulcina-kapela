import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relatívna base cesta, aby appka fungovala na GitHub Pages (/Lulcina-kapela/) aj lokálne.
export default defineConfig({
  base: './',
  plugins: [react()],
  define: {
    // Krátky identifikátor buildu, aby sa na iPhone dalo overiť, že beží najnovšia verzia.
    __BUILD_ID__: JSON.stringify(
      `${(process.env.GITHUB_SHA ?? 'lokálne').slice(0, 7)} · ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`,
    ),
  },
})
