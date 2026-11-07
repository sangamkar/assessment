import React, { useEffect, useRef, useState } from 'react';
import type { AppState } from '../engine/progress';
import { STICKERS, STICKER_PAGES, bestStreakSoFar, buySticker, canBuy, ownedStickers, starsToSpend } from '../engine/engagement';
import { soundEngine } from '../utils/audio';

export function StickerBook({ state, update, onBack }: { state: AppState; update: (fn: (s: AppState) => AppState) => void; onBack: () => void }) {
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const selected = STICKERS.find(s => s.id === pending);
  useEffect(() => {
    if (selected) {
      dialog.current?.showModal();
      soundEngine.speak(`Buy the ${selected.name} sticker for ${selected.cost} stars? Choose yes to buy or no to go back.`);
    } else dialog.current?.close();
    return () => soundEngine.stopSpeech();
  }, [selected]);
  const owned = new Set(ownedStickers(state));
  const stars = starsToSpend(state);
  const best = bestStreakSoFar(state);
  const buy = (id: string, name: string) => {
    const sticker = STICKERS.find(s => s.id === id);
    if (!sticker || !canBuy(state, sticker)) { setPending(null); return; }
    update((s) => buySticker(s, id));
    setPending(null);
    setMessage(`You got the ${name} sticker!`);
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
      <p role="status" className="font-kid text-lg text-emerald-800">{message}</p>
      <dialog ref={dialog} aria-labelledby="sticker-confirm-title" onCancel={() => setPending(null)} onClose={() => setPending(null)} className="m-auto w-[min(90vw,420px)] rounded-3xl p-6 text-center shadow-xl backdrop:bg-black/40">
        <h2 id="sticker-confirm-title" className="font-kid text-2xl font-bold">Buy {selected?.emoji} for {selected?.cost} ⭐?</h2>
        <p className="my-4">{selected?.name}</p>
        <div className="flex justify-center gap-4"><button autoFocus className="growth-secondary" onClick={() => setPending(null)}>No, go back</button><button className="growth-primary" disabled={!selected || !canBuy(state, selected)} onClick={() => selected && buy(selected.id, selected.name)}>Yes, buy sticker</button></div>
      </dialog>
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
                  onClick={() => setPending(s.id)}
                  aria-label={have ? `${s.name}: yours` : s.streak ? `${s.name}: learn ${s.streak} days in a row` : `${s.name}: ${s.cost} stars`}
                  className={`flex flex-col items-center gap-1 rounded-2xl p-3 transition ${have ? 'bg-amber-50' : affordable ? 'bg-emerald-50 ring-2 ring-emerald-400 active:scale-95' : 'bg-slate-50'}`}
                >
                  <span className={`text-5xl ${have || affordable ? '' : 'opacity-25 grayscale'}`}>{s.emoji}</span>
                  <span className="text-center font-kid text-xs font-bold text-slate-600">
                    {have ? `✓ ${s.name}` : s.streak ? `${Math.min(best, s.streak)}/${s.streak} days` : `${s.cost} ⭐`}
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
