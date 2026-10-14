import { describe, expect, it } from 'vitest';
import { INTERESTS, TRANSPORTS, countVotes, interestLabel, topChoices, transportLabel } from './travel';

describe('Konstanten', () => {
  it('Reisetypen stimmen mit der Datenbank überein', () => {
    expect(INTERESTS.map((i) => i.id)).toEqual([
      'beach', 'city', 'hiking', 'culture', 'nature', 'wellness', 'adventure', 'winter',
    ]);
  });
  it('Verkehrsmittel stimmen mit der Datenbank überein', () => {
    expect(TRANSPORTS.map((t) => t.id)).toEqual(['train', 'plane', 'car']);
  });
});

describe('Labels', () => {
  it('liefert Beschriftungen und fällt auf die ID zurück', () => {
    expect(interestLabel('beach')).toContain('Strand');
    expect(transportLabel('train')).toContain('Bahn');
    expect(interestLabel('unbekannt')).toBe('unbekannt');
  });
});

describe('countVotes', () => {
  it('zählt Stimmen pro Option', () => {
    const counts = countVotes([['beach', 'city'], ['beach'], []]);
    expect(counts.get('beach')).toBe(2);
    expect(counts.get('city')).toBe(1);
    expect(counts.get('hiking')).toBeUndefined();
  });
  it('zählt doppelte Einträge einer Person nur einmal', () => {
    expect(countVotes([['beach', 'beach']]).get('beach')).toBe(1);
  });
});

describe('topChoices', () => {
  const counts = new Map([['city', 2], ['beach', 2], ['hiking', 1], ['winter', 0]]);
  it('sortiert nach Stimmen und bei Gleichstand alphabetisch', () => {
    expect(topChoices(counts, 2)).toEqual(['beach', 'city']);
  });
  it('lässt Optionen ohne Stimmen weg', () => {
    expect(topChoices(counts, 5)).toEqual(['beach', 'city', 'hiking']);
  });
  it('liefert [] ohne Stimmen', () => {
    expect(topChoices(new Map(), 3)).toEqual([]);
  });
});