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
        // Bars grow outward from the ring — y=0 is at the ring, negative y goes inward
        bar.setAttribute('y', String(-h / 2));
      });
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [state]);

  const barColor =
    state === 'speaking' ? '#00d4ff'
    : state === 'listening' ? '#00ff88'
    : state === 'thinking' ? '#66ccff'
    : '#005577';

  const barFilter =
    state === 'speaking' ? 'drop-shadow(0 0 6px #00d4ff) drop-shadow(0 0 12px #00d4ff)'
    : state === 'listening' ? 'drop-shadow(0 0 5px #00ff88)'
    : state === 'thinking' ? 'drop-shadow(0 0 4px #66ccff)'
    : 'none';

  const barOpacity = state === 'idle' ? 0.25 : 0.95;

  // SVG coordinate system: 400×400, center at 200,200
  const VB = 400;
  const cx = VB / 2;
  const cy = VB / 2;

  // Waveform ring radius (~75% of 200)
  const waveR = 150;

  // Concentric background ring radii (from outside in)
  const bgRings = [192, 178, 162, 130, 108, 82, 58, 38];

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
        {/* Outermost faint ring with tick marks — slow CW spin */}
        <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'ring-spin-cw 40s linear infinite' }}>
          <circle cx={cx} cy={cy} r={192} fill="none" stroke="#00d4ff" strokeWidth="0.5" strokeOpacity="0.12" strokeDasharray="3 14" />
          {Array.from({ length: 24 }).map((_, i) => {
            const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
            const x1 = cx + 186 * Math.cos(a);
            const y1 = cy + 186 * Math.sin(a);
            const x2 = cx + 194 * Math.cos(a);
            const y2 = cy + 194 * Math.sin(a);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#00d4ff" strokeWidth="0.8" strokeOpacity="0.2" />;
          })}
        </g>

        {/* Second outer ring — slow CCW spin, dashed */}
        <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'ring-spin-ccw 25s linear infinite' }}>
          <circle cx={cx} cy={cy} r={178} fill="none" stroke="#00d4ff" strokeWidth="0.7" strokeOpacity="0.18" strokeDasharray="8 6" />
        </g>

        {/* Background concentric rings (static, no waveR) */}
        {bgRings.filter(r => r !== waveR).map((r, idx) => {
          if (r >= 160 || r <= 40) return null; // handled by spinning rings or core
          const opacity = 0.08 + idx * 0.03;
          const dash = idx % 2 === 0 ? '5 6' : '2 9';
          return (
            <circle
              key={r}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke="#00d4ff"
              strokeWidth="0.8"
              strokeOpacity={opacity}
              strokeDasharray={dash}
            />
          );
        })}

        {/* The waveform ring track (subtle) */}
        <circle cx={cx} cy={cy} r={waveR} fill="none" stroke="#00d4ff" strokeWidth="0.5" strokeOpacity="0.1" />

        {/* Waveform bars — 32 SVG rect elements rotated around center */}
        {Array.from({ length: NUM_BARS }).map((_, i) => {
          const angleDeg = (i / NUM_BARS) * 360 - 90;
          const angleRad = (angleDeg * Math.PI) / 180;
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
                y="-1.5"
                width="3"
                height="3"
                rx="1"
                fill={barColor}
                fillOpacity={barOpacity}
                style={{ filter: state !== 'idle' ? barFilter : 'none' }}
              />
            </g>
          );
        })}

        {/* Inner ring just inside waveform */}
        <circle cx={cx} cy={cy} r={130} fill="none" stroke="#00d4ff" strokeWidth="1" strokeOpacity="0.18" strokeDasharray="6 5" />

        {/* Inner mid ring */}
        <circle cx={cx} cy={cy} r={108} fill="none" stroke="#00d4ff" strokeWidth="0.8" strokeOpacity="0.2" />

        {/* Inner rotating gear ring */}
        <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'ring-spin-cw 12s linear infinite' }}>
          <circle cx={cx} cy={cy} r={82} fill="none" stroke="#00d4ff" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="4 4" />
        </g>

        {/* Inner solid ring */}
        <circle cx={cx} cy={cy} r={60} fill="none" stroke="#00d4ff" strokeWidth="1" strokeOpacity="0.3" />

        {/* Core glow fill */}
        <circle cx={cx} cy={cy} r={52} fill="#00d4ff" fillOpacity="0.03" />
        <circle cx={cx} cy={cy} r={40} fill="#00d4ff" fillOpacity="0.05" />

        {/* Core ring — bright */}
        <circle
          cx={cx} cy={cy} r={36}
          fill="none"
          stroke="#00d4ff"
          strokeWidth="1.5"
          strokeOpacity="0.85"
          style={{ filter: 'drop-shadow(0 0 5px #00d4ff) drop-shadow(0 0 10px #00d4ff)' }}
        />

        {/* Inner pulse circle */}
        <circle
          cx={cx} cy={cy} r={26}
          fill="#00d4ff"
          fillOpacity={state === 'speaking' ? 0.2 : state === 'listening' ? 0.12 : 0.06}
          style={{ animation: 'core-pulse 2.4s ease-in-out infinite' }}
        />

        {/* Crosshair lines from core ring outward */}
        {[0, 90, 180, 270].map(deg => {
          const rad = (deg * Math.PI) / 180;
          const x1 = cx + 38 * Math.cos(rad);
          const y1 = cy + 38 * Math.sin(rad);
          const x2 = cx + 58 * Math.cos(rad);
          const y2 = cy + 58 * Math.sin(rad);
          return (
            <line
              key={deg}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#00d4ff"
              strokeWidth="0.8"
              strokeOpacity="0.35"
            />
          );
        })}

        {/* Time display in center */}
        <text
          x={cx} y={cy + 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="10"
          fontFamily="'Space Mono', monospace"
          fill="#00d4ff"
          fillOpacity="0.9"
          style={{ filter: 'drop-shadow(0 0 4px #00d4ff)', letterSpacing: '1px' }}
        >
          {time}
        </text>

        {/* State label just below center */}
        <text
          x={cx} y={cy + 20}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="5.5"
          fontFamily="'Space Mono', monospace"
          fill="#00d4ff"
          fillOpacity="0.45"
          letterSpacing="2"
        >
          {state === 'idle' ? 'STANDBY'
            : state === 'listening' ? 'LISTENING'
            : state === 'thinking' ? 'PROCESSING'
            : 'SPEAKING'}
        </text>
      </svg>
    </div>
  );
}
