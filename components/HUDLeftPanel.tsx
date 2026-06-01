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

  const stateColor =
    hudState === 'speaking' ? '#00d4ff'
    : hudState === 'listening' ? '#00ff88'
    : hudState === 'thinking' ? '#66ccff'
    : '#004466';

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
    return `M ${cx} ${cy - r} A ${r} ${r} 0 ${large} 1 ${x} ${y}`;
  };

  return (
    <>
      {/* Date circle — top left */}
      <div className="absolute" style={{ left: 24, top: 90 }}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#00d4ff" strokeWidth="0.8" strokeOpacity="0.25" />
          <circle cx="40" cy="40" r="36" fill="none" stroke="#00d4ff" strokeWidth="0.8" strokeOpacity="0.12" strokeDasharray="3 7" />
          <text x="40" y="30" textAnchor="middle" dominantBaseline="middle"
            fontSize="8" fontFamily="'Space Mono',monospace" fill="#00d4ff" fillOpacity="0.55" letterSpacing="2">
            {date.month}
          </text>
          <text x="40" y="48" textAnchor="middle" dominantBaseline="middle"
            fontSize="20" fontFamily="'Space Mono',monospace" fill="#00d4ff"
            style={{ filter: 'drop-shadow(0 0 5px #00d4ff)' }}>
            {date.day}
          </text>
        </svg>
        <div className="text-center font-mono text-[10px] tracking-widest text-cyan-700 mt-0.5">{date.dow}</div>
      </div>

      {/* Thin separator line */}
      <div
        className="absolute"
        style={{
          left: 16,
          top: 188,
          width: 140,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.15), transparent)',
        }}
      />

      {/* Storage bars */}
      <div className="absolute" style={{ left: 24, top: 204 }}>
        <div className="mb-3.5">
          <div className="flex justify-between font-mono text-[9px] tracking-widest text-cyan-700 mb-1.5">
            <span>PRIMARY STORAGE</span>
            <span className="text-cyan-500">{storage.primary}%</span>
          </div>
          <div className="relative" style={{ width: 136, height: 1, background: 'rgba(0,70,100,0.5)' }}>
            <div
              className="absolute top-0 left-0 h-full"
              style={{
                width: `${storage.primary}%`,
                background: '#00d4ff',
                boxShadow: '0 0 4px #00d4ff',
              }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between font-mono text-[9px] tracking-widest text-cyan-700 mb-1.5">
            <span>FREE CAPACITY</span>
            <span className="text-cyan-600">{storage.free}%</span>
          </div>
          <div className="relative" style={{ width: 136, height: 1, background: 'rgba(0,70,100,0.5)' }}>
            <div
              className="absolute top-0 left-0 h-full"
              style={{
                width: `${storage.free}%`,
                background: '#006688',
                boxShadow: '0 0 3px #00d4ff',
              }}
            />
          </div>
        </div>
      </div>

      {/* Thin separator line */}
      <div
        className="absolute"
        style={{
          left: 16,
          top: 282,
          width: 140,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.15), transparent)',
        }}
      />

      {/* Power gauge circle */}
      <div className="absolute" style={{ left: 24, top: 298 }}>
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="#00d4ff" strokeWidth="0.6" strokeOpacity="0.15" />
          <path
            d={gaugePath(power, 26, 32, 32)}
            fill="none" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 4px #00d4ff)' }}
          />
          <text x="32" y="30" textAnchor="middle" dominantBaseline="middle"
            fontSize="10" fontFamily="'Space Mono',monospace" fill="#00d4ff"
            style={{ filter: 'drop-shadow(0 0 4px #00d4ff)' }}>
            {power}%
          </text>
          <text x="32" y="44" textAnchor="middle" dominantBaseline="middle"
            fontSize="6" fontFamily="'Space Mono',monospace" fill="#00d4ff" fillOpacity="0.4" letterSpacing="1">
            PWR
          </text>
        </svg>
        <div className="font-mono text-[9px] tracking-widest text-cyan-700 text-center mt-0.5">POWER</div>
      </div>

      {/* Thin separator line */}
      <div
        className="absolute"
        style={{
          left: 16,
          top: 378,
          width: 140,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.15), transparent)',
        }}
      />

      {/* Status dots */}
      <div className="absolute" style={{ left: 24, top: 392 }}>
        <div className="flex flex-col gap-2.5">
          {[
            { label: 'AI CORE', color: stateColor },
            { label: 'NETWORK', color: '#00d4ff' },
            { label: 'VOICE', color: '#00d4ff' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 4px ${color}`,
                  animation: 'core-pulse 2.4s ease-in-out infinite',
                }}
              />
              <span className="font-mono text-[9px] tracking-widest text-cyan-700">{label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 font-mono text-[9px] tracking-widest text-cyan-600">
          {stateLabel}
        </div>
      </div>
    </>
  );
}
