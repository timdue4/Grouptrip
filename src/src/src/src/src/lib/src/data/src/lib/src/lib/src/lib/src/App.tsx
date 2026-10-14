import { useEffect, useState } from 'react';
import { ensureSession } from './lib/supabase';
import { CreateTrip } from './components/CreateTrip';
import { TripPage } from './components/TripPage';

function parseCode(): string | null {
  const m = window.location.pathname.match(/^\/t\/([a-z0-9]{8})\/?$/i);
    return m ? m[1].toLowerCase() : null;
    }

    export function App() {
      const [userId, setUserId] = useState<string | null>(null);
        const [error, setError] = useState<string | null>(null);
          const code = parseCode();

            useEffect(() => {
                ensureSession()
                      .then(setUserId)
                            .catch((e: unknown) => {
                                    console.error(e);
                                            setError('Anmeldung fehlgeschlagen. Bitte Seite neu laden.');
                                                  });
                                                    }, []);

                                                      return (
                                                          <main className="mx-auto max-w-5xl p-4 sm:p-6">
                                                                <header className="mb-6">
                                                                        <a href="/" className="text-xl font-bold text-emerald-700">
                                                                                  GroupTrip
                                                                                          </a>
                                                                                                </header>
                                                                                                      {error ? (
                                                                                                              <p role="alert" className="text-red-600">{error}</p>
                                                                                                                    ) : !userId ? (
                                                                                                                            <p>Lade …</p>
                                                                                                                                  ) : code ? (
                                                                                                                                          <TripPage code={code} userId={userId} />
                                                                                                                                                ) : (
                                                                                                                                                        <CreateTrip />
                                                                                                                                                              )}
                                                                                                                                                                  </main>
                                                                                                                                                                    );
                                                                                                                                                                    }