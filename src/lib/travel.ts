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