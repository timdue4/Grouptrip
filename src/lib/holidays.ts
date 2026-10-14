import Holidays from 'date-holidays';

/** Gesetzliche Feiertage eines Bundeslands: 'YYYY-MM-DD' → Name. */
export function getHolidayMap(year: number, state: string): Map<string, string> {
  const hd = new Holidays('DE', state);
  const map = new Map<string, string>();
  for (const h of hd.getHolidays(year)) {
    if (h.type === 'public') map.set(h.date.slice(0, 10), h.name);
  }
  return map;
}