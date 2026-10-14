export type DateKey = string; // 'YYYY-MM-DD'

export interface TripWindow {
  start: DateKey;
  end: DateKey;
  availableIds: string[];
  missingIds: string[];
  everyone: boolean;
  leaveDays: number; // benötigte Urlaubstage (ohne Wochenenden/Feiertage)
}

export interface FindOptions {
  year: number;
  duration: number;
  availability: Map<string, Set<DateKey>>; // userId → freie Tage
  freeDays: Set<DateKey>; // Feiertage
  limit?: number;
}

const MIN_GAP_DAYS = 7;

const pad = (n: number): string => String(n).padStart(2, '0');

export function addDays(key: DateKey, n: number): DateKey {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function isWeekend(key: DateKey): boolean {
  const dow = new Date(`${key}T00:00:00Z`).getUTCDay();
  return dow === 0 || dow === 6;
}

/** Alle Tage eines Monats (monthIndex 0–11). */
export function monthKeys(year: number, monthIndex: number): DateKey[] {
  const count = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  return Array.from({ length: count }, (_, i) => `${year}-${pad(monthIndex + 1)}-${pad(i + 1)}`);
}

function overlaps(a: TripWindow, b: TripWindow): boolean {
  return a.start <= addDays(b.end, MIN_GAP_DAYS) && b.start <= addDays(a.end, MIN_GAP_DAYS);
}

/**
 * Findet die besten Reisezeiträume: erst nach Anzahl verfügbarer Personen,
 * dann nach wenigsten Urlaubstagen, dann nach frühestem Start.
 * Die Vorschläge überschneiden sich nicht.
 */
export function findBestWindows(opts: FindOptions): TripWindow[] {
  const { year, duration, availability, freeDays, limit = 3 } = opts;
  if (!Number.isInteger(duration) || duration < 1) {
    throw new RangeError('duration muss eine ganze Zahl >= 1 sein');
  }
  const memberIds = [...availability.keys()];
  if (memberIds.length === 0) return [];

  const last = `${year}-12-31`;
  const candidates: TripWindow[] = [];

  for (let start = `${year}-01-01`; ; start = addDays(start, 1)) {
    const end = addDays(start, duration - 1);
    if (end > last) break;

    const days: DateKey[] = [];
    for (let i = 0; i < duration; i++) days.push(addDays(start, i));

    const availableIds = memberIds.filter((id) => {
      const set = availability.get(id);
      return set !== undefined && days.every((d) => set.has(d));
    });
    if (availableIds.length === 0) continue;

    candidates.push({
      start,
      end,
      availableIds,
      missingIds: memberIds.filter((id) => !availableIds.includes(id)),
      everyone: availableIds.length === memberIds.length,
      leaveDays: days.filter((d) => !isWeekend(d) && !freeDays.has(d)).length,
    });
  }

  candidates.sort(
    (a, b) =>
      b.availableIds.length - a.availableIds.length ||
      a.leaveDays - b.leaveDays ||
      (a.start < b.start ? -1 : 1),
  );

  const picked: TripWindow[] = [];
  for (const c of candidates) {
    if (picked.length >= limit) break;
    if (picked.every((p) => !overlaps(p, c))) picked.push(c);
  }
  return picked;
}