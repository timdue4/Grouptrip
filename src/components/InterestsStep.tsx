import { useState } from 'react';
import {
  BUDGET_DEFAULT, BUDGET_MAX, BUDGET_MIN, BUDGET_STEP, INTERESTS,
  countVotes, formatEuro, median, roundBudget, topChoices,
} from '../lib/travel';

interface Props {
  selections: Map<string, string[]>; // Reisender → gewählte Reisetypen
  budgets: Map<string, number | null>; // Reisender → Budget pro Person
  mine: string[];
  myBudget: number | null;
  isTraveler: boolean;
  isCreator: boolean;
  busy: boolean;
  onChangeMine: (next: string[]) => void;
  onChangeBudget: (next: number) => void;
  onLock: (picked: string[], budget: number) => void;
}

const MAX_PICKED = 4;

export function InterestsStep({
  selections, budgets, mine, myBudget, isTraveler, isCreator, busy, onChangeMine, onChangeBudget, onLock,
}: Props) {
  const [picked, setPicked] = useState<string[]>([]);
  const [lockBudget, setLockBudget] = useState<number | null>(null);

  const counts = countVotes(selections.values());
  const voted = [...selections.values()].filter((l) => l.length > 0).length;

  const entered = [...budgets.values()].filter((b): b is number => b !== null);
  const med = median(entered);
  const lockValue = lockBudget ?? (med !== null ? roundBudget(med) : BUDGET_DEFAULT);

  const toggleMine = (id: string) => {
    onChangeMine(mine.includes(id) ? mine.filter((x) => x !== id) : [...mine, id]);
  };
  const togglePicked = (id: string) => {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < MAX_PICKED ? [...p, id] : p));
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Was für eine Reise wollt ihr machen?</h2>
        <p className="text-sm text-slate-600">
          Wähle alles, worauf du Lust hast. {voted} von {selections.size} Reisenden haben gewählt.
        </p>
      </div>

      {!isTraveler && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          Du hast dem festgelegten Termin nicht zugestimmt und kannst hier nicht abstimmen.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {INTERESTS.map((i) => {
          const on = mine.includes(i.id);
          return (
            <button
              key={i.id}
              type="button"
              aria-pressed={on}
              disabled={!isTraveler}
              onClick={() => toggleMine(i.id)}
              className={`relative rounded-xl p-4 text-center disabled:opacity-60 ${
                on ? 'bg-emerald-600 text-white' : 'bg-white shadow-sm ring-1 ring-slate-200'
              }`}
            >
              <span className="block text-3xl" aria-hidden="true">{i.emoji}</span>
              <span className="mt-1 block text-sm font-medium">{i.label}</span>
              <span className={`absolute right-2 top-2 rounded-full px-2 text-xs ${on ? 'bg-white/30' : 'bg-slate-100 text-slate-700'}`}>
                {counts.get(i.id) ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
        <h3 className="font-semibold">Budget pro Person</h3>
        <p className="text-sm text-slate-600">
          Für die gesamte Reise: Anreise und Unterkunft, ohne Verpflegung und Aktivitäten.
        </p>
        <label className="block">
          <span className="text-sm font-medium">
            Mein Budget: {myBudget === null ? 'noch nicht gewählt' : formatEuro(myBudget)}
          </span>
          <input
            type="range"
            className="mt-2 w-full accent-emerald-600"
            min={BUDGET_MIN}
            max={BUDGET_MAX}
            step={BUDGET_STEP}
            disabled={!isTraveler}
            value={myBudget ?? BUDGET_DEFAULT}
            onChange={(e) => onChangeBudget(Number(e.target.value))}
            aria-label="Mein Budget pro Person in Euro"
          />
          <span className="flex justify-between text-xs text-slate-500">
            <span>{formatEuro(BUDGET_MIN)}</span>
            <span>{formatEuro(BUDGET_MAX)}</span>
          </span>
        </label>
        <p className="text-sm text-slate-600" role="status">
          {entered.length} von {budgets.size} haben ein Budget gewählt
          {med !== null &&
            ` · Spanne ${formatEuro(Math.min(...entered))} bis ${formatEuro(Math.max(...entered))} · Median ${formatEuro(med)}`}
        </p>
      </div>

      {isCreator && (
        <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
          <h3 className="font-semibold">Endgültige Auswahl (nur Ersteller)</h3>
          <p className="text-sm text-slate-600">Wähle bis zu {MAX_PICKED} Reisetypen oder übernimm die beliebtesten.</p>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((i) => (
              <button
                key={i.id}
                type="button"
                aria-pressed={picked.includes(i.id)}
                onClick={() => togglePicked(i.id)}
                className={`rounded-full px-3 py-2 text-sm ${
                  picked.includes(i.id) ? 'bg-emerald-600 text-white' : 'bg-slate-200'
                }`}
              >
                {i.emoji} {i.label} ({counts.get(i.id) ?? 0})
              </button>
            ))}
          </div>

          <label className="block">
            <span className="text-sm font-medium">Gruppenbudget pro Person: {formatEuro(lockValue)}</span>
            <input
              type="range"
              className="mt-2 w-full accent-emerald-600"
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={BUDGET_STEP}
              value={lockValue}
              onChange={(e) => setLockBudget(Number(e.target.value))}
              aria-label="Gruppenbudget pro Person in Euro"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPicked(topChoices(counts, 3))}
              className="rounded-lg bg-slate-200 px-4 py-2 text-sm"
            >
              Top 3 übernehmen
            </button>
            <button
              type="button"
              disabled={busy || picked.length === 0}
              onClick={() => onLock(picked, lockValue)}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Reisetyp und Budget festlegen
            </button>
          </div>
        </div>
      )}

      {!isCreator && <p className="text-xs text-slate-500">Reisetyp und Budget legt der Ersteller fest.</p>}
    </section>
  );
}