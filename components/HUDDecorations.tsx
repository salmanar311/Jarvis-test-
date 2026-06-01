"use client";

import { useEffect, useRef } from "react";

function DataStreamInline({ len = 8, interval = 300 }: { len?: number; interval?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const chars = "0123456789ABCDEF";
    const el = ref.current;
    if (!el) return;
    el.textContent = Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const id = setInterval(() => {
      el.textContent = Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    }, interval + Math.random() * 200);
    return () => clearInterval(id);
  }, [len, interval]);
  return <span ref={ref} />;
}

// Animated data readout block
function DataBlock({ style, rows = 6 }: { style: React.CSSProperties; rows?: number }) {
  return (
    <div className="absolute font-mono text-[9px] tracking-wider flex flex-col gap-1.5" style={{ color: "rgba(0,212,255,0.22)", ...style, pointerEvents: "none" }}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <span style={{ color: "rgba(0,212,255,0.12)" }}>{(i * 4 + 16).toString(16).toUpperCase().padStart(2,"0")}:</span>
          <DataStreamInline len={6 + (i % 3)} interval={250 + i * 60} />
        </div>
      ))}
    </div>
  );
}

// Mini spinning ring
function MiniRing({ size, style, speed = 10 }: { size: number; style: React.CSSProperties; speed?: number }) {
  return (
    <div className="absolute" style={{ ...style, pointerEvents: "none" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={size/2-1} fill="none" stroke="#00d4ff" strokeWidth="0.6" strokeOpacity="0.12" />
        <circle cx={size/2} cy={size/2} r={size/2-5} fill="none" stroke="#00d4ff" strokeWidth="0.5" strokeOpacity="0.18" strokeDasharray="3 4"
          style={{ animation: `ring-spin-cw ${speed}s linear infinite`, transformOrigin: `${size/2}px ${size/2}px` }} />
        <circle cx={size/2} cy={size/2} r={size/2-10} fill="none" stroke="#00d4ff" strokeWidth="0.8" strokeOpacity="0.25" />
        <circle cx={size/2} cy={size/2} r="2.5" fill="#00d4ff" fillOpacity="0.5" style={{ filter: "drop-shadow(0 0 3px #00d4ff)" }} />
      </svg>
    </div>
  );
}

// Horizontal ruler with ticks
function Ruler({ width, style, reverse = false }: { width: number; style: React.CSSProperties; reverse?: boolean }) {
  return (
    <div className="absolute" style={{ ...style, pointerEvents: "none" }}>
      <svg width={width} height="16" viewBox={`0 0 ${width} 16`}>
        {reverse
          ? <line x1={width} y1="8" x2="0" y2="8" stroke="#00d4ff" strokeWidth="0.5" strokeOpacity="0.18" />
          : <line x1="0" y1="8" x2={width} y2="8" stroke="#00d4ff" strokeWidth="0.5" strokeOpacity="0.18" />}
        {Array.from({ length: Math.floor(width / 12) }, (_, i) => (
          <line key={i} x1={i * 12} y1={i % 5 === 0 ? 2 : 4} x2={i * 12} y2={i % 5 === 0 ? 14 : 12}
            stroke="#00d4ff" strokeWidth="0.5" strokeOpacity={i % 5 === 0 ? 0.35 : 0.15} />
        ))}
      </svg>
    </div>
  );
}

// Corner L-bracket decoration
function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const sx = pos === "tr" || pos === "br" ? -1 : 1;
  const sy = pos === "bl" || pos === "br" ? -1 : 1;
  const style: React.CSSProperties = {
    position: "absolute",
    pointerEvents: "none",
    ...(pos.includes("t") ? { top: 50 } : { bottom: 20 }),
    ...(pos.includes("l") ? { left: 0 } : { right: 0 }),
  };
  return (
    <div style={style}>
      <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: `scale(${sx},${sy})` }}>
        {/* Main L bracket */}
        <polyline points="8,8 8,130 130,130" fill="none" stroke="#00d4ff" strokeWidth="1" strokeOpacity="0.28" />
        <polyline points="16,16 16,122 122,122" fill="none" stroke="#00d4ff" strokeWidth="0.5" strokeOpacity="0.12" />
        {/* Extended arms */}
        <line x1="8" y1="130" x2="8" y2="210" stroke="#00d4ff" strokeWidth="0.5" strokeOpacity="0.1" />
        <line x1="130" y1="130" x2="210" y2="130" stroke="#00d4ff" strokeWidth="0.5" strokeOpacity="0.1" />
        {/* Ticks on horizontal arm */}
        {[150, 165, 180, 195].map(x => (
          <line key={x} x1={x} y1="126" x2={x} y2="134" stroke="#00d4ff" strokeWidth="0.8" strokeOpacity="0.25" />
        ))}
        {/* Ticks on vertical arm */}
        {[150, 165, 180, 195].map(y => (
          <line key={y} x1="4" y1={y} x2="12" y2={y} stroke="#00d4ff" strokeWidth="0.8" strokeOpacity="0.25" />
        ))}
        {/* Corner dot */}
        <circle cx="8" cy="8" r="2.5" fill="#00d4ff" fillOpacity="0.7" style={{ filter: "drop-shadow(0 0 4px #00d4ff)" }} />
        <circle cx="130" cy="130" r="1.5" fill="#00d4ff" fillOpacity="0.4" />
        {/* Crosshair at corner */}
        <line x1="0" y1="8" x2="22" y2="8" stroke="#00d4ff" strokeWidth="0.8" strokeOpacity="0.4" />
        <line x1="8" y1="0" x2="8" y2="22" stroke="#00d4ff" strokeWidth="0.8" strokeOpacity="0.4" />
      </svg>
    </div>
  );
}

// Arc segment decoration
function ArcSegment({ style, r = 80, start = -30, end = 30, opacity = 0.2 }: { style: React.CSSProperties; r?: number; start?: number; end?: number; opacity?: number }) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const cx = r + 4, cy = r + 4;
  const x1 = cx + r * Math.cos(toRad(start));
  const y1 = cy + r * Math.sin(toRad(start));
  const x2 = cx + r * Math.cos(toRad(end));
  const y2 = cy + r * Math.sin(toRad(end));
  const large = Math.abs(end - start) > 180 ? 1 : 0;
  return (
    <div className="absolute" style={{ ...style, pointerEvents: "none" }}>
      <svg width={r * 2 + 8} height={r * 2 + 8} viewBox={`0 0 ${r * 2 + 8} ${r * 2 + 8}`}>
        <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
          fill="none" stroke="#00d4ff" strokeWidth="1" strokeOpacity={opacity} strokeLinecap="round" />
        <circle cx={x1} cy={y1} r="2" fill="#00d4ff" fillOpacity={opacity * 1.5} />
        <circle cx={x2} cy={y2} r="2" fill="#00d4ff" fillOpacity={opacity * 1.5} />
      </svg>
    </div>
  );
}

// Hex grid patch
function HexGrid({ style, cols = 5, rows = 4, r = 12 }: { style: React.CSSProperties; cols?: number; rows?: number; r?: number }) {
  const hexPath = (cx: number, cy: number) => {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      return `${cx + (r - 1) * Math.cos(a)},${cy + (r - 1) * Math.sin(a)}`;
    }).join(" ");
    return `M ${pts} Z`;
  };
  const hexes: { cx: number; cy: number; o: number }[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      hexes.push({
        cx: col * r * 1.73 + (row % 2) * r * 0.865 + r,
        cy: row * r * 1.5 + r,
        o: 0.06 + ((row + col) % 3) * 0.04,
      });
    }
  }
  const w = cols * r * 1.73 + r * 2;
  const h = rows * r * 1.5 + r * 2;
  return (
    <div className="absolute" style={{ ...style, pointerEvents: "none" }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {hexes.map((hex, i) => (
          <path key={i} d={hexPath(hex.cx, hex.cy)} fill="none" stroke="#00d4ff" strokeWidth="0.6" strokeOpacity={hex.o} />
        ))}
      </svg>
    </div>
  );
}

// Vertical data bars (like an EQ)
function EQBars({ style, count = 8 }: { style: React.CSSProperties; count?: number }) {
  return (
    <div className="absolute flex items-end gap-0.5" style={{ ...style, height: 40, pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="w-1 rounded-sm"
          style={{
            background: "rgba(0,212,255,0.3)",
            boxShadow: "0 0 3px rgba(0,212,255,0.3)",
            animation: `speak-bar ${0.8 + (i % 3) * 0.3}s ease-in-out infinite`,
            animationDelay: `${i * 0.12}s`,
            height: `${20 + (i % 4) * 8}px`,
          }}
        />
      ))}
    </div>
  );
}

// Blinking dot grid
function DotGrid({ style, cols = 6, rows = 4 }: { style: React.CSSProperties; cols?: number; rows?: number }) {
  return (
    <div className="absolute" style={{ ...style, pointerEvents: "none" }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 10px)`, gap: 4 }}>
        {Array.from({ length: cols * rows }, (_, i) => (
          <div
            key={i}
            className="w-1 h-1 rounded-full"
            style={{
              background: "rgba(0,212,255,0.25)",
              animation: `core-pulse ${1.5 + (i % 5) * 0.4}s ease-in-out infinite`,
              animationDelay: `${(i % 7) * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function HUDDecorations() {
  return (
    <>
      {/* Corner brackets — all 4 corners */}
      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />

      {/* === LEFT SIDE FILL === */}
      <DataBlock style={{ left: 175, top: 160 }} rows={5} />
      <DataBlock style={{ left: 175, top: 490 }} rows={5} />
      <Ruler width={140} style={{ left: 110, top: 155 }} />
      <Ruler width={140} style={{ left: 110, top: 380 }} />
      <Ruler width={140} style={{ left: 110, top: 490 }} />
      <Ruler width={140} style={{ left: 110, bottom: 160 }} />
      <MiniRing size={44} style={{ left: 175, top: 430 }} speed={9} />
      <MiniRing size={32} style={{ left: 200, top: 580 }} speed={14} />
      <MiniRing size={28} style={{ left: 155, bottom: 200 }} speed={7} />
      <ArcSegment style={{ left: 200, top: 350 }} r={50} start={-60} end={60} opacity={0.18} />
      <ArcSegment style={{ left: 170, bottom: 120 }} r={40} start={120} end={240} opacity={0.15} />
      <EQBars style={{ left: 195, top: 630 }} count={7} />
      <DotGrid style={{ left: 115, top: 500 }} cols={5} rows={3} />

      {/* === RIGHT SIDE FILL === */}
      <DataBlock style={{ right: 175, top: 490 }} rows={5} />
      <DataBlock style={{ right: 175, top: 650 }} rows={4} />
      <Ruler width={140} style={{ right: 110, top: 480 }} reverse />
      <Ruler width={140} style={{ right: 110, top: 640 }} reverse />
      <Ruler width={140} style={{ right: 110, bottom: 160 }} reverse />
      <MiniRing size={44} style={{ right: 195, top: 580 }} speed={11} />
      <MiniRing size={36} style={{ right: 165, bottom: 220 }} speed={8} />
      <MiniRing size={28} style={{ right: 210, bottom: 130 }} speed={16} />
      <ArcSegment style={{ right: 185, top: 420 }} r={55} start={-45} end={45} opacity={0.18} />
      <ArcSegment style={{ right: 165, bottom: 100 }} r={42} start={130} end={230} opacity={0.15} />
      <EQBars style={{ right: 200, top: 720 }} count={6} />
      <DotGrid style={{ right: 115, bottom: 160 }} cols={5} rows={3} />

      {/* === BOTTOM FILL === */}
      <HexGrid style={{ left: 20, bottom: 20 }} cols={5} rows={3} r={13} />
      <HexGrid style={{ right: 20, bottom: 20 }} cols={5} rows={3} r={13} />
      <Ruler width={200} style={{ left: "20%", bottom: 110 }} />
      <Ruler width={200} style={{ right: "20%", bottom: 110 }} reverse />
      <DataBlock style={{ left: "18%", bottom: 130 }} rows={4} />
      <DataBlock style={{ right: "18%", bottom: 130 }} rows={4} />
      <MiniRing size={36} style={{ left: "16%", bottom: 200 }} speed={12} />
      <MiniRing size={36} style={{ right: "16%", bottom: 200 }} speed={10} />

      {/* === CENTER SIDES (between panels and reactor) === */}
      {/* Left mid connector */}
      <div className="absolute" style={{ left: "22%", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
        <svg width="80" height="120" viewBox="0 0 80 120">
          <line x1="70" y1="60" x2="0" y2="60" stroke="#00d4ff" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="3 5" />
          <line x1="70" y1="30" x2="20" y2="30" stroke="#00d4ff" strokeWidth="0.5" strokeOpacity="0.12" strokeDasharray="2 6" />
          <line x1="70" y1="90" x2="20" y2="90" stroke="#00d4ff" strokeWidth="0.5" strokeOpacity="0.12" strokeDasharray="2 6" />
          <circle cx="70" cy="60" r="2" fill="#00d4ff" fillOpacity="0.35" />
        </svg>
      </div>
      {/* Right mid connector */}
      <div className="absolute" style={{ right: "22%", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
        <svg width="80" height="120" viewBox="0 0 80 120">
          <line x1="10" y1="60" x2="80" y2="60" stroke="#00d4ff" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="3 5" />
          <line x1="10" y1="30" x2="60" y2="30" stroke="#00d4ff" strokeWidth="0.5" strokeOpacity="0.12" strokeDasharray="2 6" />
          <line x1="10" y1="90" x2="60" y2="90" stroke="#00d4ff" strokeWidth="0.5" strokeOpacity="0.12" strokeDasharray="2 6" />
          <circle cx="10" cy="60" r="2" fill="#00d4ff" fillOpacity="0.35" />
        </svg>
      </div>

      {/* === BLINKING DOTS scattered === */}
      {[
        { left: 310, top: 180 }, { left: 280, top: 440 }, { left: 340, top: 560 }, { left: 260, bottom: 180 },
        { right: 310, top: 220 }, { right: 270, top: 560 }, { right: 340, bottom: 240 }, { right: 260, top: 420 },
        { left: "38%", top: 130 }, { right: "38%", top: 130 }, { left: "38%", bottom: 100 }, { right: "38%", bottom: 100 },
      ].map((pos, i) => (
        <div key={i} className="absolute w-1 h-1 rounded-full" style={{
          ...pos as React.CSSProperties,
          backgroundColor: "#00d4ff",
          opacity: 0.25,
          boxShadow: "0 0 4px #00d4ff",
          animation: `core-pulse ${1.5 + (i % 4) * 0.4}s ease-in-out infinite`,
          animationDelay: `${i * 0.25}s`,
          pointerEvents: "none",
        }} />
      ))}

      {/* === VERTICAL AMBIENT LINES === */}
      <div className="absolute inset-0 pointer-events-none">
        {["28%", "72%"].map(left => (
          <div key={left} style={{ position: "absolute", left, top: 80, bottom: 60, width: "0.5px", background: "linear-gradient(to bottom, transparent, rgba(0,212,255,0.08) 20%, rgba(0,212,255,0.08) 80%, transparent)" }} />
        ))}
      </div>
    </>
  );
}
