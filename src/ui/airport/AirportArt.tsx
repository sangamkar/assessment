import React from 'react';

/** Code-native illustrations stay sharp on touch screens and match the actual game. */
export function PlanePicture({ className = '' }: { className?: string }) {
  return <svg width="100" height="100" viewBox="0 0 100 100" className={className} aria-hidden="true">
    <path d="M12 43 39 43 48 14Q51 6 56 14L61 43 85 46Q98 50 85 54L61 57 56 86Q51 94 48 86L39 57 12 57 18 50Z" fill="#fffdf4" stroke="#164e63" strokeWidth="3" strokeLinejoin="round" />
    <path d="M64 46h15q8 4 0 8H64Z" fill="#38bdf8" />
    <path d="m20 44-6-17h10l10 17m-14 12-6 17h10l10-17" fill="#fbbf24" stroke="#164e63" strokeWidth="2" />
  </svg>;
}

export function TerminalPicture() {
  return <svg width="100" height="100" viewBox="0 0 100 100" aria-hidden="true">
    <path d="M12 42h76v47H12Z" fill="#fff4d6" stroke="#8b6539" strokeWidth="3" />
    <path d="M8 42h84L82 28H18Z" fill="#f5ae54" stroke="#8b6539" strokeWidth="3" />
    <path d="M21 52h15v15H21Zm43 0h15v15H64Z" fill="#76cfe0" />
    <path d="M42 62h16v27H42Z" fill="#357c89" />
    <path d="M40 17h20v19H40Z" fill="#def6fc" stroke="#8b6539" strokeWidth="3" />
    <path d="M50 6v11" stroke="#8b6539" strokeWidth="3" />
  </svg>;
}

export function AirportPicture() {
  return <svg viewBox="0 0 460 240" role="img" aria-label="A plane follows a yellow path from a runway to Gate A at the airport building">
    <rect x="3" y="3" width="454" height="234" rx="30" fill="#e7f2d9" />
    <path d="M31 35h65v174H31Z" fill="#475569" />
    <path d="M63 48v145" stroke="white" strokeWidth="4" strokeDasharray="12 10" />
    <path d="M96 123H334" stroke="#acc7ba" strokeWidth="42" strokeLinejoin="round" />
    <path d="M96 123H334" stroke="#ffe59a" strokeWidth="4" strokeDasharray="10 7" />
    <circle cx="326" cy="123" r="25" fill="#f9c75e" stroke="#a46a1d" strokeWidth="3" />
    <text x="326" y="132" textAnchor="middle" fontSize="26" fontWeight="bold" fill="#573c18">A</text>
    <g transform="translate(345 63) scale(1.05)"><TerminalPicture /></g>
    <g transform="translate(119 83) scale(.8)"><PlanePicture /></g>
    <text x="64" y="226" textAnchor="middle" fontSize="15" fill="#345951">RUNWAY</text>
    <text x="211" y="176" textAnchor="middle" fontSize="15" fill="#345951">CONNECT THE PATH</text>
    <text x="387" y="205" textAnchor="middle" fontSize="15" fill="#345951">AIRPORT</text>
  </svg>;
}
