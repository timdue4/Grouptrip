import type { DateOption } from '../types';
import { dayCount, formatRange } from '../lib/format';

interface Props {
  options: DateOption[];
  votes: Map<string, Set<string>>; // userId → zugestimmte Starttage
  names: Map<string, string>;
  userId: string;
  isCreator: boolean;
  canRestart: boolean;
  busy: boolean;
  onToggle: (start: string) => void;
  onLock: (start: string) => void;
  onRestart: () => void;
}

export function DateVote({ options, votes, names, userId, isCreator, canRestart, busy, onToggle, onLock, onRestart }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Tippe bei jedem Termin, der für dich passt, auf „Passt für mich“. Mehrere Termine sind möglich.
        Wer zustimmt, gehört nach dem Festlegen zur Reisegruppe.
      </p>

      <ol className="grid gap-3 md:grid-cols-3">
        {options.map((o, i) => {
          const voterIds = [...votes.entries()].filter(([, s]) => s.has(o.start_date)).map(([id]) => id);
          const mine = votes.get(userId)?.has(o.start_date) ?? false;
          return (
            <li key={o.start_date} className="flex flex-col rounded-xl bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase text-emerald-700">Termin {i + 1}</p>
              <p className="mt-1 font-semibold">{formatRange(o.start_date, o.end_date)}</p>
              <p className="text-sm text-slate-600">{dayCount(o.start_date, o.end_date)} Tage</p>
              <p className="mt-2 text-sm">
                <strong>{voterIds.length}</strong> von {names.size} stimmen zu
              </p>
              {voterIds.length > 0 && (
                <p className="text-xs text-slate-600">{voterIds.map((id) => names.get(id) ?? '?').join(', ')}</p>
              )}

              <button
                type="button"
                aria-pressed={mine}
                disabled={busy}
                onClick={() => onToggle(o.start_date)}
                className={`mt-3 rounded-lg px-4 py-3 font-semibold disabled:opacity-60 ${
                  mine ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-900'
                }`}
              >
                {mine ? '✓ Passt für mich' : 'Passt für mich'}
              </button>

              {isCreator && (
                <button
                  type="button"
                  disabled={busy || voterIds.length === 0}
                  onClick={() => {
                    if (window.confirm(`Diesen Termin festlegen? ${voterIds.length} Person(en) reisen mit.`)) onLock(o.start_date);
                  }}
                  className="mt-2 rounded-lg border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 disabled:opacity-40"
                >
                  Diesen Termin festlegen
                </button>
              )}
            </li>
          );
        })}
      </ol>

      {isCreator && (
        <button
          type="button"
          disabled={busy || !canRestart}
          onClick={() => {
            if (window.confirm('Alle bisherigen Stimmen werden gelöscht. Neu starten?')) onRestart();
          }}
          className="rounded-lg bg-slate-200 px-4 py-2 text-sm disabled:opacity-40"
        >
          Mit aktuellen Vorschlägen neu starten
        </button>
      )}
    </div>
  );
}