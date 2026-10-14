import type { Stage } from '../types';

const STEPS: { id: Stage; label: string }[] = [
  { id: 'dates', label: 'Termin' },
  { id: 'interests', label: 'Reisetyp' },
  { id: 'transport', label: 'Anreise' },
  { id: 'destination', label: 'Ziel' },
];

export function Stepper({ stage }: { stage: Stage }) {
  const current = STEPS.findIndex((s) => s.id === stage);
  return (
    <ol className="flex flex-wrap gap-2" aria-label="Fortschritt">
      {STEPS.map((s, i) => (
        <li
          key={s.id}
          aria-current={i === current ? 'step' : undefined}
          className={`rounded-full px-3 py-1 text-sm ${
            i < current
              ? 'bg-emerald-100 text-emerald-800'
              : i === current
                ? 'bg-emerald-600 font-semibold text-white'
                : 'bg-slate-200 text-slate-600'
          }`}
        >
          {i < current ? '✓ ' : `${i + 1}. `}
          {s.label}
        </li>
      ))}
    </ol>
  );
}