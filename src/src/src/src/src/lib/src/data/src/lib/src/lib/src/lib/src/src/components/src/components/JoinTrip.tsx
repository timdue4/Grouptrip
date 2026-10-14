import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';

export function JoinTrip({ code }: { code: string }) {
  const [tripName, setTripName] = useState<string | null>(null);
    const [name, setName] = useState('');
      const [busy, setBusy] = useState(false);
        const [error, setError] = useState<string | null>(null);

          useEffect(() => {
              supabase.rpc('trip_preview', { p_code: code }).then(({ data }) => {
                    setTripName(typeof data === 'string' ? data : null);
                        });
                          }, [code]);

                            const submit = async (e: FormEvent) => {
                                e.preventDefault();
                                    setBusy(true);
                                        setError(null);
                                            const { error: rpcError } = await supabase.rpc('join_trip', { p_code: code, p_display_name: name.trim() });
                                                if (rpcError) {
                                                      console.error(rpcError);
                                                            setError('Beitritt nicht möglich (Reise voll oder Link ungültig).');
                                                                  setBusy(false);
                                                                        return;
                                                                            }
                                                                                window.location.reload();
                                                                                  };

                                                                                    return (
                                                                                        <form onSubmit={submit} className="mx-auto max-w-lg space-y-4 rounded-2xl bg-white p-5 shadow">
                                                                                              <h1 className="text-2xl font-bold">Einladung{tripName ? `: ${tripName}` : ''}</h1>
                                                                                                    <label className="block">
                                                                                                            <span className="text-sm font-medium">Dein Name</span>
                                                                                                                    <input className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-base" required maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
                                                                                                                          </label>
                                                                                                                                {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
                                                                                                                                      <button disabled={busy} className="w-full rounded-lg bg-emerald-600 p-3 font-semibold text-white disabled:opacity-60">
                                                                                                                                              Beitreten
                                                                                                                                                    </button>
                                                                                                                                                        </form>
                                                                                                                                                          );
                                                                                                                                                          }