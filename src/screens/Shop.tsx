import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { CATEGORY_TITLES, SHOP, type ShopCategory, type ShopItem } from '../content/shop'
import type { MoneyStage } from '../content/money'
import { changeNote, formatMoney, payMode, shopView, sumCoins, type PayMode } from '../engine/money'
import { Lightning, Star } from '../ui/art'
import { BandStage, ItemIcon, MoneyPiece } from '../ui/band'
import { Keypad } from '../ui/Keypad'
import { sfx } from '../ui/sound'
import { TenFrames } from '../ui/visuals'
import { ActivityHeader } from '../activities/Header'

const CATEGORIES: ShopCategory[] = ['obcerstvenie', 'oblecenie', 'nastroje', 'podium', 'kapela']

/** Obchod: cenovka a peňaženka. Lulu tu míňa zarobené peniaze. */
export function Shop({
  money,
  owned,
  snack,
  stage,
  onBuy,
  onBack,
}: {
  money: number
  owned: string[]
  snack: string | null
  stage: MoneyStage
  onBuy: (itemId: string) => void
  onBack: () => void
}) {
  const [cat, setCat] = useState<ShopCategory>('obcerstvenie')
  const [paying, setPaying] = useState<ShopItem | null>(null)
  const [bought, setBought] = useState<ShopItem | null>(null)
  const view = shopView(SHOP, owned, money, stage).filter((v) => v.item.category === cat)

  if (paying) {
    return (
      <Pay
        item={paying}
        money={money}
        stage={stage}
        onCancel={() => setPaying(null)}
        onPaid={() => {
          onBuy(paying.id)
          setBought(paying)
          setPaying(null)
        }}
      />
    )
  }

  return (
    <main className="screen shop">
      <div className="round-top">
        <button type="button" className="btn btn-ghost" onClick={onBack} aria-label="Domov">
          ⌂
        </button>
        <h1 className="shop-title">Obchod</h1>
        <Wallet money={money} />
      </div>
      {bought && (
        <section className="bought" role="status">
          <h2>
            <Star size={30} /> Kúpené: {bought.name} <Star size={30} />
          </h2>
          <BandStage owned={owned} snack={bought.category === 'obcerstvenie' ? bought.id : snack} playing />
          <button type="button" className="btn" onClick={() => setBought(null)}>
            Nakupovať ďalej
          </button>
        </section>
      )}
      {!bought && (
        <>
          <nav className="tabs" aria-label="Druhy tovaru">
            {CATEGORIES.map((c) => (
              <button key={c} type="button" className={`tab ${c === cat ? 'tab-active' : ''}`} onClick={() => setCat(c)}>
                {CATEGORY_TITLES[c]}
              </button>
            ))}
          </nav>
          <ul className="shop-grid">
            {view.map(({ item, owned: isOwned, affordable, locked }) => (
              <li key={item.id} className={`shop-card ${isOwned ? 'owned' : ''}`}>
                <div className="shop-icon">
                  <ItemIcon id={item.id} size={72} />
                </div>
                <div className="shop-name">{item.name}</div>
                <div className="price-tag">{formatMoney(item.price)}</div>
                {isOwned ? (
                  <div className="shop-state">✓ Máš to</div>
                ) : locked ? (
                  <div className="shop-state">Najprv kúp: {SHOP.find((i) => i.id === item.needs)?.name}</div>
                ) : affordable ? (
                  <button type="button" className="btn btn-primary" onClick={() => setPaying(item)}>
                    Kúpiť
                  </button>
                ) : (
                  <div className="saving" aria-label={`Našetrené ${formatMoney(money)} z ${formatMoney(item.price)}`}>
                    <div className="meter">
                      <div className="meter-fill" style={{ width: `${Math.min(100, Math.round((money / item.price) * 100))}%` }} />
                    </div>
                    <span>Šetríš</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  )
}

export function Wallet({ money }: { money: number }) {
  return (
    <div className="wallet" aria-label={`Máš ${formatMoney(money)}`}>
      <MoneyPiece value={100} size={30} />
      <span>{formatMoney(money)}</span>
    </div>
  )
}

/** Zaplatenie: presná suma, výdavok alebo nákup zo sporenia. */
function Pay({ item, money, stage, onCancel, onPaid }: { item: ShopItem; money: number; stage: MoneyStage; onCancel: () => void; onPaid: () => void }) {
  const mode: PayMode = useMemo(() => payMode(item.price, stage, Math.random()), [item.price, stage])
  return (
    <main className="screen pay">
      <div className="round-top">
        <button type="button" className="btn btn-ghost" onClick={onCancel} aria-label="Späť do obchodu">
          ←
        </button>
        <h1 className="shop-title">Pokladňa</h1>
        <Wallet money={money} />
      </div>
      <div className="pay-item">
        <ItemIcon id={item.id} size={84} />
        <div>
          <div className="shop-name">{item.name}</div>
          <div className="price-tag price-big">{formatMoney(item.price)}</div>
        </div>
      </div>
      {mode === 'exact' && <PayExact price={item.price} money={money} stage={stage} onPaid={onPaid} />}
      {mode === 'change' && <PayChange price={item.price} note={changeNote(item.price, stage)} onPaid={onPaid} />}
      {mode === 'savings' && (
        <section className="center pay-savings">
          <ActivityHeader title="Veľký nákup" prompt={`Na toto si šetrila! Kúpiť za ${formatMoney(item.price)}?`} />
          <button
            type="button"
            className="btn btn-big"
            onClick={() => {
              sfx.cheer()
              onPaid()
            }}
          >
            Kúpiť <Lightning size={30} />
          </button>
        </section>
      )}
    </main>
  )
}

/** Presná suma: mince a bankovky sa ťahajú (alebo ťukajú) na pult. */
function PayExact({ price, money, stage, onPaid }: { price: number; money: number; stage: MoneyStage; onPaid: () => void }) {
  const [counter, setCounter] = useState<number[]>([])
  const [msg, setMsg] = useState<null | 'less' | 'more'>(null)
  const counterRef = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<{ value: number; x: number; y: number } | null>(null)
  const start = useRef<{ x: number; y: number; value: number; moved: boolean } | null>(null)
  const onCounter = sumCoins(counter)
  const denominations = stage.denominations

  const add = (value: number) => {
    if (onCounter + value > money) return
    sfx.coin()
    setMsg(null)
    setCounter((c) => [...c, value].sort((a, b) => b - a))
  }

  const down = (value: number) => (e: ReactPointerEvent) => {
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    start.current = { x: e.clientX, y: e.clientY, value, moved: false }
  }
  const move = (e: ReactPointerEvent) => {
    const s = start.current
    if (!s) return
    if (!s.moved && Math.hypot(e.clientX - s.x, e.clientY - s.y) < 8) return
    s.moved = true
    setDrag({ value: s.value, x: e.clientX, y: e.clientY })
  }
  const up = (e: ReactPointerEvent) => {
    const s = start.current
    start.current = null
    setDrag(null)
    if (!s) return
    if (!s.moved) return add(s.value)
    const r = counterRef.current?.getBoundingClientRect()
    if (r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) add(s.value)
  }

  const pay = () => {
    if (onCounter === price) {
      sfx.cheer()
      onPaid()
    } else {
      sfx.soft()
      setMsg(onCounter < price ? 'less' : 'more')
    }
  }

  return (
    <section className="pay-exact">
      <ActivityHeader title="Zaplať presne" prompt={`Polož na pult presne ${formatMoney(price)}.`} />
      <div ref={counterRef} className={`counter ${drag ? 'counter-drop' : ''}`} aria-label="Pult">
        {counter.length === 0 && <span className="counter-empty">Sem polož peniaze</span>}
        {counter.map((v, i) => (
          <button
            key={`${v}-${i}`}
            type="button"
            className="money-btn"
            aria-label={`Vrátiť ${formatMoney(v)}`}
            onClick={() => {
              setMsg(null)
              setCounter((c) => c.filter((_, j) => j !== i))
            }}
          >
            <MoneyPiece value={v} size={46} />
          </button>
        ))}
      </div>
      {msg && (
        <div className="feedback feedback-hint" role="status">
          Na pulte je {formatMoney(onCounter)}. {msg === 'less' ? 'Ešte to nestačí.' : 'To je priveľa – niečo vráť späť.'}
        </div>
      )}
      <div className="purse" aria-label="Peňaženka">
        {denominations.map((d) => (
          <button
            key={d}
            type="button"
            className="money-btn pile"
            disabled={onCounter + d > money}
            onPointerDown={down(d)}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={() => {
              start.current = null
              setDrag(null)
            }}
            aria-label={`Položiť ${formatMoney(d)}`}
          >
            <MoneyPiece value={d} size={50} />
          </button>
        ))}
      </div>
      <button type="button" className="btn btn-big" onClick={pay} disabled={counter.length === 0}>
        Zaplatiť
      </button>
      {drag && (
        <div className="drag-ghost" style={{ left: drag.x, top: drag.y }} aria-hidden="true">
          <MoneyPiece value={drag.value} size={50} />
        </div>
      )}
    </section>
  )
}

/** Výdavok: platí sa bankovkou, Lulu vypočíta, koľko jej vrátia. */
function PayChange({ price, note, onPaid }: { price: number; note: number; onPaid: () => void }) {
  const change = note - price
  const [value, setValue] = useState('')
  const [phase, setPhase] = useState<'ask' | 'hint' | 'reveal'>('ask')
  const submit = () => {
    if (Number(value) * 100 === change) {
      sfx.cheer()
      onPaid()
      return
    }
    sfx.soft()
    setValue('')
    setPhase(phase === 'ask' ? 'hint' : 'reveal')
  }
  const p = price / 100
  const n = note / 100
  return (
    <section className="pay-change">
      <ActivityHeader title="Výdavok" prompt={`Platíš bankovkou ${n} €. Koľko eur ti vrátia?`} />
      <div className="pay-note">
        <MoneyPiece value={note} size={60} />
      </div>
      {phase !== 'ask' && n <= 20 && (
        <figure className="hint">
          <TenFrames groups={[{ count: p, color: 'pink' }, { count: n - p, color: 'silver' }]} frames={Math.ceil(n / 10)} />
          <figcaption>
            od {p} do {n}
          </figcaption>
        </figure>
      )}
      <div className="equation">
        <span className="eq-part">{n}</span>
        <span className="eq-part">−</span>
        <span className="eq-part">{p}</span>
        <span className="eq-part">=</span>
        <span className={`box ${phase === 'reveal' ? 'box-reveal' : ''}`}>{phase === 'reveal' ? change / 100 : value || ' '}</span>
      </div>
      {phase === 'reveal' ? (
        <div className="feedback feedback-reveal">
          <div>
            Nevadí! Vrátia ti <strong>{change / 100} €</strong>.
          </div>
          <button type="button" className="btn btn-primary" onClick={onPaid}>
            Kúpiť <Lightning size={28} />
          </button>
        </div>
      ) : (
        <>
          <Keypad value={value} onChange={setValue} onSubmit={submit} maxLength={2} />
          {phase === 'hint' && <div className="feedback feedback-hint">Skoro! Pozri sa na obrázok a skús ešte raz.</div>}
        </>
      )}
    </section>
  )
}
