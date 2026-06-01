'use client';

import React, { useEffect, useState } from 'react';

export default function HUDTopBar() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toTimeString().slice(0, 8));
      setDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase());
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 z-20" style={{ pointerEvents: 'none' }}>
      {/* Top border glow line */}
      <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.4), rgba(0,212,255,0.8), rgba(0,212,255,0.4), transparent)' }} />

      <div className="flex items-center justify-between px-6 py-3">
        {/* Left: time + date */}
        <div className="flex flex-col">
          <span className="font-mono text-cyan-400 text-sm tracking-widest" style={{ textShadow: '0 0 8px rgba(0,212,255,0.6)' }}>{time}</span>
          <span className="font-mono text-cyan-700 text-[9px] tracking-widest">{date}</span>
        </div>

        {/* Center: JARVIS — large and prominent */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="flex items-center gap-3">
            <div style={{ width: 40, height: '0.5px', background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.5))' }} />
            <span
              className="font-mono font-bold tracking-[0.6em] text-2xl"
              style={{ color: '#00d4ff', textShadow: '0 0 20px rgba(0,212,255,1), 0 0 40px rgba(0,212,255,0.5), 0 0 60px rgba(0,212,255,0.2)' }}
            >
              J.A.R.V.I.S
            </span>
            <div style={{ width: 40, height: '0.5px', background: 'linear-gradient(to left, transparent, rgba(0,212,255,0.5))' }} />
          </div>
          <span className="font-mono text-[9px] tracking-[0.4em] text-cyan-700">JUST A RATHER VERY INTELLIGENT SYSTEM</span>
        </div>

        {/* Right: status */}
        <div className="flex flex-col items-end gap-1">
          {['NET ACTIVE', 'GPS LOCKED', 'AI ONLINE'].map((label, i) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="font-mono text-[9px] tracking-widest text-cyan-700">{label}</span>
              <div className="w-1 h-1 rounded-full bg-cyan-500" style={{ boxShadow: '0 0 4px #00d4ff', animationDelay: `${i * 0.4}s`, animation: 'core-pulse 2.4s ease-in-out infinite' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom border */}
      <div style={{ height: '0.5px', background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.2), rgba(0,212,255,0.4), rgba(0,212,255,0.2), transparent)' }} />
    </div>
  );
}
