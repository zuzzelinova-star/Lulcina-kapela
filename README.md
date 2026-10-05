# Lulčina kapela

Matematická hra pre Lulu (2. ročník ZŠ). Zadanie: [SPEC.md](SPEC.md).

Živá verzia: https://zuzzelinova-star.github.io/Lulcina-kapela/

Každý push do `main` sa automaticky nasadí cez GitHub Actions (`.github/workflows/deploy.yml`).

## Lokálne

```sh
npm install
npm run dev     # vývojový server
npm test        # unit testy
npm run build   # produkčný build do dist/
```

## Štruktúra

- `src/content/ladder.ts` – rebrík zručností (dáta; nová zručnosť = nový záznam).
- `src/engine/` – čisté funkcie bez UI: generátor príkladov, Leitnerove úrovne, opakovanie, setlist, konkurz. Testy sú vedľa (`*.test.ts`).
- `src/state/` – stav hry a ukladanie do `localStorage`.
- `src/activities/`, `src/screens/`, `src/ui/` – obrazovky, aktivity a SVG grafika.

## Skúšanie

Adresa s `?reset` na konci (napr. `…/Lulcina-kapela/?reset`) po potvrdení vymaže celý progres a hra začne konkurzom.
