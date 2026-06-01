'use client';

import React, { useEffect, useState } from 'react';

type HUDState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface HUDLeftPanelProps {
  hudState: HUDState;
}

export default function HUDLeftPanel({ hudState }: HUDLeftPanelProps) {
  const [date, setDate] = useState({ month: '', day: '', dow: '' });
  const [storage] = useState({ primary: 73, free: 27 });
  const [power] = useState(97);

  useEffect(() => {
    const now = new Date();
    setDate({
      month: now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: now.getDate().toString(),
      dow: now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
    });
  }, []);

  const stateColor = hudState === 'speaking' ? '#00d4ff'
    : hudState === 'listening' ? '#00ff88'
    : hudState === 'thinking' ? '#ff9900'
    : '#0077aa';

  const stateLabel = {
    idle: 'STANDBY',
    listening: 'LISTENING',
    thinking: 'PROCESSING',
    speaking: 'SPEAKING',
  }[hudState];

  // Arc path for circle gauge
  const gaugePath = (pct: number, r: number, cx: number, cy: number) => {
    const angle = (pct / 100) * 2 * Math.PI - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    const large = pct > 50 ? 1 : 0;
    const startX = cx;
    const startY = cy - r;
    return `M ${startX} ${startY} A ${r} ${r} 0 ${large} 1 ${x} ${y}`;
  };

  return (
    <>
      {/* Date circle — top left */}
      <div className="absolute" style={{ left: 24, top: 90 }}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#00d4ff" strokeWidth="1" strokeOpacity="0.3" />
          <circle cx="40" cy="40" r="36" fill="none" stroke="#00d4ff" strokeWidth="1" strokeOpacity="0.15" strokeDasharray="4 6" />
          <text x="40" y="36" textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fontFamily="'Space Mono',monospace" fill="#00d4ff" fillOpacity="0.6" letterSpacing="2">
            {date.month}
          </text>
          <text x="40" y="52" textAnchor="middle" dominantBaseline="middle"
            fontSize="20" fontFamily="'Space Mono',monospace" fill="#00d4ff"
            style={{ filter: 'drop-shadow(0 0 6px #00d4ff)' }}>
            {date.day}
          </text>
        </svg>
        <div className="text-center font-mono text-[10px] tracking-widest text-cyan-600 mt-1">{date.dow}</div>
      </div>

      {/* Storage bars */}
      <div className="absolute" style={{ left: 24, top: 210 }}>
        <div className="mb-3">
          <div className="flex justify-between font-mono text-[10px] tracking-widest text-cyan-600 mb-1">
            <span>PRIMARY STORAGE</span>
            <span className="text-cyan-400">{storage.primary}%</span>
          </div>
          <div className="w-32 h-0.5 bg-cyan-900/60 relative">
            <div
              className="absolute top-0 left-0 h-full bg-cyan-500"
              style={{ width: `${storage.primary}%`, boxShadow: '0 0 4px #00d4ff' }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between font-mono text-[10px] tracking-widest text-cyan-600 mb-1">
            <span>FREE CAPACITY</span>
            <span className="text-cyan-400">{storage.free}%</span>
          </div>
          <div className="w-32 h-0.5 bg-cyan-900/60 relative">
            <div
              className="absolute top-0 left-0 h-full bg-cyan-700"
              style={{ width: `${storage.free}%`, boxShadow: '0 0 3px #00d4ff' }}
            />
          </div>
        </div>
      </div>

      {/* Power gauge circle */}
      <div className="absolute" style={{ left: 24, top: 310 }}>
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="#00d4ff" strokeWidth="0.8" strokeOpacity="0.15" />
          <path
            d={gaugePath(power, 26, 32, 32)}
            fill="none" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 4px #00d4ff)' }}
          />
          <text x="32" y="30" textAnchor="middle" dominantBaseline="middle"
            fontSize="11" fontFamily="'Space Mono',monospace" fill="#00d4ff"
            style={{ filter: 'drop-shadow(0 0 4px #00d4ff)' }}>
            {power}%
          </text>
          <text x="32" y="44" textAnchor="middle" dominantBaseline="middle"
            fontSize="7" fontFamily="'Space Mono',monospace" fill="#00d4ff" fillOpacity="0.5" letterSpacing="1">
            PWR
          </text>
        </svg>
        <div className="font-mono text-[10px] tracking-widest text-cyan-600 text-center mt-1">POWER</div>
      </div>

      {/* Status dots */}
      <div className="absolute" style={{ left: 24, top: 420 }}>
        <div className="flex flex-col gap-2">
          {[
            { label: 'AI CORE', color: stateColor },
            { label: 'NETWORK', color: '#00d4ff' },
            { label: 'VOICE', color: '#00d4ff' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}` }}
              />
              <span className="font-mono text-[10px] tracking-widest" style={{ color: '#0077aa' }}>{label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 font-mono text-[10px] tracking-widest text-cyan-600">
          {stateLabel}
        </div>
      </div>
    </>
  );
}
