import React, { useState } from 'react';
/// <reference types="vite/client" />
import { Lock, ArrowRight, ShieldAlert, GraduationCap } from 'lucide-react';

interface Props {
  onUnlock: () => void;
}

export function PasscodeLock({ onUnlock }: Props) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  // Use the environment variable if set, otherwise fallback to a default
  const expectedPasscode = (import.meta as any).env.VITE_CLASSROOM_PASSCODE || 'TEACHER24';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple case-insensitive check
    if (passcode.trim().toUpperCase() === expectedPasscode.toUpperCase()) {
      setError(false);
      onUnlock();
    } else {
      setError(true);
      setPasscode('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        
        {/* Logo / Header Area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-3xl shadow-lg mb-6 rotate-3">
            <GraduationCap className="w-10 h-10 text-white -rotate-3" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Assessment Hub
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Please enter the classroom passcode
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            <div className="space-y-2">
              <label htmlFor="passcode" className="text-sm font-bold text-slate-700 ml-1">
                Classroom Passcode
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`w-5 h-5 ${error ? 'text-rose-400' : 'text-slate-400'}`} />
                </div>
                <input
                  id="passcode"
                  type="password"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (error) setError(false);
                  }}
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-2xl text-lg font-bold outline-none transition-all ${
                    error 
                      ? 'border-rose-300 focus:border-rose-500 text-rose-700 focus:ring-4 focus:ring-rose-500/10' 
                      : 'border-slate-200 focus:border-indigo-500 text-slate-800 focus:ring-4 focus:ring-indigo-500/10'
                  }`}
                  placeholder="Enter passcode..."
                  autoFocus
                />
              </div>
              {error && (
                <div className="flex items-center gap-1.5 mt-2 ml-1 text-rose-500 animate-in fade-in slide-in-from-top-1">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="text-sm font-bold">Incorrect passcode. Please try again.</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={passcode.length === 0}
              className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-md active:scale-[0.98]"
            >
              Unlock Access
              <ArrowRight className="w-5 h-5" />
            </button>
            
          </form>
        </div>

        <div className="mt-8 text-center text-sm font-medium text-slate-400">
          Protected learning environment
        </div>

      </div>
    </div>
  );
}
