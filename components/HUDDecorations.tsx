"use client";

import { useEffect, useRef } from "react";

// Animated data stream — scrolling hex numbers
function DataStream({ style }: { style: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const chars = "0123456789ABCDEF";
    const el = ref.current;
    if (!el) return;
    const id = setInterval(() => {
      el.textContent = Array.from({ length: 6 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
      ).join(" ");
    }, 120);
    return () => clearInterval(id);
  }, []);
  return (
    <div
      ref={ref}
      className="absolute font-mono text-[9px] tracking-widest"
      style={{ color: "rgba(0,212,255,0.25)", ...style }}
    />
  );
}

// Small spinning ring
function MiniRing({ size, style }: { size: number; style: React.CSSProperties }) {
  return (
    <div className="absolute" style={style}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={size/2-2} fill="none" stroke="#00d4ff" strokeWidth="0.8" strokeOpacity="0.2" />
        <circle cx={size/2} cy={size/2} r={size/2-6} fill="none" stroke="#00d4ff" strokeWidth="0.5" strokeOpacity="0.15" strokeDasharray="3 5" style={{ animation: "ring-spin-cw 8s linear infinite", transformOrigin: `${size/2}px ${size/2}px` }} />
        <circle cx={size/2} cy={size/2} r={size/2-12} fill="none" stroke="#00d4ff" strokeWidth="0.8" strokeOpacity="0.3" />
        <circle cx={size/2} cy={size/2} r="3" fill="#00d4ff" fillOpacity="0.5" style={{ filter: "drop-shadow(0 0 3px #00d4ff)" }} />
      </svg>
    </div>
  );
}

// Horizontal scan line with tick marks
function ScanBar({ style }: { style: React.CSSProperties }) {
  return (
    <div className="absolute" style={{ ...style, pointerEvents: "none" }}>
      <svg width="200" height="12" viewBox="0 0 200 12">
        <line x1="0" y1="6" x2="200" y2="6" stroke="#00d4ff" strokeWidth="0.5" strokeOpacity="0.2" />
        {Array.from({ length: 20 }, (_, i) => (
          <line key={i} x1={i * 10 + 5} y1={i % 5 === 0 ? 2 : 4} x2={i * 10 + 5} y2={i % 5 === 0 ? 10 : 8}
            stroke="#00d4ff" strokeWidth="0.5" strokeOpacity={i % 5 === 0 ? 0.4 : 0.2} />
        ))}
      </svg>
    </div>
  );
}

// Corner circuit decoration
function CornerCircuit({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const flip = {
    tl: "scale(1,1)",
    tr: "scale(-1,1)",
    bl: "scale(1,-1)",
    br: "scale(-1,-1)",
  }[position];
  const pos = {
    tl: { top: 40, left: 0 },
    tr: { top: 40, right: 0 },
    bl: { bottom: 60, left: 0 },
    br: { bottom: 60, right: 0 },
  }[position];
  return (
    <div className="absolute" style={{ ...pos, pointerEvents: "none" }}>
      <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: flip }}>
        {/* L-bracket */}
        <polyline points="10,10 10,80 80,80" fill="none" stroke="#00d4ff" strokeWidth="0.8" strokeOpacity="0.3" />
        <polyline points="20,20 20,70 70,70" fill="none" stroke="#00d4ff" strokeWidth="0.4" strokeOpacity="0.15" />
        {/* Tick marks along horizontal */}
        {[90, 110, 130, 150].map(x => (
          <line key={x} x1={x} y1="77" x2={x} y2="83" stroke="#00d4ff" strokeWidth="0.8" strokeOpacity="0.3" />
        ))}
        {/* Tick marks along vertical */}
        {[90, 110, 130, 150].map(y => (
          <line key={y} x1="7" y1={y} x2="13" y2={y} stroke="#00d4ff" strokeWidth="0.8" strokeOpacity="0.3" />
        ))}
        {/* Small corner dot */}
        <circle cx="10" cy="10" r="2" fill="#00d4ff" fillOpacity="0.6" style={{ filter: "drop-shadow(0 0 3px #00d4ff)" }} />
        {/* Extended lines */}
        <line x1="10" y1="80" x2="10" y2="170" stroke="#00d4ff" strokeWidth="0.4" strokeOpacity="0.1" />
        <line x1="80" y1="80" x2="170" y2="80" stroke="#00d4ff" strokeWidth="0.4" strokeOpacity="0.1" />
      </svg>
    </div>
  );
}

// Vertical data column
function DataColumn({ style }: { style: React.CSSProperties }) {
  return (
    <div className="absolute flex flex-col gap-1" style={{ ...style, pointerEvents: "none" }}>
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="w-1 h-px" style={{ backgroundColor: `rgba(0,212,255,${0.1 + (i % 3) * 0.1})` }} />
          <DataStreamInline />
        </div>
      ))}
    </div>
  );
}

function DataStreamInline() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const chars = "0123456789ABCDEF";
    const el = ref.current;
    if (!el) return;
    const len = Math.floor(Math.random() * 6) + 4;
    const id = setInterval(() => {
      el.textContent = Array.from({ length: len }, () =>
        chars[Math.floor(Math.random() * chars.length)]
      ).join("");
    }, 200 + Math.random() * 400);
    return () => clearInterval(id);
  }, []);
  return <span ref={ref} className="font-mono text-[8px]" style={{ color: "rgba(0,212,255,0.15)" }} />;
}

// Horizontal connecting line from panel to center area
function ConnectorLine({ style, width = 200, reverse = false }: { style: React.CSSProperties; width?: number; reverse?: boolean }) {
  return (
    <div className="absolute" style={{ ...style, pointerEvents: "none" }}>
      <svg width={width} height="20" viewBox={`0 0 ${width} 20`}>
        <line x1={reverse ? width : 0} y1="10" x2={reverse ? 0 : width} y2="10"
          stroke="#00d4ff" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="4 6" />
        <circle cx={reverse ? width : 0} cy="10" r="2" fill="#00d4ff" fillOpacity="0.4" />
      </svg>
    </div>
  );
}

// Hexagonal grid patch
function HexGrid({ style }: { style: React.CSSProperties }) {
  const hexPath = (cx: number, cy: number, r: number) => {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(" ");
    return `M ${pts} Z`;
  };
  const hexes: { cx: number; cy: number }[] = [];
  const r = 14;
  const rows = 3, cols = 4;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      hexes.push({
        cx: col * r * 1.75 + (row % 2) * r * 0.875 + r,
        cy: row * r * 1.5 + r,
      });
    }
  }
  const w = cols * r * 1.75 + r;
  const h = rows * r * 1.5 + r;
  return (
    <div className="absolute" style={{ ...style, pointerEvents: "none" }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {hexes.map((hex, i) => (
          <path key={i} d={hexPath(hex.cx, hex.cy, r - 2)}
            fill="none" stroke="#00d4ff" strokeWidth="0.5"
            strokeOpacity={0.08 + (i % 3) * 0.06} />
        ))}
      </svg>
    </div>
  );
}

export default function HUDDecorations() {
  return (
    <>
      {/* Corner circuits */}
      <CornerCircuit position="tl" />
      <CornerCircuit position="tr" />
      <CornerCircuit position="bl" />
      <CornerCircuit position="br" />

      {/* Mini rings scattered */}
      <MiniRing size={50} style={{ left: 180, top: 120 }} />
      <MiniRing size={36} style={{ left: 160, top: 340 }} />
      <MiniRing size={44} style={{ right: 260, top: 160 }} />
      <MiniRing size={32} style={{ right: 200, bottom: 160 }} />
      <MiniRing size={40} style={{ left: 220, bottom: 180 }} />
      <MiniRing size={28} style={{ right: 300, bottom: 220 }} />

      {/* Scan bars */}
      <ScanBar style={{ left: 120, top: 200 }} />
      <ScanBar style={{ left: 120, top: 260 }} />
      <ScanBar style={{ right: 120, top: 480, transform: "scaleX(-1)" }} />
      <ScanBar style={{ left: 120, bottom: 240 }} />
      <ScanBar style={{ right: 120, bottom: 300, transform: "scaleX(-1)" }} />

      {/* Data columns */}
      <DataColumn style={{ left: 230, top: 180 }} />
      <DataColumn style={{ right: 230, top: 500 }} />

      {/* Hex grids */}
      <HexGrid style={{ right: 20, bottom: 120 }} />
      <HexGrid style={{ left: 20, bottom: 180 }} />

      {/* Connector lines from left panels to center */}
      <ConnectorLine style={{ left: 130, top: 118 }} width={160} />
      <ConnectorLine style={{ left: 150, top: 200 }} width={120} />
      <ConnectorLine style={{ left: 150, top: 300 }} width={100} />

      {/* Connector lines from right panels to center */}
      <ConnectorLine style={{ right: 260, top: 118 }} width={160} reverse />
      <ConnectorLine style={{ right: 260, top: 360 }} width={120} reverse />

      {/* Floating data streams */}
      <DataStream style={{ left: 250, top: 150 }} />
      <DataStream style={{ left: 200, top: 500 }} />
      <DataStream style={{ right: 250, top: 450 }} />
      <DataStream style={{ right: 280, bottom: 200 }} />
      <DataStream style={{ left: 270, bottom: 260 }} />

      {/* Horizontal rule lines across the middle */}
      <div className="absolute pointer-events-none" style={{ left: 220, top: "50%", width: 180 }}>
        <div style={{ height: "0.5px", background: "linear-gradient(to right, transparent, rgba(0,212,255,0.15), transparent)" }} />
      </div>
      <div className="absolute pointer-events-none" style={{ right: 220, top: "50%", width: 180 }}>
        <div style={{ height: "0.5px", background: "linear-gradient(to left, transparent, rgba(0,212,255,0.15), transparent)" }} />
      </div>

      {/* Vertical rule lines */}
      <div className="absolute pointer-events-none" style={{ left: "30%", top: 100, bottom: 100, width: "0.5px" }}>
        <div style={{ height: "100%", background: "linear-gradient(to bottom, transparent, rgba(0,212,255,0.06), transparent)" }} />
      </div>
      <div className="absolute pointer-events-none" style={{ right: "30%", top: 100, bottom: 100, width: "0.5px" }}>
        <div style={{ height: "100%", background: "linear-gradient(to bottom, transparent, rgba(0,212,255,0.06), transparent)" }} />
      </div>

      {/* Small blinking dots scattered */}
      {[
        { left: 300, top: 200 }, { left: 250, top: 450 }, { left: 350, top: 600 },
        { right: 320, top: 250 }, { right: 280, top: 550 }, { right: 350, bottom: 200 },
        { left: 400, bottom: 300 }, { right: 400, top: 400 },
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            ...pos,
            backgroundColor: "#00d4ff",
            opacity: 0.3,
            boxShadow: "0 0 4px #00d4ff",
            animation: `pulse-glow ${1.5 + (i % 3) * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}
