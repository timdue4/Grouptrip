import { describe, expect, it } from 'vitest';
import { addDays, findBestWindows, isWeekend, monthKeys } from './availability';

function range(from: string, to: string): Set<string> {
  const s = new Set<string>();
  for (let k = from; k <= to; k = addDays(k, 1)) s.add(k);
  return s;
}

describe('Datumshelfer', () => {
  it('addDays rollt über Monats- und Jahresgrenzen', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
  it('isWeekend erkennt Samstag und Sonntag', () => {
    expect(isWeekend('2026-07-11')).toBe(true); // Samstag
    expect(isWeekend('2026-07-13')).toBe(false); // Montag
  });
  it('monthKeys liefert die richtige Tagesanzahl', () => {
    expect(monthKeys(2026, 1)).toHaveLength(28);
    expect(monthKeys(2028, 1)).toHaveLength(29);
  });
});

describe('findBestWindows', () => {
  it('liefert [] ohne Mitglieder', () => {
    expect(findBestWindows({ year: 2026, duration: 7, availability: new Map(), freeDays: new Set() })).toEqual([]);
  });

  it('wirft bei ungültiger Dauer', () => {
    expect(() =>
      findBestWindows({ year: 2026, duration: 0, availability: new Map([['a', new Set()]]), freeDays: new Set() }),
    ).toThrow(RangeError);
  });

  it('findet Zeitraum, in dem alle können, und bevorzugt Feiertage', () => {
    const days = range('2026-07-06', '2026-07-19');
    const result = findBestWindows({
      year: 2026,
      duration: 7,
      availability: new Map([
        ['a', days],
        ['b', days],
      ]),
      freeDays: new Set(['2026-07-08']),
    });
    expect(result).toHaveLength(1); // alle Fenster liegen im selben Block
    expect(result[0]).toMatchObject({ start: '2026-07-06', end: '2026-07-12', everyone: true, leaveDays: 4 });
  });

  it('fällt auf Teilübereinstimmungen zurück und nennt fehlende Personen', () => {
    const result = findBestWindows({
      year: 2026,
      duration: 7,
      availability: new Map([
        ['a', range('2026-07-06', '2026-07-12')],
        ['b', range('2026-08-03', '2026-08-09')],
      ]),
      freeDays: new Set(),
    });
    expect(result).toHaveLength(2);
    expect(result.every((w) => !w.everyone)).toBe(true);
    expect(result[0].start).toBe('2026-07-06');
    expect(result[0].missingIds).toEqual(['b']);
    expect(result[1].start).toBe('2026-08-03');
  });

  it('liefert höchstens das Limit an nicht überlappenden Vorschlägen', () => {
    const all = range('2026-01-01', '2026-12-31');
    const result = findBestWindows({
      year: 2026,
      duration: 7,
      availability: new Map([['a', all]]),
      freeDays: new Set(),
    });
    expect(result).toHaveLength(3);
    expect(result[1].start > result[0].end).toBe(true);
  });
});