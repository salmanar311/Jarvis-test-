'use client';

import React, { useEffect, useState } from 'react';

type HUDState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface HUDLeftPanelProps {
  hudState: HUDState;
}

function CornerBracket() {
  return (
    <>
      <div className="absolute top-0 left-0 w-4 h-px bg-cyan-400" />
      <div className="absolute top-0 left-0 w-px h-4 bg-cyan-400" />
      <div className="absolute top-0 right-0 w-4 h-px bg-cyan-400" />
      <div className="absolute top-0 right-0 w-px h-4 bg-cyan-400" />
      <div className="absolute bottom-0 left-0 w-4 h-px bg-cyan-400" />
      <div className="absolute bottom-0 left-0 w-px h-4 bg-cyan-400" />
      <div className="absolute bottom-0 right-0 w-4 h-px bg-cyan-400" />
      <div className="absolute bottom-0 right-0 w-px h-4 bg-cyan-400" />
    </>
  );
}

export default function HUDLeftPanel({ hudState }: HUDLeftPanelProps) {
  const [uptime, setUptime] = useState(0);
  const [cpu, setCpu] = useState(42);
  const [mem, setMem] = useState(61);
  const [energy, setEnergy] = useState(97);

  useEffect(() => {
    const id = setInterval(() => setUptime(u => u + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setCpu(c => Math.min(99, Math.max(20, c + (Math.random() - 0.48) * 5)));
      setMem(m => Math.min(85, Math.max(55, m + (Math.random() - 0.5) * 2)));
      setEnergy(e => Math.min(100, Math.max(93, e + (Math.random() - 0.5) * 1)));
    }, 1500);
    return () => clearInterval(id);
  }, []);

  const formatUptime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const stateColor = {
    idle: 'text-cyan-400',
    listening: 'text-green-400',
    thinking: 'text-yellow-400',
    speaking: 'text-cyan-300',
  }[hudState];

  const stateLabel = {
    idle: 'STANDBY',
    listening: 'LISTENING',
    thinking: 'PROCESSING',
    speaking: 'SPEAKING',
  }[hudState];

  const stateDot = {
    idle: 'bg-cyan-400',
    listening: 'bg-green-400',
    thinking: 'bg-yellow-400',
    speaking: 'bg-cyan-300',
  }[hudState];

  return (
    <div className="hud-panel relative p-4 flex flex-col gap-4 h-full">
      <CornerBracket />
      <div className="text-cyan-500 text-xs tracking-widest border-b border-cyan-500/20 pb-2">
        SYSTEM STATUS
      </div>

      {/* AI Status */}
      <div className="relative bg-black/40 border border-cyan-500/20 p-3 rounded">
        <CornerBracket />
        <div className="text-cyan-600 text-xs tracking-wider mb-1">AI CORE</div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${stateDot}`} />
          <span className={`text-sm font-bold tracking-wider ${stateColor}`}>{stateLabel}</span>
        </div>
      </div>

      {/* Uptime */}
      <div className="relative bg-black/40 border border-cyan-500/20 p-3 rounded">
        <CornerBracket />
        <div className="text-cyan-600 text-xs tracking-wider mb-1">UPTIME</div>
        <div className="text-cyan-300 text-lg font-bold font-mono">{formatUptime(uptime)}</div>
      </div>

      {/* CPU */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-cyan-600 tracking-wider">CPU</span>
          <span className="text-cyan-400">{Math.round(cpu)}%</span>
        </div>
        <div className="h-1.5 bg-black/60 border border-cyan-500/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-500 rounded-full transition-all duration-500"
            style={{ width: `${cpu}%`, boxShadow: '0 0 6px #00d4ff' }}
          />
        </div>
      </div>

      {/* Memory */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-cyan-600 tracking-wider">MEMORY</span>
          <span className="text-cyan-400">{Math.round(mem)}%</span>
        </div>
        <div className="h-1.5 bg-black/60 border border-cyan-500/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${mem}%`, boxShadow: '0 0 6px #0088cc' }}
          />
        </div>
      </div>

      {/* Energy */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-cyan-600 tracking-wider">ARC ENERGY</span>
          <span className="text-green-400">{Math.round(energy)}%</span>
        </div>
        <div className="h-1.5 bg-black/60 border border-cyan-500/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${energy}%`, boxShadow: '0 0 6px #00ff88' }}
          />
        </div>
      </div>

      {/* Voice status */}
      <div className="relative bg-black/40 border border-cyan-500/20 p-3 rounded">
        <CornerBracket />
        <div className="text-cyan-600 text-xs tracking-wider mb-2">VOICE SYSTEMS</div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-xs text-cyan-400 tracking-wider">SPEECH RECOGNITION</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-xs text-cyan-400 tracking-wider">TTS ENGINE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs text-cyan-400 tracking-wider">ANTHROPIC API</span>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Mini arc reactor logo */}
      <div className="flex justify-center">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="none" stroke="#00d4ff" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 3" />
          <circle cx="20" cy="20" r="12" fill="none" stroke="#00d4ff" strokeWidth="1" strokeOpacity="0.5" />
          <circle cx="20" cy="20" r="6" fill="#00d4ff" fillOpacity="0.3" />
          <circle cx="20" cy="20" r="3" fill="#00d4ff" fillOpacity="0.9" style={{ filter: 'drop-shadow(0 0 4px #00d4ff)' }} />
        </svg>
      </div>
    </div>
  );
}
