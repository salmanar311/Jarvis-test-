'use client';

import React, { useEffect, useRef } from 'react';

type HUDState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface ArcReactorProps {
  state: HUDState;
}

const NUM_BARS = 32;

export default function ArcReactor({ state }: ArcReactorProps) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const bars = barsRef.current;

    const animateBars = () => {
      bars.forEach((bar, i) => {
        if (!bar) return;
        let height = 4;
        const t = Date.now() / 1000;

        if (state === 'speaking') {
          height = 6 + Math.abs(Math.sin(t * 8 + i * 0.5)) * 28 + Math.random() * 12;
        } else if (state === 'listening') {
          height = 4 + Math.abs(Math.sin(t * 4 + i * 0.4)) * 14;
        } else if (state === 'thinking') {
          height = 4 + Math.abs(Math.sin(t * 1.5 + i * 0.3)) * 8;
        } else {
          height = 3 + Math.abs(Math.sin(t * 0.8 + i * 0.2)) * 3;
        }

        bar.style.height = `${Math.min(height, 40)}px`;
      });

      animFrameRef.current = requestAnimationFrame(animateBars);
    };

    animFrameRef.current = requestAnimationFrame(animateBars);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [state]);

  const getBarColor = () => {
    if (state === 'speaking') return '#00d4ff';
    if (state === 'listening') return '#00ff88';
    if (state === 'thinking') return '#ff9900';
    return '#0088cc';
  };

  const getCoreColor = () => {
    if (state === 'speaking') return '#00d4ff';
    if (state === 'listening') return '#00ff88';
    if (state === 'thinking') return '#ff9900';
    return '#0066aa';
  };

  const getRingSpeed = (base: number) => {
    if (state === 'speaking') return base * 0.3;
    if (state === 'thinking') return base * 2;
    return base;
  };

  const barColor = getBarColor();
  const coreColor = getCoreColor();
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Rings */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
        style={{ overflow: 'visible' }}
      >
        {/* Ring 1 — outermost */}
        <g style={{
          transformOrigin: `${cx}px ${cy}px`,
          animation: `ring-spin-cw ${getRingSpeed(12)}s linear infinite`,
        }}>
          <circle cx={cx} cy={cy} r={148} fill="none" stroke={barColor} strokeWidth="1" strokeOpacity="0.3"
            strokeDasharray="8 6" />
          {[0, 90, 180, 270].map((deg) => (
            <rect key={deg} x={cx - 3} y={cy - 150} width="6" height="6"
              fill={barColor} fillOpacity="0.6"
              transform={`rotate(${deg} ${cx} ${cy})`} />
          ))}
        </g>

        {/* Ring 2 */}
        <g style={{
          transformOrigin: `${cx}px ${cy}px`,
          animation: `ring-spin-ccw ${getRingSpeed(9)}s linear infinite`,
        }}>
          <circle cx={cx} cy={cy} r={126} fill="none" stroke={barColor} strokeWidth="1.5" strokeOpacity="0.4"
            strokeDasharray="12 4" />
          {[45, 135, 225, 315].map((deg) => (
            <rect key={deg} x={cx - 2} y={cy - 128} width="4" height="8"
              fill={barColor} fillOpacity="0.7"
              transform={`rotate(${deg} ${cx} ${cy})`} />
          ))}
        </g>

        {/* Ring 3 */}
        <g style={{
          transformOrigin: `${cx}px ${cy}px`,
          animation: `ring-spin-cw ${getRingSpeed(7)}s linear infinite`,
        }}>
          <circle cx={cx} cy={cy} r={104} fill="none" stroke={barColor} strokeWidth="1" strokeOpacity="0.5"
            strokeDasharray="4 8" />
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <circle key={deg} cx={cx} cy={cy - 104} r="3" fill={barColor} fillOpacity="0.8"
              transform={`rotate(${deg} ${cx} ${cy})`} />
          ))}
        </g>

        {/* Ring 4 */}
        <g style={{
          transformOrigin: `${cx}px ${cy}px`,
          animation: `ring-spin-ccw ${getRingSpeed(5)}s linear infinite`,
        }}>
          <circle cx={cx} cy={cy} r={82} fill="none" stroke={barColor} strokeWidth="2" strokeOpacity="0.6"
            strokeDasharray="16 4" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <rect key={deg} x={cx - 1.5} y={cy - 84} width="3" height="5"
              fill={barColor} fillOpacity="0.9"
              transform={`rotate(${deg} ${cx} ${cy})`} />
          ))}
        </g>

        {/* Ring 5 — innermost ring */}
        <g style={{
          transformOrigin: `${cx}px ${cy}px`,
          animation: `ring-spin-cw ${getRingSpeed(3)}s linear infinite`,
        }}>
          <circle cx={cx} cy={cy} r={60} fill="none" stroke={coreColor} strokeWidth="1.5" strokeOpacity="0.7"
            strokeDasharray="6 3" />
        </g>

        {/* Glow layers on core */}
        <circle cx={cx} cy={cy} r={52} fill={coreColor} fillOpacity="0.05" />
        <circle cx={cx} cy={cy} r={42} fill={coreColor} fillOpacity="0.08" />

        {/* Core */}
        <circle cx={cx} cy={cy} r={34} fill="none" stroke={coreColor} strokeWidth="2" strokeOpacity="0.9"
          style={{ filter: `drop-shadow(0 0 8px ${coreColor})` }} />
        <circle cx={cx} cy={cy} r={26}
          fill={coreColor} fillOpacity={state === 'speaking' ? 0.5 : state === 'thinking' ? 0.3 : 0.2}
          style={{ filter: `drop-shadow(0 0 12px ${coreColor})`, animation: 'core-pulse 2s ease-in-out infinite' }} />
        <circle cx={cx} cy={cy} r={14}
          fill={coreColor} fillOpacity="0.9"
          style={{ filter: `drop-shadow(0 0 16px ${coreColor}) drop-shadow(0 0 32px ${coreColor})` }} />
        <circle cx={cx} cy={cy} r={6} fill="white" fillOpacity="0.95" />

        {/* Cross hairs */}
        <line x1={cx - 50} y1={cy} x2={cx - 62} y2={cy} stroke={barColor} strokeWidth="1" strokeOpacity="0.4" />
        <line x1={cx + 50} y1={cy} x2={cx + 62} y2={cy} stroke={barColor} strokeWidth="1" strokeOpacity="0.4" />
        <line x1={cx} y1={cy - 50} x2={cx} y2={cy - 62} stroke={barColor} strokeWidth="1" strokeOpacity="0.4" />
        <line x1={cx} y1={cy + 50} x2={cx} y2={cy + 62} stroke={barColor} strokeWidth="1" strokeOpacity="0.4" />
      </svg>

      {/* 32 vertical audio bars arranged in a circle */}
      <div className="absolute inset-0 flex items-center justify-center">
        {Array.from({ length: NUM_BARS }).map((_, i) => {
          const angle = (i / NUM_BARS) * 2 * Math.PI - Math.PI / 2;
          const radius = 156;
          const x = cx + radius * Math.cos(angle);
          const y = cy + radius * Math.sin(angle);
          const rotDeg = (i / NUM_BARS) * 360;
          return (
            <div
              key={i}
              ref={(el) => { barsRef.current[i] = el; }}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: '3px',
                height: '4px',
                backgroundColor: barColor,
                transform: `translate(-50%, -50%) rotate(${rotDeg}deg)`,
                transformOrigin: 'center bottom',
                boxShadow: `0 0 4px ${barColor}`,
                transition: 'background-color 0.3s ease',
                borderRadius: '1px',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
