import React from 'react';
import { soundEngine } from '../utils/audio';
import { Volume2, BookOpen } from 'lucide-react';

interface LiteracyVisualRendererProps {
  passage?: {
    title: string;
    category: 'literature' | 'informational';
    text: string;
    audioText?: string;
    iconEmoji?: string;
  };
  sightWord?: string;
  phonicsFocus?: string;
}

export const LiteracyVisualRenderer: React.FC<LiteracyVisualRendererProps> = ({
  passage,
  sightWord,
  phonicsFocus,
}) => {
  const handleReadPassage = () => {
    if (!passage) return;
    soundEngine.speak(passage.audioText || passage.text);
  };

  const handleReadSightWord = () => {
    if (!sightWord) return;
    soundEngine.speak(sightWord);
  };

  if (sightWord) {
    return (
      <div className="flex flex-col items-center gap-3 p-6 bg-amber-50/70 border-2 border-amber-300 rounded-3xl shadow-sm">
        <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">
          High-Frequency Sight Word
        </span>
        <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-wide font-sans bg-white px-8 py-3 rounded-2xl border border-amber-200 shadow-2xs">
          {sightWord}
        </div>
        <button
          onClick={handleReadSightWord}
          className="flex items-center gap-2 px-4 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-full text-xs font-bold transition cursor-pointer"
        >
          <Volume2 className="w-4 h-4 text-amber-800" />
          <span>Tap to Hear Word</span>
        </button>
      </div>
    );
  }

  if (passage) {
    return (
      <div className="w-full max-w-xl p-5 bg-sky-50/60 border-2 border-sky-200 rounded-3xl shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-sky-200/80">
          <div className="flex items-center gap-2">
            <span className="text-xl">{passage.iconEmoji || '📖'}</span>
            <span className="font-bold text-sm text-sky-950">{passage.title}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-sky-200/70 text-sky-800">
              {passage.category === 'literature' ? 'Story' : 'Informational'}
            </span>
          </div>
          <button
            onClick={handleReadPassage}
            className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-sky-100 text-sky-700 border border-sky-300 rounded-full text-xs font-bold transition cursor-pointer shadow-2xs"
            title="Read passage aloud"
          >
            <Volume2 className="w-3.5 h-3.5 text-sky-600" />
            <span>Read Story</span>
          </button>
        </div>
        <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium bg-white/80 p-3.5 rounded-2xl border border-sky-100">
          &ldquo;{passage.text}&rdquo;
        </p>
      </div>
    );
  }

  if (phonicsFocus) {
    return (
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-purple-900">
        <BookOpen className="w-4 h-4 text-purple-600" />
        <span>Phonics Skill: {phonicsFocus}</span>
      </div>
    );
  }

  return null;
};
