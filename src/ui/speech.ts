// Čítanie nahlas po slovensky cez Web Speech API.
// Ak slovenský hlas na zariadení chýba, tlačidlo sa skryje a nič sa nezrúti.
import { useSyncExternalStore } from 'react'

let voice: SpeechSynthesisVoice | null = null
let available = false
let enabled = true
const listeners = new Set<() => void>()

function notify() {
  for (const l of listeners) l()
}

function pickVoice() {
  try {
    const voices = window.speechSynthesis.getVoices()
    voice = voices.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith('sk')) ?? null
    const now = voice !== null
    if (now !== available) {
      available = now
      notify()
    }
  } catch {
    available = false
  }
}

export function initSpeech(): void {
  try {
    if (!('speechSynthesis' in window)) return
    pickVoice()
    // Safari načítava hlasy neskôr.
    window.speechSynthesis.addEventListener?.('voiceschanged', pickVoice)
    setTimeout(pickVoice, 500)
    setTimeout(pickVoice, 2000)
  } catch {
    available = false
  }
}

export function setSpeechEnabled(on: boolean): void {
  if (on !== enabled) {
    enabled = on
    notify()
  }
}

export function speak(text: string): void {
  if (!available || !enabled) return
  try {
    const synth = window.speechSynthesis
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'sk-SK'
    if (voice) u.voice = voice
    u.rate = 0.9
    synth.speak(u)
  } catch {
    // Čítanie je len pomôcka – pri chybe ticho pokračujeme.
  }
}

export function stopSpeaking(): void {
  try {
    window.speechSynthesis?.cancel()
  } catch {
    // nič
  }
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

/** Je k dispozícii slovenský hlas a je čítanie zapnuté? */
export function useCanSpeak(): boolean {
  return useSyncExternalStore(subscribe, () => available && enabled, () => false)
}

/** Text na čítanie: znamienka slovami, prázdne políčko ako „koľko“. */
export function spoken(text: string): string {
  return text
    .replace(/▢/g, ' koľko ')
    .replace(/\+/g, ' plus ')
    .replace(/[−-]/g, ' mínus ')
    .replace(/=/g, ' sa rovná ')
    .replace(/</g, ' je menej ako ')
    .replace(/>/g, ' je viac ako ')
    .replace(/€/g, ' eur ')
    .replace(/\s+/g, ' ')
    .trim()
}
