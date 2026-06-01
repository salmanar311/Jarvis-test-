'use client';

import React, { useEffect, useRef, useState } from 'react';

type HUDState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface ArcReactorProps {
  state: HUDState;
}

const NUM_BARS = 32;

export default function ArcReactor({ state }: ArcReactorProps) {
  const barsRef = useRef<(SVGRectElement | null)[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const [time, setTime] = useState('');

  // Clock
  useEffect(() => {
    const tick = () => setTime(new Date().toTimeString().slice(0, 8));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Waveform animation via requestAnimationFrame
  useEffect(() => {
    const bars = barsRef.current;
    const animate = () => {
      const t = Date.now() / 1000;
      bars.forEach((bar, i) => {
        if (!bar) return;
        let h: number;
        if (state === 'speaking') {
          h = 4 + Math.abs(Math.sin(t * 9 + i * 0.55)) * 32 + Math.random() * 10;
        } else if (state === 'listening') {
          h = 3 + Math.abs(Math.sin(t * 4.5 + i * 0.45)) * 16;
        } else if (state === 'thinking') {
          h = 3 + Math.abs(Math.sin(t * 1.2 + i * 0.3)) * 8;
        } else {
          h = 2 + Math.abs(Math.sin(t * 0.7 + i * 0.25)) * 2.5;
        }
        h = Math.min(h, 40);
        bar.setAttribute('height', String(h));
        // Shift bar upward from baseline by half height (bars grow inward)
        bar.setAttribute('y', String(-h));
      });
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [state]);

  const barColor = state === 'speaking' ? '#00d4ff'
    : state === 'listening' ? '#00ff88'
    : state === 'thinking' ? '#ff9900'
    : '#0077aa';

  const barGlow = state === 'speaking' ? '0 0 8px #00d4ff, 0 0 16px #00d4ff'
    : state === 'listening' ? '0 0 6px #00ff88'
    : state === 'thinking' ? '0 0 5px #ff9900'
    : 'none';

  const barOpacity = state === 'idle' ? 0.3 : 0.9;

  // Size is set by CSS (60vmin) but SVG uses viewBox 400x400
  const VB = 400;
  const cx = VB / 2;
  const cy = VB / 2;
  const waveR = 148; // radius of waveform ring ~74% of 200

  // Concentric circle radii
  const rings = [190, 170, 148, 110, 80, 55, 36];

  return (
    <div
      style={{
        width: '60vmin',
        height: '60vmin',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${VB} ${VB}`}
        style={{ overflow: 'visible' }}
      >
        {/* Concentric background rings */}
        {rings.map((r, idx) => {
          const isWaveRing = r === waveR;
          if (isWaveRing) return null;
          const dashes = idx % 2 === 0 ? '6 5' : '3 8';
          const opacity = 0.12 + idx * 0.04;
          const sw = idx === 0 ? 0.8 : 1;
          return (
            <circle
              key={r}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke="#00d4ff"
              strokeWidth={sw}
              strokeOpacity={opacity}
              strokeDasharray={dashes}
            />
          );
        })}

        {/* Rotating dashed gear ring */}
        <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'ring-spin-ccw 18s linear infinite' }}>
          <circle cx={cx} cy={cy} r={170} fill="none" stroke="#00d4ff" strokeWidth="0.8"
            strokeOpacity="0.2" strokeDasharray="10 6" />
        </g>

        {/* Outer slow-spin ring with tick marks */}
        <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'ring-spin-cw 30s linear infinite' }}>
          <circle cx={cx} cy={cy} r={190} fill="none" stroke="#00d4ff" strokeWidth="0.7"
            strokeOpacity="0.15" strokeDasharray="4 12" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const x1 = cx + 183 * Math.cos(a);
            const y1 = cy + 183 * Math.sin(a);
            const x2 = cx + 193 * Math.cos(a);
            const y2 = cy + 193 * Math.sin(a);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#00d4ff" strokeWidth="1" strokeOpacity="0.3" />;
          })}
        </g>

        {/* Waveform bars — 32 SVG rect elements rotated around center */}
        {Array.from({ length: NUM_BARS }).map((_, i) => {
          const angleDeg = (i / NUM_BARS) * 360 - 90;
          const angleRad = (angleDeg * Math.PI) / 180;
          // Each bar is centered on the waveform ring radius
          const bx = cx + waveR * Math.cos(angleRad);
          const by = cy + waveR * Math.sin(angleRad);
          return (
            <g
              key={i}
              transform={`translate(${bx},${by}) rotate(${angleDeg + 90})`}
            >
              <rect
                ref={el => { barsRef.current[i] = el; }}
                x="-1.5"
                y="0"
                width="3"
                height="3"
                rx="1"
                fill={barColor}
                fillOpacity={barOpacity}
                style={{ filter: state !== 'idle' ? `drop-shadow(${barGlow})` : 'none' }}
              />
            </g>
          );
        })}

        {/* Inner rings */}
        <circle cx={cx} cy={cy} r={110} fill="none" stroke="#00d4ff" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="8 4" />
        <circle cx={cx} cy={cy} r={80} fill="none" stroke="#00d4ff" strokeWidth="1" strokeOpacity="0.25" />

        {/* Core glow fills */}
        <circle cx={cx} cy={cy} r={55} fill="#00d4ff" fillOpacity="0.04" />
        <circle cx={cx} cy={cy} r={42} fill="#00d4ff" fillOpacity="0.06" />

        {/* Core ring */}
        <circle cx={cx} cy={cy} r={36} fill="none" stroke="#00d4ff" strokeWidth="1.5" strokeOpacity="0.8"
          style={{ filter: 'drop-shadow(0 0 6px #00d4ff)' }} />

        {/* Inner pulse */}
        <circle cx={cx} cy={cy} r={26}
          fill="#00d4ff"
          fillOpacity={state === 'speaking' ? 0.18 : 0.07}
          style={{ animation: 'core-pulse 2.4s ease-in-out infinite' }}
        />

        {/* Time display in center */}
        <text
          x={cx} y={cy + 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fontFamily="'Space Mono', monospace"
          fill="#00d4ff"
          fillOpacity="0.9"
          style={{ filter: 'drop-shadow(0 0 4px #00d4ff)', letterSpacing: '1px' }}
        >
          {time}
        </text>

        {/* Crosshair lines from core outward */}
        {[0, 90, 180, 270].map(deg => {
          const rad = (deg * Math.PI) / 180;
          const x1 = cx + 38 * Math.cos(rad);
          const y1 = cy + 38 * Math.sin(rad);
          const x2 = cx + 54 * Math.cos(rad);
          const y2 = cy + 54 * Math.sin(rad);
          return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#00d4ff" strokeWidth="0.8" strokeOpacity="0.4" />;
        })}
      </svg>
    </div>
  );
}
