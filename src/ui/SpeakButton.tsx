import React, { useState } from 'react';
import { soundEngine } from '../utils/audio';

export function SpeakButton({ text, big = false, label = 'Hear it again' }: { text: string; big?: boolean; label?: string }) {
  const [speaking, setSpeaking] = useState(false);
  return (
    <button
      aria-label={label}
      onClick={() => {
        setSpeaking(true);
        soundEngine.speak(text, () => setSpeaking(false));
      }}
      className={`flex shrink-0 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg transition active:scale-90 ${big ? 'h-20 w-20 text-4xl' : 'h-14 w-14 text-2xl'} ${speaking ? 'animate-pulse ring-4 ring-sky-200' : ''}`}
    >
      🔊
    </button>
  );
}
