import React from 'react';
import { ArrowLeft } from 'lucide-react';
import type { AppState } from '../engine/progress';
import { AirportHome } from './airport/AirportDesigner';

export function BuildExplore({ state, onBack, onAirport, onPassport }: {
  state: AppState; onBack: () => void; onAirport: () => void; onPassport: () => void;
}) {
  return <main className="growth-page">
    <header className="mb-7 flex items-center gap-4">
      <button className="growth-back" aria-label="Back to home" onClick={onBack}><ArrowLeft /></button>
      <div><p className="growth-eyebrow">Make something. Try an idea.</p>
        <h1 className="font-kid text-4xl font-semibold text-teal-950">Build &amp; Explore</h1>
        <p className="mt-2 text-slate-600">A place to design, test, and discover. All on screen.</p></div>
    </header>
    <AirportHome state={state} onPlay={onAirport} onJournal={onPassport} />
  </main>;
}
