'use client';

import React, { useEffect, useState } from 'react';

interface WeatherData {
  temp: number;
  code: number;
}

function weatherDescription(code: number): string {
  if (code === 0) return 'CLEAR';
  if (code <= 3) return 'PARTLY CLOUDY';
  if (code <= 9) return 'FOG';
  if (code <= 19) return 'DRIZZLE';
  if (code <= 29) return 'RAIN';
  if (code <= 39) return 'SNOW';
  if (code <= 49) return 'FOG';
  if (code <= 59) return 'DRIZZLE';
  if (code <= 69) return 'RAIN';
  if (code <= 79) return 'SNOW';
  if (code <= 89) return 'SHOWER';
  return 'STORM';
}

export default function HUDTopBar() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [day, setDay] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toTimeString().slice(0, 8));
      setDate(now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }));
      setDay(now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase());
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=29.7604&longitude=-95.3698&current=temperature_2m,weathercode&temperature_unit=fahrenheit')
      .then(r => r.json())
      .then(d => {
        setWeather({
          temp: Math.round(d.current.temperature_2m),
          code: d.current.weathercode,
        });
      })
      .catch(() => setWeather({ temp: 88, code: 0 }));
  }, []);

  return (
    <div className="flex items-center justify-between px-6 py-2 border-b border-cyan-500/20 bg-black/60 backdrop-blur-sm relative">
      {/* Scan line */}
      <div className="scan-line-container absolute inset-0 pointer-events-none" />

      {/* Left */}
      <div className="flex items-center gap-4">
        <div>
          <div className="text-cyan-400 font-bold text-lg tracking-widest text-glow-cyan">J.A.R.V.I.S</div>
          <div className="text-cyan-600 text-xs tracking-widest">MARK 85 // STARK INDUSTRIES</div>
        </div>
        <div className="w-px h-8 bg-cyan-500/30" />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-xs tracking-wider">SYSTEMS NOMINAL</span>
        </div>
      </div>

      {/* Center */}
      <div className="text-center">
        <div className="text-cyan-300 text-2xl font-bold tracking-widest font-mono text-glow-cyan">
          {time}
        </div>
        <div className="text-cyan-600 text-xs tracking-widest">
          {day} &bull; {date}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-cyan-400 text-sm tracking-wider">HOUSTON, TX</div>
          {weather ? (
            <div className="text-cyan-300 text-xs tracking-wider">
              {weather.temp}°F &bull; {weatherDescription(weather.code)}
            </div>
          ) : (
            <div className="text-cyan-600 text-xs">FETCHING...</div>
          )}
        </div>
        <div className="w-px h-8 bg-cyan-500/30" />
        <div className="flex flex-col gap-1">
          {['NET', 'GPS', 'API'].map(label => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-600 text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
