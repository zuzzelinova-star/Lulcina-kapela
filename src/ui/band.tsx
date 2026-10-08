// Kapela na pódiu podľa toho, čo Lulu kúpila, a obrázky vecí z obchodu.
import { Fairy, Guitar, Stage, Star, Unicorn, type FairyLook, type GuitarKind, type UnicornLook } from './art'

export interface BandProps {
  owned: string[]
  /** Občerstvenie, ktoré je dnes na pódiu. */
  snack?: string | null
  playing?: boolean
  className?: string
}

function fairyGuitar(owned: string[]): GuitarKind {
  if (owned.includes('blesk-gitara')) return 'lightning'
  if (owned.includes('trblietava-gitara')) return 'sparkle'
  return 'basic'
}

export function looks(owned: string[]): { unicorn: UnicornLook; fairy: FairyLook } {
  return {
    unicorn: { sunglasses: owned.includes('okuliare'), scarf: owned.includes('satka'), mic: owned.includes('mikrofon') },
    fairy: { jacket: owned.includes('bunda-vila'), crown: owned.includes('korunka'), instrument: fairyGuitar(owned) },
  }
}

/** Celá kapela na pódiu. */
export function BandStage({ owned, snack, playing, className }: BandProps) {
  const l = looks(owned)
  return (
    <Stage playing={playing} className={className} decor={<Decor owned={owned} snack={snack ?? null} />}>
      {owned.includes('basistka') && <Fairy size={110} look={{ hair: '#d8d8ea', dress: '#6b1f5a', instrument: 'bass' }} label="Basistka Luna" />}
      <Fairy size={110} look={l.fairy} />
      <Unicorn size={140} look={l.unicorn} label="Speváčka jednorožec" />
      {owned.includes('bubenicka') && <Unicorn size={130} look={{ mane: ['#7a2fd0', '#d8d8ea'], instrument: 'drums' }} label="Bubeníčka Iskra" />}
      {owned.includes('klavesistka') && <Unicorn size={130} look={{ mane: ['#40c8f0', 'var(--ruzova)'], instrument: 'keys' }} label="Klávesistka Hviezdička" />}
    </Stage>
  )
}

/** Výzdoba pódia v súradniciach 400 × 220. */
function Decor({ owned, snack }: { owned: string[]; snack: string | null }) {
  return (
    <g>
      {owned.includes('reflektory') && (
        <g className="beam">
          <polygon points="0,0 24,0 170,190 80,190" fill="var(--ruzova)" opacity="0.18" />
          <polygon points="376,0 400,0 320,190 230,190" fill="#9b5be0" opacity="0.22" />
          <polygon points="190,0 210,0 250,190 150,190" fill="#40c8f0" opacity="0.12" />
        </g>
      )}
      {owned.includes('hviezdy') && (
        <g>
          <path d="M0 8 Q100 40 200 10 Q300 40 400 8" fill="none" stroke="var(--strieborna)" strokeWidth="1.5" />
          {[30, 80, 130, 170, 230, 270, 320, 370].map((x, i) => (
            <polygon
              key={x}
              transform={`translate(${x} ${i % 2 ? 22 : 26}) scale(0.12)`}
              points="50,6 62,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 38,38"
              fill={i % 2 ? 'var(--ruzova)' : 'var(--strieborna)'}
            />
          ))}
        </g>
      )}
      {owned.includes('disko-gula') && (
        <g>
          <line x1="200" y1="0" x2="200" y2="18" stroke="var(--strieborna)" strokeWidth="1.5" />
          <circle cx="200" cy="32" r="14" fill="#c8c8dc" />
          {[-8, 0, 8].map((dx) => (
            <line key={dx} x1={200 + dx} y1="19" x2={200 + dx} y2="45" stroke="#8a8aa0" strokeWidth="1" />
          ))}
          {[24, 32, 40].map((y) => (
            <line key={y} x1="186" y1={y} x2="214" y2={y} stroke="#8a8aa0" strokeWidth="1" />
          ))}
          <circle cx="194" cy="26" r="3" fill="#fff" className="twinkle" />
        </g>
      )}
      {owned.includes('napis') && (
        <text x="200" y={owned.includes('disko-gula') ? 66 : 40} textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--ruzova)" className="neon">
          Elektrické víly
        </text>
      )}
      {owned.includes('balony') && (
        <g>
          {[
            [18, 70, 'var(--ruzova)'],
            [36, 58, '#9b5be0'],
            [382, 66, 'var(--strieborna)'],
            [364, 54, 'var(--ruzova)'],
          ].map(([x, y, c], i) => (
            <g key={i}>
              <line x1={x as number} y1={(y as number) + 14} x2={(x as number) + (i < 2 ? 6 : -6)} y2="178" stroke="#c8c8dc" strokeWidth="0.8" />
              <ellipse cx={x as number} cy={y as number} rx="11" ry="14" fill={c as string} />
            </g>
          ))}
        </g>
      )}
      {owned.includes('dym') && (
        <g className="smoke" opacity="0.55">
          {[20, 80, 140, 200, 260, 320, 380].map((x, i) => (
            <ellipse key={x} cx={x} cy={196 + (i % 2) * 4} rx="40" ry="10" fill="#e6e0f5" opacity="0.35" />
          ))}
        </g>
      )}
      {snack && <SnackShape id={snack} x={8} y={150} />}
    </g>
  )
}

function SnackShape({ id, x, y }: { id: string; x: number; y: number }) {
  switch (id) {
    case 'limonada':
      return (
        <g transform={`translate(${x} ${y})`}>
          <path d="M4 0 L24 0 L21 28 L7 28 Z" fill="#fff59a" opacity="0.9" stroke="#fff" />
          <line x1="18" y1="-8" x2="14" y2="14" stroke="var(--ruzova)" strokeWidth="2" />
        </g>
      )
    case 'pizza':
      return (
        <g transform={`translate(${x} ${y + 6})`}>
          <polygon points="0,22 34,22 17,0" fill="#f0b040" />
          <circle cx="14" cy="15" r="2.5" fill="#d03030" />
          <circle cx="21" cy="17" r="2.5" fill="#d03030" />
          <circle cx="17" cy="9" r="2" fill="#d03030" />
        </g>
      )
    case 'torta':
      return (
        <g transform={`translate(${x} ${y})`}>
          <rect x="0" y="12" width="34" height="16" rx="3" fill="var(--ruzova)" />
          <rect x="0" y="10" width="34" height="5" rx="2" fill="#fff" />
          <rect x="15" y="0" width="3" height="10" fill="#fff59a" />
          <circle cx="16.5" cy="-1" r="2" fill="#ffb030" />
        </g>
      )
    default:
      return (
        <g transform={`translate(${x} ${y + 10})`}>
          <circle cx="10" cy="8" r="8" fill="var(--ruzova)" />
          <line x1="10" y1="16" x2="10" y2="28" stroke="#fff" strokeWidth="2" />
        </g>
      )
  }
}

/** Malý obrázok veci v obchode. */
export function ItemIcon({ id, size = 64 }: { id: string; size?: number }) {
  const s = { width: size, height: size }
  switch (id) {
    case 'okuliare':
      return (
        <svg viewBox="0 0 64 64" {...s} aria-hidden="true">
          <rect x="6" y="24" width="22" height="14" rx="6" fill="#1a0b2e" stroke="var(--strieborna)" strokeWidth="2" />
          <rect x="36" y="24" width="22" height="14" rx="6" fill="#1a0b2e" stroke="var(--strieborna)" strokeWidth="2" />
          <line x1="28" y1="29" x2="36" y2="29" stroke="var(--strieborna)" strokeWidth="2" />
          <rect x="10" y="27" width="7" height="3" rx="1.5" fill="#fff" opacity="0.6" />
        </svg>
      )
    case 'satka':
      return (
        <svg viewBox="0 0 64 64" {...s} aria-hidden="true">
          <path d="M6 18 L58 18 L32 54 Z" fill="var(--ruzova)" />
          {[18, 32, 46, 28, 38].map((x, i) => (
            <circle key={i} cx={x} cy={i < 3 ? 24 : 34} r="2" fill="#fff" />
          ))}
        </svg>
      )
    case 'korunka':
      return (
        <svg viewBox="0 0 64 64" {...s} aria-hidden="true">
          <polygon points="8,46 12,18 24,34 32,12 40,34 52,18 56,46" fill="#e8e8f4" stroke="#a8a8c0" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="32" cy="30" r="4" fill="var(--ruzova)" />
        </svg>
      )
    case 'bunda-vila':
      return (
        <svg viewBox="0 0 64 64" {...s} aria-hidden="true">
          <path d="M20 8 L44 8 L58 24 L52 30 L48 26 L48 58 L16 58 L16 26 L12 30 L6 24 Z" fill="#141018" stroke="var(--strieborna)" strokeWidth="1.5" />
          <line x1="32" y1="14" x2="32" y2="58" stroke="var(--strieborna)" strokeWidth="2" strokeDasharray="3 2" />
          <polygon points="38,32 34,40 37,40 35,48 42,38 39,38 41,32" fill="var(--ruzova)" />
        </svg>
      )
    case 'mikrofon':
      return (
        <svg viewBox="0 0 64 64" {...s} aria-hidden="true">
          <ellipse cx="32" cy="16" rx="10" ry="12" fill="#2a2230" stroke="var(--strieborna)" strokeWidth="2" />
          <rect x="28" y="26" width="8" height="30" rx="3" fill="var(--strieborna)" />
          <circle cx="32" cy="14" r="3" fill="var(--ruzova)" />
        </svg>
      )
    case 'trblietava-gitara':
    case 'blesk-gitara':
      return (
        <svg viewBox="0 0 64 64" {...s} aria-hidden="true">
          <Guitar x={2} y={36} scale={0.5} rotate={-20} kind={id === 'blesk-gitara' ? 'lightning' : 'sparkle'} />
        </svg>
      )
    case 'balony':
      return (
        <svg viewBox="0 0 64 64" {...s} aria-hidden="true">
          <ellipse cx="22" cy="22" rx="12" ry="15" fill="var(--ruzova)" />
          <ellipse cx="42" cy="20" rx="12" ry="15" fill="#9b5be0" />
          <path d="M22 37 Q26 48 30 60 M42 35 Q36 48 32 60" stroke="#c8c8dc" fill="none" />
        </svg>
      )
    case 'hviezdy':
      return (
        <svg viewBox="0 0 64 64" {...s} aria-hidden="true">
          <path d="M2 14 Q32 34 62 14" fill="none" stroke="var(--strieborna)" strokeWidth="2" />
          {[
            [12, 20],
            [32, 26],
            [52, 20],
          ].map(([x, y], i) => (
            <polygon key={i} transform={`translate(${x - 9} ${y}) scale(0.18)`} points="50,6 62,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 38,38" fill={i === 1 ? 'var(--ruzova)' : 'var(--strieborna)'} />
          ))}
        </svg>
      )
    case 'disko-gula':
      return (
        <svg viewBox="0 0 64 64" {...s} aria-hidden="true">
          <line x1="32" y1="0" x2="32" y2="12" stroke="var(--strieborna)" strokeWidth="2" />
          <circle cx="32" cy="36" r="22" fill="#c8c8dc" />
          {[22, 32, 42].map((x) => (
            <line key={x} x1={x} y1="15" x2={x} y2="57" stroke="#8a8aa0" />
          ))}
          {[26, 36, 46].map((y) => (
            <line key={y} x1="11" y1={y} x2="53" y2={y} stroke="#8a8aa0" />
          ))}
          <circle cx="24" cy="26" r="4" fill="#fff" />
        </svg>
      )
    case 'reflektory':
      return (
        <svg viewBox="0 0 64 64" {...s} aria-hidden="true">
          <polygon points="10,6 22,6 40,60 2,60" fill="var(--ruzova)" opacity="0.5" />
          <polygon points="42,6 54,6 62,60 24,60" fill="#9b5be0" opacity="0.5" />
          <rect x="8" y="2" width="16" height="8" rx="2" fill="#141018" />
          <rect x="40" y="2" width="16" height="8" rx="2" fill="#141018" />
        </svg>
      )
    case 'dym':
      return (
        <svg viewBox="0 0 64 64" {...s} aria-hidden="true">
          <rect x="6" y="40" width="20" height="16" rx="3" fill="#141018" stroke="var(--strieborna)" />
          <ellipse cx="36" cy="38" rx="16" ry="8" fill="#e6e0f5" opacity="0.6" />
          <ellipse cx="46" cy="26" rx="14" ry="7" fill="#e6e0f5" opacity="0.45" />
          <ellipse cx="40" cy="14" rx="12" ry="6" fill="#e6e0f5" opacity="0.3" />
        </svg>
      )
    case 'napis':
      return (
        <svg viewBox="0 0 64 64" {...s} aria-hidden="true">
          <rect x="2" y="18" width="60" height="28" rx="6" fill="#141018" stroke="var(--ruzova)" strokeWidth="2" />
          <text x="32" y="38" textAnchor="middle" fontSize="15" fontWeight="800" fill="var(--ruzova)" className="neon">
            EV
          </text>
        </svg>
      )
    case 'bubenicka':
      return <Unicorn size={size} look={{ mane: ['#7a2fd0', '#d8d8ea'], instrument: 'drums' }} label="Bubeníčka Iskra" />
    case 'basistka':
      return <Fairy size={size * 0.85} look={{ hair: '#d8d8ea', dress: '#6b1f5a', instrument: 'bass' }} label="Basistka Luna" />
    case 'klavesistka':
      return <Unicorn size={size} look={{ mane: ['#40c8f0', 'var(--ruzova)'], instrument: 'keys' }} label="Klávesistka Hviezdička" />
    case 'limonada':
    case 'pizza':
    case 'torta':
      return (
        <svg viewBox="0 0 40 40" {...s} aria-hidden="true">
          <SnackShape id={id} x={3} y={8} />
        </svg>
      )
    case 'lizatko':
      return (
        <svg viewBox="0 0 64 64" {...s} aria-hidden="true">
          <circle cx="32" cy="22" r="16" fill="var(--ruzova)" />
          <path d="M32 22 m-10 0 a10 10 0 1 1 10 10" stroke="#fff" strokeWidth="3" fill="none" />
          <rect x="30" y="38" width="4" height="22" fill="#fff" />
        </svg>
      )
    case 'zuvacky':
      return (
        <svg viewBox="0 0 64 64" {...s} aria-hidden="true">
          <rect x="10" y="20" width="44" height="24" rx="6" fill="#40c8f0" />
          <rect x="16" y="26" width="32" height="12" rx="4" fill="#fff" opacity="0.6" />
        </svg>
      )
    case 'cokolada':
      return (
        <svg viewBox="0 0 64 64" {...s} aria-hidden="true">
          <rect x="12" y="10" width="40" height="46" rx="4" fill="#6a3a20" />
          {[0, 1, 2].map((r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={16 + c * 18} y={14 + r * 14} width="14" height="10" rx="2" fill="#7e4a2a" />))}
          <rect x="12" y="38" width="40" height="18" rx="2" fill="var(--ruzova)" />
        </svg>
      )
    default:
      return <Star size={size} />
  }
}

/** Minca alebo bankovka (hodnota v centoch). Vlastný jednoduchý dizajn, nie kópia skutočných platidiel. */
export function MoneyPiece({ value, size = 56 }: { value: number; size?: number }) {
  if (value >= 500) {
    const color = value >= 2000 ? '#4a7ae0' : value >= 1000 ? '#e05a5a' : '#8a8aa0'
    return (
      <svg viewBox="0 0 100 56" width={size * 1.6} height={size * 0.9} role="img" aria-label={`${value / 100} eur`}>
        <rect x="2" y="2" width="96" height="52" rx="6" fill={color} stroke="#fff" strokeWidth="2" />
        <rect x="8" y="8" width="84" height="40" rx="4" fill="none" stroke="#fff" strokeOpacity="0.5" />
        <circle cx="74" cy="28" r="12" fill="#fff" opacity="0.25" />
        <text x="30" y="38" textAnchor="middle" fontSize="26" fontWeight="800" fill="#fff">
          {value / 100}
        </text>
        <text x="74" y="34" textAnchor="middle" fontSize="16" fontWeight="800" fill="#fff">
          €
        </text>
      </svg>
    )
  }
  const euro = value >= 100
  const cents = value < 100
  const copper = cents && value <= 5
  const outer = euro ? (value === 200 ? '#c8c8dc' : '#e0b94a') : copper ? '#c0703a' : '#e0b94a'
  const inner = euro ? (value === 200 ? '#e0b94a' : '#c8c8dc') : outer
  const r = euro ? 26 : copper ? 18 + value : 20 + Math.min(value / 10, 6)
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} role="img" aria-label={euro ? `${value / 100} eurá` : `${value} centov`}>
      <circle cx="30" cy="30" r={r} fill={outer} stroke="#7a5a20" strokeWidth="1.5" />
      <circle cx="30" cy="30" r={r * 0.68} fill={inner} />
      <text x="30" y={euro ? 36 : 35} textAnchor="middle" fontSize={euro ? 17 : 14} fontWeight="800" fill="#2a1a10">
        {euro ? `${value / 100}€` : `${value}c`}
      </text>
    </svg>
  )
}

