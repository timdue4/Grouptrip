import { describe, expect, it } from 'vitest';
import { getHolidayMap } from './holidays';

describe('getHolidayMap', () => {
  it('enthält bundesweite Feiertage', () => {
      const nw = getHolidayMap(2026, 'NW');
          expect(nw.has('2026-01-01')).toBe(true);
              expect(nw.has('2026-12-25')).toBe(true);
                });
                  it('berücksichtigt landesspezifische Feiertage', () => {
                      expect(getHolidayMap(2026, 'BY').has('2026-01-06')).toBe(true);
                          expect(getHolidayMap(2026, 'NW').has('2026-01-06')).toBe(false);
                            });
                            });