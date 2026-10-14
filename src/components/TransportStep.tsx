import { TRANSPORTS } from '../lib/travel';

interface Props {
  selections: Map<string, string | null>; // Reisender → Verkehrsmittel
  names: Map<string, string>;
  mine: string | null;
  isTraveler: boolean;
  isCreator: boolean;
  busy: boolean;
  onChangeMine: (next: string | null) => void;
  onLock: (transport: string) => void;
}

export function TransportStep({ selections, names, mine, isTraveler, isCreator, busy, onChangeMine, onLock }: Props) {
  const voted = [...selections.values()].filter((t) => t !== null).length;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Wie wollt ihr reisen?</h2>
        <p className="text-sm text-slate-600">
          Wähle dein bevorzugtes Verkehrsmittel. {voted} von {selections.size} Reisenden haben gewählt.
        </p>
      </div>

      {!isTraveler && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          Du hast dem festgelegten Termin nicht zugestimmt und kannst hier nicht abstimmen.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {TRANSPORTS.map((t) => {
          const voterIds = [...selections.entries()].filter(([, v]) => v === t.id).map(([id]) => id);
          const on = mine === t.id;
          return (
            <div key={t.id} className="flex flex-col rounded-xl bg-white p-4 text-center shadow-sm">
              <span className="text-4xl" aria-hidden="true">{t.emoji}</span>
              <p className="mt-1 font-semibold">{t.label}</p>
              <p className="text-sm text-slate-600">{voterIds.length} Stimme(n)</p>
              {voterIds.length > 0 && (
                <p className="text-xs text-slate-500">{voterIds.map((id) => names.get(id) ?? '?').join(', ')}</p>
              )}
              <button
                type="button"
                aria-pressed={on}
                disabled={!isTraveler}
                onClick={() => onChangeMine(on ? null : t.id)}
                className={`mt-3 rounded-lg px-4 py-3 font-semibold disabled:opacity-60 ${
                  on ? 'bg-emerald-600 text-white' : 'bg-slate-200'
                }`}
              >
                {on ? '✓ Meine Wahl' : 'Das möchte ich'}
              </button>
              {isCreator && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onLock(t.id)}
                  className="mt-2 rounded-lg border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 disabled:opacity-40"
                >
                  Festlegen
                </button>
              )}
            </div>
          );
        })}
      </div>

      {!isCreator && <p className="text-xs text-slate-500">Das Verkehrsmittel legt der Ersteller fest.</p>}
    </section>
  );
}