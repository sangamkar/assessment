import React, { useState } from 'react';
import type { GrowthSession, GrowthState } from '../../engine/growth';
import { SketchPad } from './SketchPad';

const MISSIONS = [
  { id: 'screen-picture', title: 'Make a shape picture', prompt: 'Tap shapes to build a picture. Add a sketch if you like.', pieces: ['🔴', '🟦', '🔺', '🟨', '🟢', '⭐'] },
  { id: 'screen-pattern', title: 'Make a pattern', prompt: 'Tap pieces to make a pattern. Can you make it repeat?', pieces: ['🔴', '🔵', '🟨', '⭐', '🟩', '💜'] },
  { id: 'screen-story', title: 'Make a picture story', prompt: 'Tap pictures to make a story, then tell us about it.', pieces: ['🐻', '🐸', '🌳', '🏠', '🌧️', '🌈'] },
] as const;
const button = 'rounded-2xl bg-teal-600 px-4 py-3 font-kid font-bold text-white shadow';
const uid = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const label = (id: string) => MISSIONS.find((m) => m.id === id)?.title ?? 'Earlier discovery';

export function Discovery({ growth, update, onBack, storageError }: { storageError: boolean; growth: GrowthState; update: (fn: (g: GrowthState) => GrowthState) => void; onBack: () => void }) {
  const [active, setActive] = useState<string | null>(null);
  const [journal, setJournal] = useState(false);
  const session = growth.sessions.find((s) => s.id === active);
  const mission = MISSIONS.find((m) => m.id === session?.activityId);
  const edit = (patch: Partial<GrowthSession>) => update((g) => ({ ...g, sessions: g.sessions.map((s) => s.id === active ? { ...s, ...patch } : s) }));
  const start = (activityId: string) => {
    const entry: GrowthSession = { id: uid(), activityId, startedAt: Date.now(), reflection: '', drawing: [], strategies: [], pieces: [] };
    update((g) => ({ ...g, sessions: [...g.sessions, entry] }));
    setActive(entry.id);
  };
  return <main className="mx-auto min-h-screen max-w-3xl space-y-5 px-4 py-6">
    <header className="flex items-center gap-3"><button className="rounded-xl bg-white px-4 py-2 font-bold shadow" onClick={() => session ? setActive(null) : onBack()}>← Back</button><h1 className="font-kid text-3xl font-bold text-slate-800">{session ? label(session.activityId) : 'Discover & create'}</h1></header>
    {storageError && <p role="alert" className="rounded-xl bg-amber-100 p-3 text-amber-900">This device could not save changes. Ask a grown-up to download a backup from Settings before leaving.</p>}
    {session ? <section className="space-y-4 rounded-3xl bg-white p-5 shadow">
      {mission ? <><p className="font-kid text-xl">{mission.prompt}</p><div className="flex flex-wrap gap-2" aria-label="Pieces to add">{mission.pieces.map((piece) => <button key={piece} aria-label={`Add ${piece}`} className="rounded-xl bg-teal-50 p-3 text-3xl" onClick={() => edit({ pieces: [...(session.pieces ?? []), piece].slice(0, 30) })}>{piece}</button>)}</div><div className="min-h-20 rounded-2xl bg-slate-50 p-4 text-4xl" aria-label="Your creation">{(session.pieces ?? []).join(' ') || '✨'}</div><button className="rounded-xl bg-slate-100 px-3 py-2 font-bold" onClick={() => edit({ pieces: (session.pieces ?? []).slice(0, -1) })}>Undo piece</button></> : <p className="text-slate-600">This discovery was saved in an earlier version. Your sketch and reflection are here.</p>}
      <SketchPad drawing={Array.isArray(session.drawing) ? session.drawing : []} onChange={(drawing) => edit({ drawing })} />
      <label className="block font-bold text-slate-700">Tell me about your idea<textarea className="mt-2 block w-full rounded-xl border border-slate-300 p-3 font-normal" value={session.reflection ?? ''} maxLength={500} onChange={(e) => edit({ reflection: e.target.value })} /></label>
      {mission && <button className={button} disabled={!(session.pieces?.length || session.drawing?.length)} onClick={() => { edit({ triedAt: session.triedAt ?? Date.now() }); setActive(null); setJournal(true); }}>Save my creation</button>}
      <p className="text-sm text-slate-500">{storageError ? "Changes are only in memory until saving works." : "Your changes are saved on this device."}</p>
    </section> : <><div className="flex gap-3"><button className={button} onClick={() => setJournal(false)}>Missions</button><button className={button} onClick={() => setJournal(true)}>Discovery journal</button></div>{journal ? <section className="space-y-3">{growth.sessions.length === 0 && <p>Your journal is ready for your first creation.</p>}{[...growth.sessions].reverse().map((s) => <button key={s.id} className="block w-full rounded-2xl bg-white p-4 text-left shadow" onClick={() => setActive(s.id)}><strong>{label(s.activityId)}</strong><span className="ml-2 text-sm text-slate-500">{s.triedAt ? 'Saved' : 'In progress'}</span><p className="truncate text-slate-600">{s.reflection || (s.pieces ?? []).join(' ') || 'Open your idea'}</p></button>)}</section> : <div className="grid gap-3 sm:grid-cols-3">{MISSIONS.map((m) => <button key={m.id} className="rounded-3xl bg-white p-5 text-left shadow" onClick={() => start(m.id)}><span className="text-4xl">{m.pieces[0]}</span><h2 className="mt-3 font-kid text-xl font-bold">{m.title}</h2><p className="mt-2 text-sm text-slate-600">{m.prompt}</p></button>)}</div>}</>}
  </main>;
}

export function GrowthReview({ growth, update }: { growth: GrowthState; update: (fn: (g: GrowthState) => GrowthState) => void }) {
  const [selected, setSelected] = useState('');
  const [support, setSupport] = useState<'trying' | 'assisted' | 'independent'>('trying');
  const [note, setNote] = useState('');
  const save = () => {
    if (!selected || !note.trim()) return;
    update((g) => ({ ...g, observations: [...g.observations, { id: uid(), sessionId: selected, ts: Date.now(), support, note: note.trim().slice(0, 500) }] }));
    setNote('');
  };
  return <section className="space-y-4 rounded-2xl bg-white p-5 shadow"><h2 className="text-xl font-bold">Growth review</h2><p className="text-slate-600">Record what you noticed. Observations do not award academic mastery.</p><label className="block">Discovery<select className="mt-1 block w-full rounded-xl border p-2" value={selected} onChange={(e) => setSelected(e.target.value)}><option value="">Choose a discovery</option>{growth.sessions.map((s) => <option key={s.id} value={s.id}>{label(s.activityId)} · {new Date(s.startedAt).toLocaleDateString()}</option>)}</select></label><label className="block">Support<select className="mt-1 block w-full rounded-xl border p-2" value={support} onChange={(e) => setSupport(e.target.value as typeof support)}><option value="trying">Trying</option><option value="assisted">Assisted work</option><option value="independent">Independent work</option></select></label><label className="block">What did you notice?<textarea className="mt-1 block w-full rounded-xl border p-2" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} /></label><button className={button} disabled={!selected || !note.trim()} onClick={save}>Save observation</button><div className="space-y-2">{[...growth.observations].reverse().map((o) => <div key={o.id} className="rounded-xl bg-slate-50 p-3"><strong>{o.support === 'together' || o.support === 'reminders' ? `Assisted (${o.support})` : o.support}</strong> · {label(growth.sessions.find((s) => s.id === o.sessionId)?.activityId ?? '')}<p>{o.note}</p></div>)}</div></section>;
}
