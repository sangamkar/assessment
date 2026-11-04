import React from "react";

export function MissionArt({ theme }: { theme: string }) {
  return (
    <svg viewBox="0 0 400 240" aria-hidden="true" className="h-full w-full">
      <circle cx="210" cy="115" r="102" fill="currentColor" opacity=".07" />
      <path
        d="M25 202 Q200 165 380 202"
        fill="none"
        stroke="currentColor"
        opacity=".16"
        strokeWidth="2"
      />
      {theme === "airport" ? (
        <>
          <path d="M65 210 L150 115 L244 115 L335 210Z" fill="#d7e7e2" />
          <path
            d="M199 125 L199 210"
            stroke="white"
            strokeWidth="5"
            strokeDasharray="12 10"
          />
          <g transform="translate(65 20) rotate(-12 150 85)">
            <path
              d="M40 90 L135 70 L175 20 L194 20 L180 70 L260 86 Q280 98 258 106 L177 104 L184 140 L168 140 L143 105 L50 108 L24 130 L12 126 L28 99Z"
              fill="#f6b565"
              stroke="#a86b31"
              strokeWidth="2"
            />
            <path
              d="M156 38 L160 84 L101 145 L120 146 L182 104"
              fill="#fff5df"
              stroke="#a86b31"
              strokeWidth="2"
            />
            <circle cx="235" cy="94" r="5" fill="#136f78" />
          </g>
          <path d="M38 75 Q55 48 76 70 Q100 57 108 77" fill="white" />
          <path d="M298 45 Q312 20 331 42 Q354 31 360 50" fill="white" />
        </>
      ) : theme === "neighborhood" ? (
        <>
          <path
            d="M90 225 Q240 160 300 225"
            stroke="#eac88e"
            strokeWidth="25"
            fill="none"
          />
          <path d="M70 112 L70 184 L149 184 L149 112" fill="#f3bc84" />
          <path d="M55 115 L108 65 L164 115Z" fill="#c96a51" />
          <path d="M99 141 L120 141 L120 184 L99 184Z" fill="#fff8e9" />
          <path d="M206 91 L206 180 L292 180 L292 91" fill="#afcbd3" />
          <path d="M193 95 L250 45 L305 95Z" fill="#136f78" />
          <path d="M237 142 L261 142 L261 180 L237 180Z" fill="#fff8e9" />
          <rect x="82" y="124" width="18" height="18" rx="3" fill="#fff8e9" />
          <rect x="226" y="105" width="18" height="18" rx="3" fill="#fff8e9" />
          <rect x="260" y="105" width="18" height="18" rx="3" fill="#fff8e9" />
          <path d="M340 130 L340 197" stroke="#9a7656" strokeWidth="8" />
          <circle cx="340" cy="120" r="32" fill="#91b694" />
        </>
      ) : (
        <>
          <rect x="85" y="92" width="225" height="100" rx="8" fill="#e4d1ae" />
          <path d="M75 93 L100 50 L295 50 L320 93Z" fill="#f0b8a0" />
          {[100, 140, 180, 220, 260].map((x) => (
            <path
              key={x}
              d={`M${x} 50 L${x - 15} 93 L${x + 5} 93 L${x + 20} 50Z`}
              fill="#fff4df"
            />
          ))}
          <rect x="106" y="112" width="70" height="56" rx="5" fill="#7360a3" />
          <rect x="209" y="110" width="70" height="82" rx="5" fill="#fff8e9" />
          <path
            d="M225 132 L260 132 M225 145 L252 145 M225 158 L260 158"
            stroke="#baa5ce"
            strokeWidth="4"
          />
          <ellipse cx="142" cy="127" rx="18" ry="5" fill="#fff8e9" />
          <path
            d="M126 128 L130 148 Q142 158 155 148 L159 128"
            fill="#fff8e9"
          />
          <path
            d="M160 130 Q178 130 162 144"
            fill="none"
            stroke="#fff8e9"
            strokeWidth="4"
          />
        </>
      )}
      <path
        d="M345 70 L350 80 L361 83 L350 87 L345 98 L341 87 L330 83 L341 79Z"
        fill="#e8aa56"
      />
    </svg>
  );
}
