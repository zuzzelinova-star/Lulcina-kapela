// Dni ako reťazce YYYY-MM-DD v miestnom čase zariadenia. Deň sa mení o polnoci.

export function dayKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(day: string, days: number): string {
  const [y, m, d] = day.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d + days))
  return t.toISOString().slice(0, 10)
}

/** Reťazce YYYY-MM-DD sa dajú porovnávať lexikograficky. */
export function isDue(nextDue: string | null, today: string): boolean {
  return nextDue === null || nextDue <= today
}
