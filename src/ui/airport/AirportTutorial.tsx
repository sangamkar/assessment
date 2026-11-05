import React, { useEffect, useState } from 'react';
import { CHALLENGES, editLayout, initialLayout, testLayout } from '../../games/airport';
import { soundEngine } from '../../utils/audio';
import { SpeakButton } from '../SpeakButton';
import { PlanePicture, TerminalPicture } from './AirportArt';

const LESSON = [
  { title: 'Give the plane a place to stop', text: 'Tap the glowing square beside the airport. This is Gate A.' },
  { title: 'Join the plane to its gate', text: 'Tap the three glowing squares to make a path. Leave no gaps!' },
  { title: 'Let’s send the plane!', text: 'Tap Send the plane. Watch it follow your path to Gate A.' },
];

/** A separate sandbox: the tutorial never edits a saved design or records a win. */
export function AirportTutorial({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [layout, setLayout] = useState(initialLayout);
  const [flight, setFlight] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const lesson = LESSON[step];
  const connected = testLayout(layout, CHALLENGES[0]).ok;
  const ready = step === 0 ? layout.gates[0] === 16 : connected;
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReducedMotion(media.matches);
    change(); media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  useEffect(() => { soundEngine.speak(lesson.text); return () => soundEngine.stopSpeech(); }, [lesson.text]);
  return <main className="growth-page airport-tutorial">
    <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div><p className="growth-eyebrow">Build &amp; Explore · Airport Designer</p><h1 className="font-kid text-3xl font-semibold text-teal-950">Let’s build one together</h1></div>
      <button className="growth-secondary" onClick={onDone}>Skip tutorial</button>
    </header>
    <div className="tutorial-layout">
      <section className="growth-feature">
        <div className="tutorial-instructions"><ol className="tutorial-steps" aria-label="Tutorial progress">{['Place a gate', 'Build a path', 'Send a plane'].map((label, i) => <li key={label} aria-current={i === step ? 'step' : undefined} className={i <= step ? 'is-current' : ''}><span>{i + 1}</span>{label}</li>)}</ol>
        <p className="growth-eyebrow mt-6">Step {step + 1} of 3 · Your turn</p>
        <h2 className="font-kid text-3xl text-teal-950">{lesson.title}</h2>
        <p className="mt-3 text-lg text-slate-700">{lesson.text}</p>
        <div className="mt-3"><SpeakButton text={lesson.text} label="Hear the tutorial step" /></div>
        </div><div className="tutorial-controls"><div role="status" className="mt-5 min-h-12 font-semibold text-teal-800">
          {step === 0 && ready ? 'Gate A is ready! Now let’s connect it.' : step === 1 && ready ? 'No gaps! Your plane has a path to its gate.' : flight ? 'The plane can reach Gate A. You built a working airport!' : 'Follow the glowing squares. You can take your time.'}
        </div>
        {step < 2 ? <button className="growth-primary mt-4 w-full disabled:opacity-40" disabled={!ready} onClick={() => setStep(step + 1)}>Next step →</button> : <>
          <button className="growth-primary mt-4 w-full" onClick={() => { setFlight(n => n + 1); soundEngine.speak('Your plane follows the connected path to Gate A!'); }}>{flight ? 'Watch again' : 'Send the plane'} ▶</button>
          {flight > 0 && <button className="growth-secondary mt-3 w-full" onClick={onDone}>Now build my own airport →</button>}
        </>}
        </div>
      </section>
      <section aria-label="Tutorial airport" className="min-w-0">
        <div className="airport-picture-legend"><span>✈ Plane starts here</span><span>Airport building ↓</span></div>
        <div className="airport-board-shell tutorial-board">
          <div className="airport-board">
            {Array.from({ length: 36 }, (_, n) => {
              const runway = layout.runway.includes(n), gate = layout.gates.includes(n), path = layout.taxi.includes(n), terminal = n % 6 === 5;
              const target = step === 0 ? n === 16 && !gate : step === 1 && [13, 14, 15].includes(n) && !path;
              const kind = terminal ? 'terminal' : gate ? 'gate' : runway ? 'runway' : path ? 'taxi' : 'grass';
              return <button key={n} disabled={!target} className={`airport-cell airport-cell-${kind} ${target ? 'airport-target' : ''}`} aria-label={target ? step === 0 ? 'Place Gate A here' : `Build path tile ${n - 12} of 3` : `Row ${Math.floor(n / 6) + 1}, column ${n % 6 + 1}: ${kind}`} onClick={() => setLayout(l => editLayout(l, step === 0 ? 'gate-a' : 'taxi', n, CHALLENGES[0]))}>
                {terminal ? <TerminalPicture /> : gate ? <span className="airport-gate-sign">A</span> : n === 12 ? <PlanePicture className={flight ? 'invisible' : 'airport-waiting-plane'} /> : runway ? <span className="airport-runway-line" /> : path ? <span className="airport-path-mark" /> : target ? <span className="airport-tap-symbol">{step === 0 ? 'A' : '+'}</span> : null}
              </button>;
            })}
          </div>
          {flight > 0 && <svg key={flight} viewBox="0 0 600 600" className="airport-flight-overlay" role="img" aria-label="The plane travels along the connected path and arrives at Gate A">
            <path d="M50 250H450" fill="none" stroke="#ffd363" strokeWidth="7" strokeDasharray="12 8" />
            <g transform={reducedMotion ? 'translate(450 250)' : undefined}>
              {!reducedMotion && <animateMotion path="M50 250H450" dur="3s" fill="freeze" />}
              <g transform="translate(-37 -37) scale(.74)"><PlanePicture /></g>
            </g>
          </svg>}
        </div>
        <div className="airport-visual-key"><span><span className="key-swatch key-runway" />Runway</span><span><span className="key-swatch key-path" />Plane path</span><span><span className="airport-gate-sign">A</span>Gate</span></div>
      </section>
    </div>
  </main>;
}
