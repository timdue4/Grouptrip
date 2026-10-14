import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { AvailabilityRow, DateOption, DateVoteRow, Member, PreferenceRow, Stage, Trip } from '../types';
import { airportLabel, cityById } from '../data/cities';
import { getHolidayMap } from '../lib/holidays';
import { findBestWindows } from '../lib/availability';
import { dayCount, formatRange } from '../lib/format';
import { interestLabel, transportLabel } from '../lib/travel';
import { Calendar } from './Calendar';
import { Suggestions } from './Suggestions';
import { JoinTrip } from './JoinTrip';
import { Stepper } from './Stepper';
import { DateVote } from './DateVote';
import { InterestsStep } from './InterestsStep';
import { TransportStep } from './TransportStep';

type Status = 'loading' | 'ready' | 'notMember' | 'error';
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const NO_TRAVELERS: string[] = [];

function InviteButton({ trip }: { trip: Trip }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/t/${trip.code}`;
  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: trip.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
      }
    } catch {
      /* Teilen abgebrochen */
    }
  };
  return (
    <button type="button" onClick={share} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
      {copied ? 'Link kopiert ✓' : 'Freunde einladen'}
    </button>
  );
}

interface SummaryProps {
  trip: Trip;
  names: Map<string, string>;
  isCreator: boolean;
  busy: boolean;
  onReopen: (stage: Exclude<Stage, 'destination'>) => void;
}

function Summary({ trip, names, isCreator, busy, onReopen }: SummaryProps) {
  if (!trip.chosen_start || !trip.chosen_end) return null;
  const travelerNames = trip.travelers.map((id) => names.get(id) ?? '?');
  const reopen = (stage: Exclude<Stage, 'destination'>) => {
    if (window.confirm('Spätere Entscheidungen werden dabei zurückgesetzt. Fortfahren?')) onReopen(stage);
  };
  const btn = 'rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-emerald-300 disabled:opacity-40';
  return (
    <section className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
      <h2 className="font-semibold">Bisherige Entscheidungen</h2>
      <dl className="mt-2 space-y-1 text-sm">
        <div>
          <dt className="inline font-medium">Termin: </dt>
          <dd className="inline">
            {formatRange(trip.chosen_start, trip.chosen_end)} ({dayCount(trip.chosen_start, trip.chosen_end)} Tage)
          </dd>
        </div>
        <div>
          <dt className="inline font-medium">Reisende ({travelerNames.length}): </dt>
          <dd className="inline">{travelerNames.join(', ')}</dd>
        </div>
        {trip.chosen_interests.length > 0 && (
          <div>
            <dt className="inline font-medium">Reisetyp: </dt>
            <dd className="inline">{trip.chosen_interests.map(interestLabel).join(', ')}</dd>
          </div>
        )}
        {trip.chosen_budget_pp !== null && (
          <div>
            <dt className="inline font-medium">Budget: </dt>
            <dd className="inline">{trip.chosen_budget_pp} € pro Person</dd>
          </div>
        )}
        {trip.chosen_transport && (
          <div>
            <dt className="inline font-medium">Anreise: </dt>
            <dd className="inline">{transportLabel(trip.chosen_transport)}</dd>
          </div>
        )}
      </dl>
      {isCreator && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => reopen('dates')} className={btn}>Termin neu wählen</button>
          {(trip.stage === 'transport' || trip.stage === 'destination') && (
            <button type="button" disabled={busy} onClick={() => reopen('interests')} className={btn}>Reisetyp neu wählen</button>
          )}
          {trip.stage === 'destination' && (
            <button type="button" disabled={busy} onClick={() => reopen('transport')} className={btn}>Anreise neu wählen</button>
          )}
        </div>
      )}
    </section>
  );
}

export function TripPage({ code, userId }: { code: string; userId: string }) {
  const [status, setStatus] = useState<Status>('loading');
  const [trip, setTrip] = useState<Trip | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [others, setOthers] = useState<Map<string, Set<string>>>(new Map());
  const [options, setOptions] = useState<DateOption[]>([]);
  const [myVotes, setMyVotes] = useState<Set<string>>(new Set());
  const [otherVotes, setOtherVotes] = useState<Map<string, Set<string>>>(new Map());
  const [myInterests, setMyInterests] = useState<string[]>([]);
  const [myTransport, setMyTransport] = useState<string | null>(null);
  const [myBudget, setMyBudget] = useState<number | null>(null);
  const [otherPrefs, setOtherPrefs] = useState<Map<string, PreferenceRow>>(new Map());
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const saveTimer = useRef<number | undefined>(undefined);
  const prefsTimer = useRef<number | undefined>(undefined);
  const votePending = useRef(0);

  const loadTrip = useCallback(async (): Promise<Trip | null> => {
    const { data, error } = await supabase.from('trips').select('*').eq('code', code).maybeSingle();
    if (error) throw error;
    return data as Trip | null;
  }, [code]);

  const loadData = useCallback(
    async (tripId: string, initial: boolean) => {
      const [m, a, o, v, p] = await Promise.all([
        supabase.from('members').select('user_id, display_name').eq('trip_id', tripId),
        supabase.from('availability').select('user_id, days').eq('trip_id', tripId),
        supabase.from('date_options').select('start_date, end_date').eq('trip_id', tripId).order('start_date'),
        supabase.from('date_votes').select('user_id, starts').eq('trip_id', tripId),
        supabase.from('preferences').select('user_id, interests, transport').eq('trip_id', tripId),
      ]);
      if (m.error) throw m.error;
      if (a.error) throw a.error;
      if (o.error) throw o.error;
      if (v.error) throw v.error;
      if (p.error) throw p.error;

      setMembers(m.data as Member[]);

      const avail = new Map<string, Set<string>>();
      for (const row of a.data as AvailabilityRow[]) {
        if (row.user_id === userId) {
          if (initial) setMine(new Set(row.days));
        } else {
          avail.set(row.user_id, new Set(row.days));
        }
      }
      setOthers(avail);

      setOptions(o.data as DateOption[]);

      const votes = new Map<string, Set<string>>();
      let ownVotes = new Set<string>();
      for (const row of v.data as DateVoteRow[]) {
        if (row.user_id === userId) ownVotes = new Set(row.starts);
        else votes.set(row.user_id, new Set(row.starts));
      }
      setOtherVotes(votes);
      if (votePending.current === 0) setMyVotes(ownVotes);

      const prefs = new Map<string, PreferenceRow>();
      for (const row of p.data as PreferenceRow[]) {
        if (row.user_id === userId) {
          if (initial) {
            setMyInterests(row.interests);
            setMyTransport(row.transport);
            setMyBudget(row.budget_pp)
          }
        } else {
          prefs.set(row.user_id, row);
        }
      }
      setOtherPrefs(prefs);
    },
    [userId],
  );

  const reloadAll = useCallback(async () => {
    try {
      const t = await loadTrip();
      if (t) {
        setTrip(t);
        await loadData(t.id, false);
      }
    } catch (e) {
      console.error(e);
    }
  }, [loadTrip, loadData]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const t = await loadTrip();
        if (cancelled) return;
        if (!t) {
          setStatus('notMember');
          return;
        }
        setTrip(t);
        await loadData(t.id, true);
        if (!cancelled) setStatus('ready');
      } catch (e) {
        console.error(e);
        if (!cancelled) setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadTrip, loadData]);

  const tripId = trip?.id;
  useEffect(() => {
    if (!tripId) return;
    const filter = `trip_id=eq.${tripId}`;
    const refresh = () => {
      loadData(tripId, false).catch(console.error);
    };
    const channel = supabase
      .channel(`trip-${tripId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'availability', filter }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members', filter }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'date_options', filter }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'date_votes', filter }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'preferences', filter }, refresh)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'trips', filter: `id=eq.${tripId}` }, () => {
        void reloadAll();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [tripId, loadData, reloadAll]);

  const persist = useCallback(
    (next: Set<string>) => {
      if (!tripId) return;
      setSaveState('saving');
      window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(async () => {
        const { error } = await supabase.from('availability').upsert(
          { trip_id: tripId, user_id: userId, days: [...next].sort(), updated_at: new Date().toISOString() },
          { onConflict: 'trip_id,user_id' },
        );
        if (error) console.error(error);
        setSaveState(error ? 'error' : 'saved');
      }, 600);
    },
    [tripId, userId],
  );

  const handleChange = (next: Set<string>) => {
    setMine(next);
    persist(next);
  };

  const holidays = useMemo(
    () => (trip ? getHolidayMap(trip.year, trip.state_code) : new Map<string, string>()),
    [trip?.year, trip?.state_code], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const availabilityByMember = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const m of members) {
      map.set(m.user_id, m.user_id === userId ? mine : (others.get(m.user_id) ?? new Set<string>()));
    }
    return map;
  }, [members, mine, others, userId]);

  const counts = useMemo(() => {
    const c = new Map<string, number>();
    for (const set of availabilityByMember.values()) {
      for (const d of set) c.set(d, (c.get(d) ?? 0) + 1);
    }
    return c;
  }, [availabilityByMember]);

  const windows = useMemo(
    () =>
      trip
        ? findBestWindows({
            year: trip.year,
            duration: trip.duration_days,
            availability: availabilityByMember,
            freeDays: new Set(holidays.keys()),
            limit: 3,
          })
        : [],
    [trip, availabilityByMember, holidays],
  );

  const names = useMemo(() => new Map(members.map((m) => [m.user_id, m.display_name])), [members]);

  const allVotes = useMemo(() => {
    const map = new Map(otherVotes);
    map.set(userId, myVotes);
    return map;
  }, [otherVotes, myVotes, userId]);

  const travelers = trip?.travelers ?? NO_TRAVELERS;

  const interestSelections = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const id of travelers) {
      map.set(id, id === userId ? myInterests : (otherPrefs.get(id)?.interests ?? []));
    }
    return map;
  }, [travelers, myInterests, otherPrefs, userId]);

  const transportSelections = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const id of travelers) {
      map.set(id, id === userId ? myTransport : (otherPrefs.get(id)?.transport ?? null));
    }
    return map;
  }, [travelers, myTransport, otherPrefs, userId]);

  const budgetSelections = useMemo(() => {
    const map = new Map<string, number | null>();
    for (const id of travelers) {
      map.set(id, id === userId ? myBudget : (otherPrefs.get(id)?.budget_pp ?? null));
    }
    return map;
  }, [travelers, myBudget, otherPrefs, userId]);

  if (status === 'loading') return <p>Lade Reise …</p>;
  if (status === 'notMember') return <JoinTrip code={code} />;
  if (status === 'error' || !trip) {
    return <p role="alert" className="text-red-600">Die Reise konnte nicht geladen werden.</p>;
  }

  const city = cityById(trip.start_city);
  const isCreator = trip.created_by === userId;
  const isTraveler = trip.travelers.includes(userId);

  const runRpc = async (fn: string, args: Record<string, unknown>, errorText: string) => {
    setBusy(true);
    setActionError(null);
    const { error } = await supabase.rpc(fn, args);
    if (error) {
      console.error(error);
      setActionError(errorText);
    }
    await reloadAll();
    setBusy(false);
  };

  const changeDuration = async (next: number) => {
    if (next < 1 || next > 60) return;
    const previous = trip.duration_days;
    setTrip({ ...trip, duration_days: next });
    const { error } = await supabase.from('trips').update({ duration_days: next }).eq('id', trip.id);
    if (error) {
      console.error(error);
      setTrip((t) => (t ? { ...t, duration_days: previous } : t));
    }
  };

  const startVote = () =>
    runRpc(
      'start_date_vote',
      { p_trip: trip.id, p_options: windows.map((w) => ({ start: w.start, end: w.end })) },
      'Die Abstimmung konnte nicht gestartet werden.',
    );

  const toggleVote = async (start: string) => {
    const next = new Set(myVotes);
    if (next.has(start)) next.delete(start);
    else next.add(start);
    setMyVotes(next);
    setActionError(null);
    votePending.current += 1;
    const { error } = await supabase.rpc('set_date_votes', { p_trip: trip.id, p_starts: [...next] });
    votePending.current -= 1;
    if (error) {
      console.error(error);
      setActionError('Deine Stimme konnte nicht gespeichert werden.');
      await reloadAll();
    }
  };

const queuePrefs = (interests: string[], transport: string | null, budget: number | null) => {
    setMyInterests(interests);
    setMyTransport(transport);
    setMyBudget(budget);
    window.clearTimeout(prefsTimer.current);
    prefsTimer.current = window.setTimeout(async () => {
      const { error } = await supabase.rpc('set_preferences', {
        p_trip: trip.id,
        p_interests: interests,
        p_transport: transport,
        p_budget: budget,
      });
      if (error) {
        console.error(error);
        setActionError('Deine Auswahl konnte nicht gespeichert werden.');
      }
    }, 400);
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{trip.name}</h1>
          <p className="text-sm text-slate-600">
            Start: {city?.name ?? trip.start_city}
            {city && ` · Flughäfen: ${city.airports.map(airportLabel).join(', ')}`}
          </p>
          <p className="text-sm text-slate-600">
            Teilnehmer ({members.length}): {members.map((m) => m.display_name).join(', ')}
          </p>
        </div>
        <InviteButton trip={trip} />
      </section>

      <Stepper stage={trip.stage} />

      {actionError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}

      {trip.stage !== 'dates' && (
        <Summary
          trip={trip}
          names={names}
          isCreator={isCreator}
          busy={busy}
          onReopen={(stage) => void runRpc('reopen_stage', { p_trip: trip.id, p_stage: stage }, 'Der Schritt konnte nicht zurückgesetzt werden.')}
        />
      )}

      {trip.stage === 'dates' && (
        <>
          <section className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold">{options.length > 0 ? 'Abstimmung: Wann reisen wir?' : 'Beste Zeiträume'}</h2>
              <div className="flex items-center gap-2" aria-label="Reisedauer">
                <button type="button" disabled={!isCreator} onClick={() => changeDuration(trip.duration_days - 1)} className="h-10 w-10 rounded-lg bg-slate-200 disabled:opacity-40" aria-label="Einen Tag weniger">−</button>
                <span className="min-w-20 text-center">{trip.duration_days} Tage</span>
                <button type="button" disabled={!isCreator} onClick={() => changeDuration(trip.duration_days + 1)} className="h-10 w-10 rounded-lg bg-slate-200 disabled:opacity-40" aria-label="Einen Tag mehr">+</button>
              </div>
              {!isCreator && <span className="text-xs text-slate-500">Dauer legt der Ersteller fest</span>}
            </div>

            {options.length > 0 ? (
              <>
                <DateVote
                  options={options}
                  votes={allVotes}
                  names={names}
                  userId={userId}
                  isCreator={isCreator}
                  canRestart={windows.length > 0}
                  busy={busy}
                  onToggle={(s) => void toggleVote(s)}
                  onLock={(s) => void runRpc('lock_dates', { p_trip: trip.id, p_start: s }, 'Der Termin konnte nicht festgelegt werden.')}
                  onRestart={() => void startVote()}
                />
                <details className="rounded-xl bg-white p-3 shadow-sm">
                  <summary className="cursor-pointer text-sm font-medium">Aktuell beste Zeiträume laut Kalender</summary>
                  <div className="mt-3">
                    <Suggestions windows={windows} names={names} duration={trip.duration_days} />
                  </div>
                </details>
              </>
            ) : (
              <>
                <Suggestions windows={windows} names={names} duration={trip.duration_days} />
                {isCreator ? (
                  <button
                    type="button"
                    disabled={busy || windows.length === 0}
                    onClick={() => void startVote()}
                    className="rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white disabled:opacity-40"
                  >
                    Abstimmung über diese Vorschläge starten
                  </button>
                ) : (
                  <p className="text-sm text-slate-600">Der Ersteller startet die Abstimmung, sobald genug Tage eingetragen sind.</p>
                )}
              </>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Wann kannst du? ({trip.year})</h2>
              <span className="text-xs text-slate-500" role="status">
                {saveState === 'saving' && 'Speichere …'}
                {saveState === 'saved' && 'Gespeichert ✓'}
                {saveState === 'error' && 'Speichern fehlgeschlagen'}
              </span>
            </div>
            <Calendar
              year={trip.year}
              selected={mine}
              holidays={holidays}
              counts={counts}
              totalMembers={members.length}
              onChange={handleChange}
            />
          </section>
        </>
      )}

{trip.stage === 'interests' && (
        <InterestsStep
          selections={interestSelections}
          budgets={budgetSelections}
          mine={myInterests}
          myBudget={myBudget}
          isTraveler={isTraveler}
          isCreator={isCreator}
          busy={busy}
          onChangeMine={(next) => queuePrefs(next, myTransport, myBudget)}
          onChangeBudget={(next) => queuePrefs(myInterests, myTransport, next)}
          onLock={(picked, budget) =>
            void runRpc(
              'lock_interests',
              { p_trip: trip.id, p_interests: picked, p_budget: budget },
              'Reisetyp und Budget konnten nicht festgelegt werden.',
            )
          }
        />
      )}

      {trip.stage === 'transport' && (
        <TransportStep
          selections={transportSelections}
          names={names}
          mine={myTransport}
          isTraveler={isTraveler}
          isCreator={isCreator}
          busy={busy}
          onChangeMine={(next) => queuePrefs(myInterests, next, myBudget)}
          onLock={(t) => void runRpc('lock_transport', { p_trip: trip.id, p_transport: t }, 'Das Verkehrsmittel konnte nicht festgelegt werden.')}
        />
      )}

      {trip.stage === 'destination' && (
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Termin, Reisetyp und Anreise stehen fest 🎉</h2>
          <p className="mt-2 text-sm text-slate-600">
            Als Nächstes folgen die Zielvorschläge für {trip.travelers.length} Reisende mit Preisvergleich
            (Modul 3).
          </p>
        </section>
      )}
    </div>
  );
}