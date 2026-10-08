// Krátke zvuky cez Web Audio – žiadne zvukové súbory. Chyba znie jemne, nikdy ako trest.
let ctx: AudioContext | null = null
let enabled = true

export function setSoundEnabled(on: boolean): void {
  enabled = on
}

function audio(): AudioContext | null {
  if (!enabled) return null
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      ctx = new Ctor()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'triangle', gain = 0.12) {
  const c = audio()
  if (!c) return
  const t = c.currentTime + start
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(gain, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(c.destination)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

export const sfx = {
  correct() {
    tone(659, 0, 0.18)
    tone(880, 0.1, 0.25)
  },
  soft() {
    tone(392, 0, 0.22, 'sine', 0.08)
  },
  coin() {
    tone(1319, 0, 0.08, 'square', 0.05)
    tone(1760, 0.07, 0.15, 'square', 0.05)
  },
  cheer() {
    ;[523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.3))
  },
  tap() {
    tone(520, 0, 0.05, 'sine', 0.05)
  },
}
