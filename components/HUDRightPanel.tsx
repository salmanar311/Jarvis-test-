"use client";

import React, { useEffect, useState } from "react";

interface HUDRightPanelProps {
  lastTranscript: string;
  lastResponse: string;
  conversationCount: number;
}

interface WeatherData {
  temp: number;
  desc: string;
}

function weatherDescription(code: number): string {
  if (code === 0) return 'CLEAR';
  if (code <= 3) return 'PARTLY CLOUDY';
  if (code <= 9) return 'FOG';
  if (code <= 19) return 'DRIZZLE';
  if (code <= 29) return 'RAIN';
  if (code <= 39) return 'SNOW';
  if (code <= 59) return 'DRIZZLE';
  if (code <= 69) return 'RAIN';
  if (code <= 79) return 'SNOW';
  if (code <= 89) return 'SHOWER';
  return 'STORM';
}

export default function HUDRightPanel({ lastTranscript, lastResponse, conversationCount }: HUDRightPanelProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=29.7604&longitude=-95.3698&current=temperature_2m,weathercode&temperature_unit=fahrenheit')
      .then(r => r.json())
      .then(d => setWeather({
        temp: Math.round(d.current.temperature_2m),
        desc: weatherDescription(d.current.weathercode),
      }))
      .catch(() => setWeather({ temp: 88, desc: 'CLEAR' }));
  }, []);

  // Gauge arc path helper
  const gaugePath = (pct: number, r: number, cx: number, cy: number) => {
    const angle = (pct / 100) * 2 * Math.PI - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    const large = pct > 50 ? 1 : 0;
    return `M ${cx} ${cy - r} A ${r} ${r} 0 ${large} 1 ${x} ${y}`;
  };

  const tempPct = weather ? Math.min(100, Math.max(0, ((weather.temp - 20) / 100) * 100)) : 60;

  return (
    <>
      {/* Jarvis response — floating text top-right */}
      <div className="absolute" style={{ right: 24, top: 90, width: 220 }}>
        <div className="font-mono text-[9px] tracking-widest text-cyan-700 mb-2">NEURAL RESPONSE</div>
        <div
          className="font-mono text-[10px] text-cyan-400 leading-relaxed"
          style={{
            maxHeight: 170,
            overflow: 'hidden',
            textShadow: '0 0 5px rgba(0,212,255,0.35)',
          }}
        >
          {lastResponse ? (
            lastResponse.slice(-600)
          ) : (
            <span className="text-cyan-800">AWAITING NEURAL SIGNAL...</span>
          )}
        </div>
      </div>

      {/* Thin separator line */}
      <div
        className="absolute"
        style={{
          right: 16,
          top: 278,
          width: 140,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.15), transparent)',
        }}
      />

      {/* Weather circle */}
      <div className="absolute" style={{ right: 24, top: 294 }}>
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="32" fill="none" stroke="#00d4ff" strokeWidth="0.6" strokeOpacity="0.2" />
          <circle cx="36" cy="36" r="32" fill="none" stroke="#00d4ff" strokeWidth="0.6" strokeOpacity="0.1" strokeDasharray="3 9" />
          <path
            d={gaugePath(tempPct, 29, 36, 36)}
            fill="none" stroke="#00d4ff" strokeWidth="1.8" strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 4px #00d4ff)' }}
          />
          <text x="36" y="33" textAnchor="middle" dominantBaseline="middle"
            fontSize="13" fontFamily="'Space Mono',monospace" fill="#00d4ff"
            style={{ filter: 'drop-shadow(0 0 5px #00d4ff)' }}>
            {weather ? `${weather.temp}°` : '--°'}
          </text>
          <text x="36" y="48" textAnchor="middle" dominantBaseline="middle"
            fontSize="5.5" fontFamily="'Space Mono',monospace" fill="#00d4ff" fillOpacity="0.45" letterSpacing="0.5">
            {weather ? weather.desc : 'FETCH'}
          </text>
        </svg>
        <div className="font-mono text-[9px] tracking-widest text-cyan-700 text-center mt-0.5">HOUSTON TX</div>
      </div>

      {/* Thin separator line */}
      <div
        className="absolute"
        style={{
          right: 16,
          top: 382,
          width: 140,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.15), transparent)',
        }}
      />

      {/* Last query */}
      <div className="absolute" style={{ right: 24, top: 396, width: 220 }}>
        <div className="font-mono text-[9px] tracking-widest text-cyan-700 mb-2">LAST QUERY</div>
        <div className="flex items-start gap-2">
          <div className="w-1 h-1 rounded-full bg-cyan-600 mt-1.5 flex-shrink-0" />
          <div
            className="font-mono text-[10px] text-cyan-500 leading-relaxed"
            style={{ maxHeight: 80, overflow: 'hidden' }}
          >
            {lastTranscript ? (
              `"${lastTranscript}"`
            ) : (
              <span className="text-cyan-800">VOICE INPUT READY</span>
            )}
          </div>
        </div>
        <div className="font-mono text-[9px] tracking-widest text-cyan-800 mt-2">
          CONV #{conversationCount.toString().padStart(4, '0')}
        </div>
      </div>
    </>
  );
}
