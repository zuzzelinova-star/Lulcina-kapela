import { speak, spoken, useCanSpeak } from '../ui/speech'

/** Názov aktivity, krátke zadanie a tlačidlo reproduktora (len ak je slovenský hlas). */
export function ActivityHeader({ title, prompt, speech }: { title: string; prompt: string; speech?: string }) {
  const canSpeak = useCanSpeak()
  return (
    <header className="activity-header">
      <h2 className="activity-title">{title}</h2>
      <div className="prompt-row">
        {prompt && <p className="prompt">{prompt}</p>}
        {canSpeak && <SpeakButton text={speech ?? prompt} />}
      </div>
    </header>
  )
}

export function SpeakButton({ text }: { text: string }) {
  return (
    <button type="button" className="btn btn-ghost speak-btn" onClick={() => speak(spoken(text))} aria-label="Prečítať nahlas">
      <svg viewBox="0 0 48 48" width="30" height="30" aria-hidden="true">
        <polygon points="6,18 16,18 28,8 28,40 16,30 6,30" fill="currentColor" />
        <path d="M34 16 Q40 24 34 32 M38 10 Q48 24 38 38" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </svg>
    </button>
  )
}
