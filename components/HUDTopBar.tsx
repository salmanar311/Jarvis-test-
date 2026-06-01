'use client';

import React, { useEffect, useState } from 'react';

export default function HUDTopBar() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => setTime(new Date().toTimeString().slice(0, 8));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-2 z-20"
      style={{ pointerEvents: 'none' }}
    >
      {/* Left: brand */}
      <div className="flex items-center gap-3">
        <div
          className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"
          style={{ boxShadow: '0 0 6px #00d4ff' }}
        />
        <span
          className="text-cyan-400 font-mono font-bold tracking-[0.4em] text-sm"
          style={{ textShadow: '0 0 12px rgba(0,212,255,0.7)' }}
        >
          J.A.R.V.I.S
        </span>
        <span className="text-cyan-700 font-mono text-[10px] tracking-widest">MARK 85</span>
      </div>

      {/* Center: time */}
      <div
        className="text-cyan-400 font-mono font-bold tracking-[0.3em] text-base"
        style={{ textShadow: '0 0 10px rgba(0,212,255,0.8)' }}
      >
        {time}
      </div>

      {/* Right: status indicators */}
      <div className="flex items-center gap-4">
        {['NET', 'GPS', 'API'].map(label => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-cyan-600 font-mono text-[10px] tracking-widest">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
