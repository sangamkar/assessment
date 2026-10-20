import React, { useMemo, useState } from 'react';

/** Grown-up check: a multiplication fact a kindergartner can't answer yet. */
export function Gate({ onPass, onCancel }: { onPass: () => void; onCancel: () => void }) {
  const [a, b] = useMemo(() => [6 + Math.floor(Math.random() * 4), 6 + Math.floor(Math.random() * 4)], []);
  const [value, setValue] = useState('');
  const [wrong, setWrong] = useState(false);
  const check = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(value) === a * b) onPass();
    else {
      setWrong(true);
      setValue('');
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form onSubmit={check} className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        <h1 className="text-xl font-bold text-slate-800">Grown-ups only</h1>
        <p className="mt-1 text-sm text-slate-500">Answer to open the parent dashboard.</p>
        <label className="mt-5 block text-lg font-semibold text-slate-700">
          What is {a} × {b}?
          <input
            autoFocus
            inputMode="numeric"
            value={value}
            onChange={(e) => {
              setValue(e.target.value.replace(/\D/g, ''));
              setWrong(false);
            }}
            className={`mt-2 w-full rounded-xl border-2 px-4 py-3 text-2xl outline-none ${wrong ? 'border-rose-400' : 'border-slate-200 focus:border-indigo-500'}`}
          />
        </label>
        {wrong && <p className="mt-2 text-sm font-semibold text-rose-500">Not quite — try again.</p>}
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 rounded-xl bg-slate-100 py-3 font-semibold text-slate-600">
            Back
          </button>
          <button type="submit" className="flex-1 rounded-xl bg-indigo-600 py-3 font-semibold text-white">
            Open
          </button>
        </div>
      </form>
    </div>
  );
}
