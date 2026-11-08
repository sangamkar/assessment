import React, { useEffect, useState } from 'react';
export function SpeechNotice() {
  const [message, setMessage] = useState('');
  useEffect(() => {
    const status = (event: Event) => setMessage((event as CustomEvent<string>).detail);
    window.addEventListener('learning-quest:speech-status', status);
    return () => window.removeEventListener('learning-quest:speech-status', status);
  }, []);
  return message ? <p role="status" className="sticky top-0 z-50 bg-amber-50 p-3 text-center font-semibold text-amber-950">{message}</p> : null;
}
