import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !key) {
  throw new Error('VITE_SUPABASE_URL oder VITE_SUPABASE_ANON_KEY fehlt.');
}

export const supabase = createClient(url, key);

let pending: Promise<string> | null = null;

/** Stellt eine (anonyme) Sitzung sicher und liefert die User-ID. */
export function ensureSession(): Promise<string> {
  pending ??= (async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) return data.session.user.id;
    const { data: created, error } = await supabase.auth.signInAnonymously();
    if (error || !created.user) throw error ?? new Error('Anonyme Anmeldung fehlgeschlagen');
    return created.user.id;
  })().catch((e: unknown) => {
    pending = null;
    throw e;
  });
  return pending;
}