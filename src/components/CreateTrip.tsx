import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { CITIES, airportLabel, cityById } from '../data/cities';

const input = 'mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-base';

export function CreateTrip() {
  const now = new Date();
  const defaultYear = now.getMonth() >= 8 ? now.getFullYear() + 1 : now.getFullYear();

  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [cityId, setCityId] = useState(CITIES[0].id);
  const [year, setYear] = useState(defaultYear);
  const [duration, setDuration] = useState(7);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const city = cityById(cityId) ?? CITIES[0];

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { data, error: rpcError } = await supabase.rpc('create_trip', {
      p_name: name.trim(),
      p_start_city: city.id,
      p_year: year,
      p_state: city.state,
      p_duration: duration,
      p_display_name: displayName.trim(),
    });
    if (rpcError || typeof data !== 'string') {
      console.error(rpcError);
      setError('Die Reise konnte nicht erstellt werden. Bitte Eingaben prüfen.');
      setBusy(false);
      return;
    }
    window.location.assign(`/t/${data}`);
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-lg space-y-4 rounded-2xl bg-white p-5 shadow">
      <h1 className="text-2xl font-bold">Neue Gruppenreise</h1>

      <label className="block">
        <span className="text-sm font-medium">Name der Reise</span>
        <input className={input} required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Sommer 2027" />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Dein Name</span>
        <input className={input} required maxLength={40} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Startort in Deutschland</span>
        <select className={input} value={cityId} onChange={(e) => setCityId(e.target.value)}>
          {CITIES.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <span className="mt-1 block text-sm text-slate-600">
          Nächste Flughäfen: {city.airports.map(airportLabel).join(', ')}
        </span>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-medium">Jahr</span>
          <select className={input} value={year} onChange={(e) => setYear(Number(e.target.value))}>
            <option value={defaultYear}>{defaultYear}</option>
            <option value={defaultYear + 1}>{defaultYear + 1}</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Dauer (Tage)</span>
          <input className={input} type="number" min={1} max={60} required value={duration} onChange={(e) => setDuration(Math.min(60, Math.max(1, Number(e.target.value) || 1)))} />
        </label>
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <button disabled={busy} className="w-full rounded-lg bg-emerald-600 p-3 font-semibold text-white disabled:opacity-60">
        {busy ? 'Erstelle …' : 'Reise erstellen'}
      </button>
    </form>
  );
}