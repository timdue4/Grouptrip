export const INTERESTS = [
  { id: 'beach', label: 'Strand', emoji: '🏖️' },
  { id: 'city', label: 'Stadt', emoji: '🏙️' },
  { id: 'hiking', label: 'Wandern', emoji: '🥾' },
  { id: 'culture', label: 'Kultur', emoji: '🏛️' },
  { id: 'nature', label: 'Natur', emoji: '🌲' },
  { id: 'wellness', label: 'Wellness', emoji: '🧖' },
  { id: 'adventure', label: 'Abenteuer', emoji: '🧗' },
  { id: 'winter', label: 'Wintersport', emoji: '⛷️' },
] as const;

export const TRANSPORTS = [
  { id: 'train', label: 'Bahn', emoji: '🚆' },
  { id: 'plane', label: 'Flugzeug', emoji: '✈️' },
  { id: 'car', label: 'Auto', emoji: '🚗' },
] as const;

export function interestLabel(id: string): string {
  const found = INTERESTS.find((i) => i.id === id);
  return found ? `${found.emoji} ${found.label}` : id;
}

export function transportLabel(id: string): string {
  const found = TRANSPORTS.find((t) => t.id === id);
  return found ? `${found.emoji} ${found.label}` : id;
}

/** Zählt, wie oft jede Option über alle Auswahllisten hinweg gewählt wurde. */
export function countVotes(selections: Iterable<readonly string[]>): Map<string, number> {
  const counts = new Map<string, number>();
  for (const list of selections) {
    for (const id of new Set(list)) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}

/** Die beliebtesten Optionen (nur mit mindestens einer Stimme). Gleichstand: alphabetisch. */
export function topChoices(counts: Map<string, number>, limit: number): string[] {
  return [...counts.entries()]
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([id]) => id);
}
export const BUDGET_MIN = 100;
export const BUDGET_MAX = 3000;
export const BUDGET_STEP = 50;
export const BUDGET_DEFAULT = 1000;

/** Median einer Zahlenliste; null bei leerer Liste. */
export function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Rundet auf das nächste Vielfache der Schrittweite und begrenzt auf Min/Max. */
export function roundBudget(value: number): number {
  const stepped = Math.round(value / BUDGET_STEP) * BUDGET_STEP;
  return Math.min(BUDGET_MAX, Math.max(BUDGET_MIN, stepped));
}

export function formatEuro(value: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}