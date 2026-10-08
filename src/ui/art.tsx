// Grafika čisto v SVG – vlastné postavičky, žiadne externé obrázky.
import type { ReactNode } from 'react'

export function Lightning({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      <polygon points="58,4 22,56 46,56 36,96 78,40 54,40 66,4" fill="var(--ruzova)" stroke="var(--strieborna)" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  )
}

export function Star({ size = 32, filled = true, className }: { size?: number; filled?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      <polygon
        points="50,6 62,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 38,38"
        fill={filled ? 'var(--strieborna)' : 'none'}
        stroke="var(--strieborna)"
        strokeWidth="5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Note({ size = 32, color = 'var(--ruzova)' }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <ellipse cx="34" cy="76" rx="20" ry="15" fill={color} transform="rotate(-20 34 76)" />
      <rect x="49" y="12" width="8" height="64" fill={color} />
      <path d="M53 12 Q80 18 82 44 Q72 30 53 30 Z" fill={color} />
    </svg>
  )
}

export interface UnicornLook {
  /** Dve farby hrivy a chvosta. */
  mane?: [string, string]
  sunglasses?: boolean
  scarf?: boolean
  mic?: boolean
  /** Nástroj pred jednorožcom. */
  instrument?: 'drums' | 'keys'
}

/** Jednorožec v koženej bunde. */
export function Unicorn({ size = 160, look = {}, label = 'Jednorožec v koženej bunde' }: { size?: number; look?: UnicornLook; label?: string }) {
  const [m1, m2] = look.mane ?? ['var(--ruzova)', '#b04ce0']
  return (
    <svg viewBox="0 0 175 170" width={size} height={size * (170 / 175)} aria-label={label} role="img">
      {/* chvost */}
      <path d="M28 92 Q4 96 10 128 Q18 112 30 116 Q14 132 30 146 Q34 124 44 112 Z" fill={m1} />
      {/* nohy */}
      <rect x="44" y="118" width="14" height="38" rx="6" fill="#f4f0ff" />
      <rect x="62" y="120" width="14" height="36" rx="6" fill="#e6e0f5" />
      <rect x="94" y="120" width="14" height="36" rx="6" fill="#e6e0f5" />
      <rect x="110" y="118" width="14" height="38" rx="6" fill="#f4f0ff" />
      {[44, 62, 94, 110].map((x) => (
        <rect key={x} x={x} y="150" width="14" height="8" rx="3" fill="var(--strieborna)" />
      ))}
      {/* telo */}
      <ellipse cx="84" cy="106" rx="50" ry="28" fill="#f4f0ff" />
      {/* kožená bunda */}
      <path d="M48 86 Q84 70 124 84 L132 116 Q84 132 40 118 Z" fill="#141018" />
      <path d="M86 76 L84 128" stroke="var(--strieborna)" strokeWidth="2.5" strokeDasharray="3 2" />
      <path d="M70 78 L80 96 L64 96 Z" fill="#2a2230" />
      <path d="M102 78 L92 96 L108 96 Z" fill="#2a2230" />
      <circle cx="58" cy="104" r="3" fill="var(--strieborna)" />
      <circle cx="114" cy="104" r="3" fill="var(--strieborna)" />
      <polygon points="104,100 98,110 103,110 99,120 110,106 104,106 108,100" fill={m1} />
      {/* krk a hlava */}
      <path d="M112 90 Q118 60 126 48 L146 58 Q138 80 132 96 Z" fill="#f4f0ff" />
      <ellipse cx="138" cy="48" rx="20" ry="16" fill="#f4f0ff" />
      <ellipse cx="152" cy="56" rx="9" ry="8" fill="#ffd3f3" />
      <circle cx="155" cy="55" r="1.6" fill="#a04a8a" />
      {/* oko alebo slnečné okuliare */}
      {look.sunglasses ? (
        <g>
          <rect x="128" y="40" width="22" height="10" rx="4" fill="#1a0b2e" />
          <rect x="131" y="42" width="6" height="2" rx="1" fill="#fff" opacity="0.7" />
          <line x1="128" y1="44" x2="122" y2="42" stroke="#1a0b2e" strokeWidth="2" />
        </g>
      ) : (
        <g>
          <circle cx="138" cy="46" r="4.5" fill="#1a0b2e" />
          <circle cx="139.5" cy="44.5" r="1.5" fill="#fff" />
        </g>
      )}
      <ellipse cx="144" cy="56" rx="4" ry="2.5" fill="var(--ruzova)" opacity="0.5" />
      {/* ucho */}
      <polygon points="126,36 130,22 136,36" fill="#f4f0ff" stroke="#e0d8f0" />
      {/* roh */}
      <polygon points="136,32 150,4 144,34" fill="#e8e8f4" stroke="#c8c8dc" strokeWidth="1" />
      <path d="M139 26 L147 24 M141 18 L148 16" stroke="#fff" strokeWidth="1.5" />
      {/* hriva */}
      <circle cx="124" cy="40" r="7" fill={m1} />
      <circle cx="120" cy="52" r="7" fill={m2} />
      <circle cx="118" cy="64" r="7" fill={m1} />
      <circle cx="116" cy="76" r="6" fill={m2} />
      {/* šatka */}
      {look.scarf && (
        <g>
          <path d="M116 82 Q130 90 138 84 L136 94 Q126 98 114 92 Z" fill="var(--ruzova)" />
          <polygon points="124,94 132,94 128,108" fill="var(--ruzova)" />
          <circle cx="122" cy="88" r="1.5" fill="#fff" />
          <circle cx="130" cy="90" r="1.5" fill="#fff" />
        </g>
      )}
      {/* mikrofón na stojane */}
      {look.mic && (
        <g>
          <line x1="166" y1="160" x2="166" y2="74" stroke="var(--strieborna)" strokeWidth="3" />
          <line x1="156" y1="160" x2="174" y2="160" stroke="var(--strieborna)" strokeWidth="3" />
          <line x1="166" y1="76" x2="160" y2="66" stroke="var(--strieborna)" strokeWidth="3" />
          <ellipse cx="158" cy="63" rx="5" ry="6" fill="#2a2230" stroke="var(--strieborna)" strokeWidth="1.5" />
        </g>
      )}
      {look.instrument === 'drums' && (
        <g>
          <circle cx="86" cy="138" r="26" fill="#141018" stroke="var(--strieborna)" strokeWidth="3" />
          <circle cx="86" cy="138" r="18" fill={m2} />
          <polygon points="90,124 80,140 87,140 83,152 94,134 87,134 92,124" fill="#fff" />
          <ellipse cx="38" cy="122" rx="16" ry="5" fill="#d8c070" />
          <line x1="38" y1="122" x2="38" y2="160" stroke="var(--strieborna)" strokeWidth="2" />
          <ellipse cx="134" cy="126" rx="14" ry="5" fill="#d8c070" />
          <line x1="134" y1="126" x2="134" y2="160" stroke="var(--strieborna)" strokeWidth="2" />
        </g>
      )}
      {look.instrument === 'keys' && (
        <g>
          <rect x="30" y="112" width="112" height="18" rx="3" fill="#141018" stroke="var(--strieborna)" strokeWidth="2" />
          {Array.from({ length: 13 }, (_, i) => (
            <rect key={i} x={34 + i * 8} y="115" width="6" height="12" fill="#f6f2ff" />
          ))}
          {[0, 1, 3, 4, 5, 7, 8, 10, 11].map((i) => (
            <rect key={`b${i}`} x={38 + i * 8} y="115" width="4" height="7" fill="#141018" />
          ))}
          <line x1="44" y1="130" x2="36" y2="160" stroke="var(--strieborna)" strokeWidth="3" />
          <line x1="128" y1="130" x2="136" y2="160" stroke="var(--strieborna)" strokeWidth="3" />
        </g>
      )}
    </svg>
  )
}

export type GuitarKind = 'basic' | 'sparkle' | 'lightning' | 'bass'

/** Gitara, použiteľná samostatne alebo v rukách postavičky. */
export function Guitar({ x = 0, y = 0, scale = 1, rotate = 0, kind = 'basic' }: { x?: number; y?: number; scale?: number; rotate?: number; kind?: GuitarKind }) {
  const body = kind === 'sparkle' ? '#d8d8ea' : kind === 'bass' ? '#8a3fe0' : 'var(--ruzova)'
  const neckLen = kind === 'bass' ? 92 : 70
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <rect x="54" y={12 - neckLen} width="10" height={neckLen} rx="2" fill="#c0c0d0" />
      <rect x="50" y={-2 - neckLen} width="18" height="18" rx="4" fill="#141018" />
      {kind === 'lightning' ? (
        <polygon points="70,0 30,30 56,30 34,60 96,18 66,18 82,0" fill="var(--ruzova)" stroke="#141018" strokeWidth="3" strokeLinejoin="round" />
      ) : (
        <path d="M30 6 Q14 24 30 42 Q42 54 59 46 Q78 54 90 42 Q104 24 88 6 Q76 -6 59 4 Q42 -6 30 6 Z" fill={body} stroke="#141018" strokeWidth="3" />
      )}
      {kind !== 'lightning' && <circle cx="59" cy="24" r="8" fill="#141018" />}
      {kind === 'sparkle' &&
        [
          [36, 14],
          [80, 12],
          [44, 38],
          [76, 36],
          [60, 44],
          [88, 26],
        ].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="2.5" fill="var(--ruzova)" className="twinkle" style={{ animationDelay: `${i * 0.3}s` }} />)}
    </g>
  )
}

export interface FairyLook {
  hair?: string
  dress?: string
  jacket?: boolean
  crown?: boolean
  instrument?: GuitarKind
}

/** Víla s gitarou. */
export function Fairy({ size = 140, look = {}, label = 'Víla s gitarou' }: { size?: number; look?: FairyLook; label?: string }) {
  const hair = look.hair ?? '#7a2fd0'
  const dress = look.dress ?? '#2a1446'
  return (
    <svg viewBox="0 0 140 170" width={size} height={size * (170 / 140)} aria-label={label} role="img">
      {/* krídla */}
      <ellipse cx="40" cy="70" rx="30" ry="18" fill="#ffb3f0" opacity="0.55" transform="rotate(-30 40 70)" />
      <ellipse cx="100" cy="70" rx="30" ry="18" fill="#ffb3f0" opacity="0.55" transform="rotate(30 100 70)" />
      <ellipse cx="44" cy="98" rx="20" ry="11" fill="#d9a6ff" opacity="0.55" transform="rotate(20 44 98)" />
      <ellipse cx="96" cy="98" rx="20" ry="11" fill="#d9a6ff" opacity="0.55" transform="rotate(-20 96 98)" />
      {/* nohy */}
      <rect x="58" y="128" width="8" height="30" rx="4" fill="#f5d0b5" />
      <rect x="74" y="128" width="8" height="30" rx="4" fill="#f5d0b5" />
      <rect x="54" y="152" width="14" height="8" rx="4" fill="#141018" />
      <rect x="72" y="152" width="14" height="8" rx="4" fill="#141018" />
      {/* šaty */}
      <path d="M52 72 L88 72 L104 134 L36 134 Z" fill={dress} />
      <path d="M36 134 L44 124 L52 134 L60 124 L70 134 L80 124 L88 134 L96 124 L104 134 Z" fill="var(--ruzova)" />
      <polygon points="70,86 74,96 85,96 76,102 80,112 70,106 60,112 64,102 55,96 66,96" fill="var(--strieborna)" />
      {/* kožená bunda */}
      {look.jacket && (
        <g>
          <path d="M50 70 L90 70 L96 106 L44 106 Z" fill="#141018" />
          <path d="M60 70 L70 86 L80 70" fill="none" stroke="#2a2230" strokeWidth="4" />
          <line x1="70" y1="86" x2="70" y2="106" stroke="var(--strieborna)" strokeWidth="2" strokeDasharray="2 2" />
          {[52, 58, 82, 88].map((x) => (
            <circle key={x} cx={x} cy="76" r="1.8" fill="var(--strieborna)" />
          ))}
        </g>
      )}
      {/* hlava */}
      <circle cx="70" cy="48" r="22" fill="#f5d0b5" />
      <path d="M46 50 Q44 18 70 20 Q98 18 94 52 Q90 34 80 32 Q70 40 52 36 Q48 42 46 50 Z" fill={hair} />
      <path d="M46 48 Q40 70 50 80 Q50 62 52 50 Z" fill={hair} />
      <path d="M94 48 Q100 70 90 80 Q90 62 88 50 Z" fill={hair} />
      <circle cx="62" cy="50" r="3.2" fill="#1a0b2e" />
      <circle cx="78" cy="50" r="3.2" fill="#1a0b2e" />
      <circle cx="63" cy="49" r="1" fill="#fff" />
      <circle cx="79" cy="49" r="1" fill="#fff" />
      <path d="M63 59 Q70 65 77 59" stroke="#a04a4a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="56" cy="57" rx="4" ry="2.5" fill="var(--ruzova)" opacity="0.4" />
      <ellipse cx="84" cy="57" rx="4" ry="2.5" fill="var(--ruzova)" opacity="0.4" />
      {/* korunka alebo blesk vo vlasoch */}
      {look.crown ? (
        <g>
          <polygon points="54,26 58,10 64,22 70,6 76,22 82,10 86,26" fill="#e8e8f4" stroke="#a8a8c0" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="70" cy="14" r="2.5" fill="var(--ruzova)" />
        </g>
      ) : (
        <polygon points="70,14 64,26 69,26 66,34 76,22 71,22 74,14" fill="var(--strieborna)" />
      )}
      {/* nástroj */}
      <Guitar x={30} y={98} scale={0.6} rotate={-30} kind={look.instrument ?? 'basic'} />
      {/* ruky */}
      <circle cx="50" cy="112" r="5" fill="#f5d0b5" />
      <circle cx="82" cy="96" r="5" fill="#f5d0b5" />
    </svg>
  )
}

/** Pódium s reflektormi. Výzdoba a postavičky sa vkladajú zvonka. */
export function Stage({ children, decor, playing = false, className = '' }: { children?: ReactNode; decor?: ReactNode; playing?: boolean; className?: string }) {
  return (
    <div className={`stage ${playing ? 'playing' : ''} ${className}`}>
      <svg className="stage-bg" viewBox="0 0 400 220" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a1a66" />
            <stop offset="1" stopColor="#140824" />
          </linearGradient>
        </defs>
        <polygon className="beam beam-l" points="60,0 80,0 190,190 110,190" fill="url(#beam)" />
        <polygon className="beam beam-r" points="320,0 340,0 290,190 210,190" fill="url(#beam)" />
        <rect x="0" y="180" width="400" height="40" fill="url(#floor)" />
        <rect x="0" y="178" width="400" height="4" fill="var(--ruzova)" opacity="0.8" />
        {[30, 90, 150, 250, 310, 370].map((x, i) => (
          <circle key={x} cx={x} cy={14 + (i % 2) * 18} r="2.5" fill="var(--strieborna)" className="twinkle" style={{ animationDelay: `${i * 0.4}s` }} />
        ))}
        {decor}
      </svg>
      <div className="stage-cast">{children}</div>
      {playing && (
        <div className="stage-notes" aria-hidden="true">
          <Note size={26} />
          <Note size={22} color="var(--strieborna)" />
          <Note size={28} />
        </div>
      )}
    </div>
  )
}
