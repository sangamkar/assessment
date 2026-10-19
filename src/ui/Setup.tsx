import React, { useState } from 'react';

export const AVATARS = ['🦁', '🐯', '🐼', '🦊', '🐸', '🐵', '🦄', '🐲', '🚀', '🤖'];

export function Setup({ initialName = '', initialAvatar = '🦁', onSave, onCancel }: { initialName?: string; initialAvatar?: string; onSave: (name: string, avatar: string) => void; onCancel?: () => void }) {
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState(initialAvatar);
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) onSave(name.trim(), avatar);
        }}
        className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-xl"
      >
        <h1 className="font-kid text-3xl font-bold text-slate-800">Welcome to Learning Quest!</h1>
        <p className="mt-1 text-sm text-slate-500">For the grown-up: who is learning today?</p>
        <label className="mt-5 block text-sm font-semibold text-slate-600">
          Child’s first name
          <input value={name} onChange={(e) => setName(e.target.value)} autoFocus className="mt-1 w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-xl outline-none focus:border-indigo-500" />
        </label>
        <div className="mt-5 text-sm font-semibold text-slate-600">Pick a buddy</div>
        <div className="mt-2 grid grid-cols-5 gap-2">
          {AVATARS.map((a) => (
            <button type="button" key={a} onClick={() => setAvatar(a)} className={`flex h-14 items-center justify-center rounded-2xl text-3xl ${avatar === a ? 'bg-indigo-100 ring-4 ring-indigo-400' : 'bg-slate-50'}`}>
              {a}
            </button>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          {onCancel && (
            <button type="button" onClick={onCancel} className="flex-1 rounded-xl bg-slate-100 py-3 font-semibold text-slate-600">
              Cancel
            </button>
          )}
          <button type="submit" disabled={!name.trim()} className="flex-1 rounded-xl bg-indigo-600 py-3 font-kid text-xl font-bold text-white disabled:bg-slate-300">
            Let’s go!
          </button>
        </div>
      </form>
    </div>
  );
}
