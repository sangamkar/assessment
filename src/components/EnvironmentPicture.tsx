import React from 'react';

interface EnvironmentPictureProps {
  type: 'window' | 'clock' | 'roof' | 'ball' | 'door' | 'pizza' | 'block' | 'envelope';
  className?: string;
}

export const EnvironmentPicture: React.FC<EnvironmentPictureProps> = ({ type, className = '' }) => {
  switch (type) {
    case 'window':
      return (
        <div className={`flex flex-col items-center ${className}`}>
          <svg viewBox="0 0 160 160" className="w-36 h-36 drop-shadow-md">
            <rect x="15" y="15" width="130" height="130" rx="8" fill="#93c5fd" stroke="#1e293b" strokeWidth="6" />
            <rect x="25" y="25" width="50" height="50" fill="#e0f2fe" stroke="#3b82f6" strokeWidth="3" />
            <rect x="85" y="25" width="50" height="50" fill="#e0f2fe" stroke="#3b82f6" strokeWidth="3" />
            <rect x="25" y="85" width="50" height="50" fill="#e0f2fe" stroke="#3b82f6" strokeWidth="3" />
            <rect x="85" y="85" width="50" height="50" fill="#e0f2fe" stroke="#3b82f6" strokeWidth="3" />
            <line x1="80" y1="15" x2="80" y2="145" stroke="#1e293b" strokeWidth="6" />
            <line x1="15" y1="80" x2="145" y2="80" stroke="#1e293b" strokeWidth="6" />
            <rect x="8" y="142" width="144" height="12" rx="4" fill="#64748b" stroke="#1e293b" strokeWidth="4" />
          </svg>
          <span className="text-sm font-semibold text-slate-600 mt-1">Window</span>
        </div>
      );
    case 'clock':
      return (
        <div className={`flex flex-col items-center ${className}`}>
          <svg viewBox="0 0 160 160" className="w-36 h-36 drop-shadow-md">
            <circle cx="80" cy="80" r="68" fill="#fef08a" stroke="#1e293b" strokeWidth="6" />
            <circle cx="80" cy="80" r="56" fill="#ffffff" stroke="#f59e0b" strokeWidth="3" />
            <circle cx="80" cy="32" r="4" fill="#1e293b" />
            <circle cx="128" cy="80" r="4" fill="#1e293b" />
            <circle cx="80" cy="128" r="4" fill="#1e293b" />
            <circle cx="32" cy="80" r="4" fill="#1e293b" />
            <line x1="80" y1="80" x2="80" y2="45" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
            <line x1="80" y1="80" x2="105" y2="80" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
            <circle cx="80" cy="80" r="6" fill="#1e293b" />
          </svg>
          <span className="text-sm font-semibold text-slate-600 mt-1">Clock</span>
        </div>
      );
    case 'roof':
      return (
        <div className={`flex flex-col items-center ${className}`}>
          <svg viewBox="0 0 180 160" className="w-40 h-36 drop-shadow-md">
            <polygon points="90,15 15,95 165,95" fill="#f97316" stroke="#7c2d12" strokeWidth="6" strokeLinejoin="round" />
            <line x1="45" y1="65" x2="135" y2="65" stroke="#ea580c" strokeWidth="4" />
            <circle cx="90" cy="62" r="14" fill="#ffffff" stroke="#7c2d12" strokeWidth="3" />
            <line x1="90" y1="48" x2="90" y2="76" stroke="#7c2d12" strokeWidth="2" />
            <line x1="76" y1="62" x2="104" y2="62" stroke="#7c2d12" strokeWidth="2" />
            <rect x="35" y="95" width="110" height="55" fill="#fed7aa" stroke="#7c2d12" strokeWidth="4" opacity="0.8" />
            <rect x="75" y="115" width="30" height="35" fill="#a16207" />
          </svg>
          <span className="text-sm font-semibold text-slate-600 mt-1">House Roof</span>
        </div>
      );
    case 'ball':
      return (
        <div className={`flex flex-col items-center ${className}`}>
          <svg viewBox="0 0 160 160" className="w-36 h-36 drop-shadow-md">
            <circle cx="80" cy="80" r="65" fill="#38bdf8" stroke="#0369a1" strokeWidth="6" />
            <path d="M 80,15 C 50,45 50,115 80,145" fill="none" stroke="#f43f5e" strokeWidth="16" />
            <path d="M 80,15 C 110,45 110,115 80,145" fill="none" stroke="#eab308" strokeWidth="16" />
            <circle cx="80" cy="80" r="14" fill="#ffffff" stroke="#0369a1" strokeWidth="4" />
          </svg>
          <span className="text-sm font-semibold text-slate-600 mt-1">Ball</span>
        </div>
      );
    case 'door':
      return (
        <div className={`flex flex-col items-center ${className}`}>
          <svg viewBox="0 0 140 170" className="w-32 h-40 drop-shadow-md">
            <rect x="25" y="15" width="90" height="145" rx="4" fill="#a855f7" stroke="#1e293b" strokeWidth="6" />
            <rect x="38" y="28" width="64" height="50" rx="3" fill="#c084fc" stroke="#581c87" strokeWidth="3" />
            <rect x="38" y="90" width="64" height="60" rx="3" fill="#c084fc" stroke="#581c87" strokeWidth="3" />
            <circle cx="102" cy="98" r="6" fill="#facc15" stroke="#713f12" strokeWidth="2" />
          </svg>
          <span className="text-sm font-semibold text-slate-600 mt-1">Door</span>
        </div>
      );
    case 'pizza':
      return (
        <div className={`flex flex-col items-center ${className}`}>
          <svg viewBox="0 0 160 160" className="w-36 h-36 drop-shadow-md">
            <polygon points="80,140 25,30 135,30" fill="#facc15" stroke="#854d0e" strokeWidth="5" strokeLinejoin="round" />
            <path d="M 25,30 Q 80,15 135,30" stroke="#b45309" strokeWidth="10" strokeLinecap="round" fill="none" />
            <circle cx="65" cy="55" r="10" fill="#dc2626" />
            <circle cx="95" cy="65" r="10" fill="#dc2626" />
            <circle cx="80" cy="100" r="9" fill="#dc2626" />
          </svg>
          <span className="text-sm font-semibold text-slate-600 mt-1">Pizza Slice</span>
        </div>
      );
    case 'block':
      return (
        <div className={`flex flex-col items-center ${className}`}>
          <svg viewBox="0 0 160 160" className="w-36 h-36 drop-shadow-md">
            <rect x="25" y="25" width="110" height="110" rx="6" fill="#ec4899" stroke="#831843" strokeWidth="6" />
            <rect x="38" y="38" width="84" height="84" rx="4" fill="#f472b6" stroke="#9d174d" strokeWidth="3" />
            <text x="80" y="94" textAnchor="middle" fontSize="48" fontWeight="bold" fill="#ffffff" fontFamily="sans-serif">
              A
            </text>
          </svg>
          <span className="text-sm font-semibold text-slate-600 mt-1">Toy Block</span>
        </div>
      );
    case 'envelope':
      return (
        <div className={`flex flex-col items-center ${className}`}>
          <svg viewBox="0 0 160 160" className="w-36 h-36 drop-shadow-md">
            <rect x="15" y="35" width="130" height="90" rx="6" fill="#f1f5f9" stroke="#1e293b" strokeWidth="5" />
            <polyline points="15,35 80,95 145,35" fill="none" stroke="#475569" strokeWidth="4" strokeLinejoin="round" />
            <line x1="15" y1="125" x2="65" y2="80" stroke="#94a3b8" strokeWidth="3" />
            <line x1="145" y1="125" x2="95" y2="80" stroke="#94a3b8" strokeWidth="3" />
          </svg>
          <span className="text-sm font-semibold text-slate-600 mt-1">Envelope</span>
        </div>
      );
    default:
      return null;
  }
};
