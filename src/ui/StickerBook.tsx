import React from 'react';
import type { AppState } from '../engine/progress';
import { STICKERS, STICKER_PAGES, bestStreakSoFar, buySticker, canBuy, ownedStickers, starsToSpend } from '../engine/engagement';
import { soundEngine } from '../utils/audio';

export function StickerBook({ state, update, onBack }: { state: AppState; update: (fn: (s: AppState) => AppState) => void; onBack: () => void }) {
  const owned = new Set(ownedStickers(state));
  const stars = starsToSpend(state);
  const best = bestStreakSoFar(state);
  const buy = (id: string, name: string) => {
    update((s) => buySticker(s, id));
    soundEngine.playCorrectChime();
    soundEngine.speak(`You got the ${name} sticker!`);
  };
  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-6">
      <header className="mb-6 flex items-center gap-4">
        <button onClick={onBack} aria-label="Back" className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow">←</button>
        <span className="text-5xl">📒</span>
        <h1 className="flex-1 font-kid text-3xl font-bold text-slate-800">My sticker book</h1>
        <span className="rounded-full bg-white px-4 py-2 font-kid text-2xl font-bold text-amber-500 shadow" aria-label={`${stars} stars to spend`}>{stars} ⭐</span>
      </header>
      <p className="mb-5 font-kid text-lg text-slate-600">Earn stars by learning and playing. Spend them on stickers! Days-in-a-row stickers are free.</p>
      {STICKER_PAGES.map((page) => (
        <section key={page} className="mb-6 rounded-[2rem] bg-white/90 p-5 shadow">
          <h2 className="mb-3 font-kid text-2xl font-bold text-slate-700">{page}</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {STICKERS.filter((s) => s.page === page).map((s) => {
              const have = owned.has(s.id);
              const affordable = canBuy(state, s);
              return (
                <button
                  key={s.id}
                  disabled={!affordable}
                  onClick={() => buy(s.id, s.name)}
                  aria-label={have ? `${s.name}: yours` : s.streak ? `${s.name}: learn ${s.streak} days in a row` : `${s.name}: ${s.cost} stars`}
                  className={`flex flex-col items-center gap-1 rounded-2xl p-3 transition ${have ? 'bg-amber-50' : affordable ? 'bg-emerald-50 ring-2 ring-emerald-400 active:scale-95' : 'bg-slate-50'}`}
                >
                  <span className={`text-5xl ${have ? '' : 'opacity-25 grayscale'}`}>{s.emoji}</span>
                  <span className="text-center font-kid text-xs font-bold text-slate-600">
                    {have ? s.name : s.streak ? `${Math.min(best, s.streak)}/${s.streak} days` : `${s.cost} ⭐`}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
