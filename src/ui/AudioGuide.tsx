import React from 'react';
import { SpeakButton } from './SpeakButton';
export function AudioGuide({ text }: { text: string }) {
  // Guidance starts only from a tap, never automatically on page load.
  return <SpeakButton text={text} label="Hear what to do next" />;
}
/** A separate sibling control so listening never activates the card. */
export function AudioCard({ text, label, children, className = '' }: { text: string; label: string; children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-2 ${className}`}>{children}<div className="self-end"><SpeakButton text={text} label={`Hear ${label}`} /></div></div>;
}
