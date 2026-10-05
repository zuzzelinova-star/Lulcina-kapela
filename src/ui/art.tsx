// Grafika čisto v SVG – vlastné postavičky, žiadne externé obrázky.

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

/** Jednorožec v koženej bunde so slnečnými okuliarmi na čele. */
export function Unicorn({ size = 160, guitar = false }: { size?: number; guitar?: boolean }) {
  return (
    <svg viewBox="0 0 160 170" width={size} height={size * (170 / 160)} aria-label="Jednorožec v koženej bunde" role="img">
      {/* chvost */}
      <path d="M28 92 Q4 96 10 128 Q18 112 30 116 Q14 132 30 146 Q34 124 44 112 Z" fill="var(--ruzova)" />
      {/* nohy */}
      <rect x="44" y="118" width="14" height="38" rx="6" fill="#f4f0ff" />
      <rect x="62" y="120" width="14" height="36" rx="6" fill="#e6e0f5" />
      <rect x="94" y="120" width="14" height="36" rx="6" fill="#e6e0f5" />
      <rect x="110" y="118" width="14" height="38" rx="6" fill="#f4f0ff" />
      {/* kopytá */}
      <rect x="44" y="150" width="14" height="8" rx="3" fill="var(--strieborna)" />
      <rect x="62" y="150" width="14" height="8" rx="3" fill="var(--strieborna)" />
      <rect x="94" y="150" width="14" height="8" rx="3" fill="var(--strieborna)" />
      <rect x="110" y="150" width="14" height="8" rx="3" fill="var(--strieborna)" />
      {/* telo */}
      <ellipse cx="84" cy="106" rx="50" ry="28" fill="#f4f0ff" />
      {/* kožená bunda */}
      <path d="M48 86 Q84 70 124 84 L132 116 Q84 132 40 118 Z" fill="#141018" />
      <path d="M86 76 L84 128" stroke="var(--strieborna)" strokeWidth="2.5" strokeDasharray="3 2" />
      <path d="M70 78 L80 96 L64 96 Z" fill="#2a2230" />
      <path d="M102 78 L92 96 L108 96 Z" fill="#2a2230" />
      <circle cx="58" cy="104" r="3" fill="var(--strieborna)" />
      <circle cx="114" cy="104" r="3" fill="var(--strieborna)" />
      <polygon points="104,100 98,110 103,110 99,120 110,106 104,106 108,100" fill="var(--ruzova)" />
      {/* krk a hlava */}
      <path d="M112 90 Q118 60 126 48 L146 58 Q138 80 132 96 Z" fill="#f4f0ff" />
      <ellipse cx="138" cy="48" rx="20" ry="16" fill="#f4f0ff" />
      <ellipse cx="152" cy="56" rx="9" ry="8" fill="#ffd3f3" />
      <circle cx="155" cy="55" r="1.6" fill="#a04a8a" />
      {/* oko */}
      <circle cx="138" cy="46" r="4.5" fill="#1a0b2e" />
      <circle cx="139.5" cy="44.5" r="1.5" fill="#fff" />
      <ellipse cx="144" cy="56" rx="4" ry="2.5" fill="var(--ruzova)" opacity="0.5" />
      {/* ucho */}
      <polygon points="126,36 130,22 136,36" fill="#f4f0ff" stroke="#e0d8f0" />
      {/* roh */}
      <polygon points="136,32 150,4 144,34" fill="url(#horn)" />
      <path d="M139 26 L147 24 M141 18 L148 16" stroke="#fff" strokeWidth="1.5" />
      {/* okuliare na čele */}
      <rect x="126" y="34" width="11" height="6" rx="3" fill="#1a0b2e" />
      <rect x="139" y="34" width="11" height="6" rx="3" fill="#1a0b2e" />
      {/* hriva */}
      <circle cx="124" cy="40" r="7" fill="var(--ruzova)" />
      <circle cx="120" cy="52" r="7" fill="#b04ce0" />
      <circle cx="118" cy="64" r="7" fill="var(--ruzova)" />
      <circle cx="116" cy="76" r="6" fill="#b04ce0" />
      {guitar && <Guitar x={66} y={78} scale={0.55} rotate={-25} />}
      <defs>
        <linearGradient id="horn" x1="0" x2="1">
          <stop offset="0" stopColor="#d8d8e8" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/** Gitara, použiteľná samostatne alebo v rukách postavičky. */
export function Guitar({ x = 0, y = 0, scale = 1, rotate = 0 }: { x?: number; y?: number; scale?: number; rotate?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <rect x="54" y="-58" width="10" height="70" rx="2" fill="#c0c0d0" />
      <rect x="50" y="-72" width="18" height="18" rx="4" fill="#141018" />
      <path d="M30 6 Q14 24 30 42 Q42 54 59 46 Q78 54 90 42 Q104 24 88 6 Q76 -6 59 4 Q42 -6 30 6 Z" fill="var(--ruzova)" stroke="#141018" strokeWidth="3" />
      <circle cx="59" cy="24" r="8" fill="#141018" />
      <polygon points="40,30 36,40 46,34" fill="#fff" opacity="0.6" />
    </g>
  )
}

/** Víla s gitarou. */
export function Fairy({ size = 140 }: { size?: number }) {
  return (
    <svg viewBox="0 0 140 170" width={size} height={size * (170 / 140)} aria-label="Víla s gitarou" role="img">
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
      <path d="M52 72 L88 72 L104 134 L36 134 Z" fill="#141018" />
      <path d="M36 134 L44 124 L52 134 L60 124 L70 134 L80 124 L88 134 L96 124 L104 134 Z" fill="var(--ruzova)" />
      <polygon points="70,86 74,96 85,96 76,102 80,112 70,106 60,112 64,102 55,96 66,96" fill="var(--strieborna)" />
      {/* hlava */}
      <circle cx="70" cy="48" r="22" fill="#f5d0b5" />
      <path d="M46 50 Q44 18 70 20 Q98 18 94 52 Q90 34 80 32 Q70 40 52 36 Q48 42 46 50 Z" fill="#7a2fd0" />
      <path d="M46 48 Q40 70 50 80 Q50 62 52 50 Z" fill="#7a2fd0" />
      <path d="M94 48 Q100 70 90 80 Q90 62 88 50 Z" fill="#7a2fd0" />
      <circle cx="62" cy="50" r="3.2" fill="#1a0b2e" />
      <circle cx="78" cy="50" r="3.2" fill="#1a0b2e" />
      <circle cx="63" cy="49" r="1" fill="#fff" />
      <circle cx="79" cy="49" r="1" fill="#fff" />
      <path d="M63 59 Q70 65 77 59" stroke="#a04a4a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="56" cy="57" rx="4" ry="2.5" fill="var(--ruzova)" opacity="0.4" />
      <ellipse cx="84" cy="57" rx="4" ry="2.5" fill="var(--ruzova)" opacity="0.4" />
      {/* korunka-blesk */}
      <polygon points="70,14 64,26 69,26 66,34 76,22 71,22 74,14" fill="var(--strieborna)" />
      {/* gitara */}
      <Guitar x={30} y={98} scale={0.6} rotate={-30} />
      {/* ruky */}
      <circle cx="50" cy="112" r="5" fill="#f5d0b5" />
      <circle cx="82" cy="96" r="5" fill="#f5d0b5" />
    </svg>
  )
}

/** Pódium s reflektormi. Postavičky sa vkladajú ako deti. */
export function Stage({ children }: { children?: React.ReactNode }) {
  return (
    <div className="stage">
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
      </svg>
      <div className="stage-cast">{children}</div>
    </div>
  )
}
