import React from 'react';
import { ShapeType } from '../types/assessment';

interface CompositionTargetProps {
  target: ShapeType | 'house' | 'big_rectangle' | 'big_square';
  className?: string;
}

export const CompositionTarget: React.FC<CompositionTargetProps> = ({ target, className = '' }) => {
  switch (target) {
    case 'house':
      return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
          <svg viewBox="0 0 160 160" className="w-36 h-36 drop-shadow-md">
            <polygon points="80,20 20,80 140,80" fill="#fed7aa" stroke="#c2410c" strokeWidth="4" strokeLinejoin="round" />
            <rect x="25" y="80" width="110" height="70" fill="#fef08a" stroke="#ca8a04" strokeWidth="4" />
            <line x1="25" y1="80" x2="135" y2="80" stroke="#475569" strokeWidth="3" strokeDasharray="6,4" />
          </svg>
          <span className="text-sm font-bold text-slate-700 mt-2">Target Picture</span>
        </div>
      );
    case 'big_square':
    case 'square':
      return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
          <svg viewBox="0 0 160 160" className="w-36 h-36 drop-shadow-md">
            <polygon points="25,25 135,25 135,135" fill="#bae6fd" stroke="#0284c7" strokeWidth="4" />
            <polygon points="25,25 25,135 135,135" fill="#a7f3d0" stroke="#059669" strokeWidth="4" />
            <line x1="25" y1="25" x2="135" y2="135" stroke="#334155" strokeWidth="3" strokeDasharray="6,4" />
          </svg>
          <span className="text-sm font-bold text-slate-700 mt-2">Target Square</span>
        </div>
      );
    case 'big_rectangle':
    case 'rectangle':
      return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
          <svg viewBox="0 0 200 130" className="w-44 h-32 drop-shadow-md">
            <rect x="15" y="20" width="85" height="90" rx="2" fill="#fbcfe8" stroke="#db2777" strokeWidth="4" />
            <rect x="100" y="20" width="85" height="90" rx="2" fill="#fed7aa" stroke="#ea580c" strokeWidth="4" />
            <line x1="100" y1="20" x2="100" y2="110" stroke="#334155" strokeWidth="3" strokeDasharray="6,4" />
          </svg>
          <span className="text-sm font-bold text-slate-700 mt-2">Target Rectangle</span>
        </div>
      );
    default:
      return null;
  }
};
