import React, { useState } from 'react';
import { SortItem, SortBin } from '../types/assessment';
import { ShapeRenderer } from './ShapeRenderer';
import { soundEngine } from '../utils/audio';
import { Check } from 'lucide-react';

interface SortingExerciseProps {
  items: SortItem[];
  bins: SortBin[];
  onComplete: (isCorrect: boolean, errorDetail?: string) => void;
  isPracticeMode?: boolean;
}

export const SortingExercise: React.FC<SortingExerciseProps> = ({
  items,
  bins,
  onComplete,
  isPracticeMode = false,
}) => {
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [selectedItemId, setSelectedItemId] = useState<string | null>(items[0]?.id || null);

  const unplacedItems = items.filter((item) => !placements[item.id]);

  const handleSelectItem = (id: string) => {
    soundEngine.playTap();
    setSelectedItemId(id);
  };

  const handlePlaceInBin = (binId: string) => {
    if (!selectedItemId) return;
    soundEngine.playTap();
    const newPlacements = {
      ...placements,
      [selectedItemId]: binId,
    };
    setPlacements(newPlacements);

    const remaining = items.filter((i) => i.id !== selectedItemId && !newPlacements[i.id]);
    if (remaining.length > 0) {
      setSelectedItemId(remaining[0].id);
    } else {
      setSelectedItemId(null);
    }
  };

  const handleRemoveFromBin = (itemId: string) => {
    soundEngine.playTap();
    const newPlacements = { ...placements };
    delete newPlacements[itemId];
    setPlacements(newPlacements);
    setSelectedItemId(itemId);
  };

  const allPlaced = Object.keys(placements).length === items.length;

  const handleSubmit = () => {
    soundEngine.playTap();
    let correctCount = 0;
    items.forEach((item) => {
      if (placements[item.id] === item.targetBinId) {
        correctCount++;
      }
    });
    const isAllCorrect = correctCount === items.length;
    onComplete(isAllCorrect, isAllCorrect ? undefined : 'sorting_rule_mismatch');
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="w-full max-w-2xl bg-amber-50/70 border-2 border-dashed border-amber-300 rounded-3xl p-4 flex flex-col items-center">
        <span className="text-sm font-bold text-amber-900 mb-2">
          {unplacedItems.length > 0 ? 'Tap a shape, then tap where it goes:' : 'All shapes sorted! Tap the green button below.'}
        </span>
        <div className="flex flex-wrap items-center justify-center gap-4 min-h-[96px]">
          {unplacedItems.map((item) => {
            const isSelected = selectedItemId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectItem(item.id)}
                className={`p-2 rounded-2xl transition-all transform cursor-pointer ${
                  isSelected
                    ? 'ring-4 ring-blue-500 bg-white scale-110 shadow-lg'
                    : 'bg-white/80 hover:bg-white hover:scale-105 shadow-sm'
                }`}
                aria-label={`Shape ${item.shape.type}`}
              >
                <ShapeRenderer shape={item.shape} sizeOverride={76} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {bins.map((bin, index) => {
          const itemsInThisBin = items.filter((item) => placements[item.id] === bin.id);
          const binColorClass = index === 0 ? 'bg-sky-50 border-sky-300' : 'bg-emerald-50 border-emerald-300';
          const headerColorClass = index === 0 ? 'text-sky-900 bg-sky-100' : 'text-emerald-900 bg-emerald-100';

          return (
            <div
              key={bin.id}
              onClick={() => handlePlaceInBin(bin.id)}
              className={`border-3 rounded-3xl p-4 min-h-[180px] flex flex-col items-center justify-between transition-all cursor-pointer ${binColorClass} hover:shadow-md active:scale-98`}
            >
              <div className={`w-full py-2 px-3 rounded-xl text-center font-bold text-base ${headerColorClass}`}>
                {bin.label}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 my-3 min-h-[70px]">
                {itemsInThisBin.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">Tap to put selected shape here</span>
                ) : (
                  itemsInThisBin.map((item) => (
                    <div
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromBin(item.id);
                      }}
                      className="p-1.5 bg-white rounded-xl shadow-xs hover:ring-2 hover:ring-rose-400 cursor-pointer"
                      title="Tap to move back"
                    >
                      <ShapeRenderer shape={item.shape} sizeOverride={52} />
                    </div>
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlaceInBin(bin.id);
                }}
                disabled={!selectedItemId}
                className={`w-full py-2 text-sm font-bold rounded-xl transition ${
                  selectedItemId
                    ? 'bg-slate-800 text-white hover:bg-slate-900 shadow-xs'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Put Here
              </button>
            </div>
          );
        })}
      </div>

      {allPlaced && (
        <button
          onClick={handleSubmit}
          className="mt-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer animate-bounce"
        >
          <Check className="w-6 h-6" />
          I&apos;m Done!
        </button>
      )}
    </div>
  );
};
