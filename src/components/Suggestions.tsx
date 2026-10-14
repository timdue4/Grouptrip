import type { TripWindow } from '../lib/availability';

const fmt = new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const format = (key: string): string => fmt.format(new Date(`${key}T00:00:00Z`));

interface Props {
  windows: TripWindow[];
  names: Map<string, string>;
  duration: number;
}

export function Suggestions({ windows, names, duration }: Props) {
  if (windows.length === 0) {
    return (
      <p className="rounded-xl bg-white p-4 text-slate-600 shadow-sm">
        Noch keine Übereinstimmung für {duration} Tage. Trage im Kalender freie Tage ein.
      </p>
    );
  }
  return (
    <ol className="grid gap-3 md:grid-cols-3">
      {windows.map((w, i) => (
        <li key={w.start} className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-emerald-700">Vorschlag {i + 1}</p>
          <p className="mt-1 font-semibold">{format(w.start)}</p>
          <p className="font-semibold">bis {format(w.end)}</p>
          <p className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs ${w.everyone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
            {w.everyone ? 'Alle können' : `${w.availableIds.length} von ${w.availableIds.length + w.missingIds.length} können`}
          </p>
          <p className="mt-2 text-sm text-slate-600">Urlaubstage nötig: {w.leaveDays}</p>
          {!w.everyone && (
            <p className="text-sm text-slate-600">
              Es fehlen: {w.missingIds.map((id) => names.get(id) ?? '?').join(', ')}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}