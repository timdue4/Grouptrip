import { describe, expect, it } from 'vitest';
import { BUDGET_MAX, BUDGET_MIN, median, roundBudget } from './travel';

describe('median', () => {
  it('liefert null bei leerer Liste', () => {
    expect(median([])).toBeNull();
  });
  it('liefert den mittleren Wert bei ungerader Anzahl', () => {
    expect(median([900, 300, 500])).toBe(500);
  });
  it('mittelt bei gerader Anzahl', () => {
    expect(median([400, 800, 600, 1000])).toBe(700);
  });
});

describe('roundBudget', () => {
  it('rundet auf 50er-Schritte', () => {
    expect(roundBudget(724)).toBe(700);
    expect(roundBudget(726)).toBe(750);
  });
  it('begrenzt auf Minimum und Maximum', () => {
    expect(roundBudget(10)).toBe(BUDGET_MIN);
    expect(roundBudget(99999)).toBe(BUDGET_MAX);
  });
});