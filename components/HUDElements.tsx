"use client";

export function HUDCornerRings({
  position,
}: {
  position: "tl" | "tr" | "bl" | "br";
}) {
  const transforms: Record<string, string> = {
    tl: "translate(80px, 80px)",
    tr: "translate(-80px, 80px) scaleX(-1)",
    bl: "translate(80px, -80px) scaleY(-1)",
    br: "translate(-80px, -80px) scale(-1, -1)",
  };

  const positionClasses: Record<string, string> = {
    tl: "top-0 left-0",
    tr: "top-0 right-0",
    bl: "bottom-0 left-0",
    br: "bottom-0 right-0",
  };

  return (
    <div
      className={`absolute ${positionClasses[position]} w-40 h-40 pointer-events-none`}
    >
      <svg
        width="160"
        height="160"
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform={transforms[position]}>
          {/* Outer rotating arc */}
          <g style={{ transformOrigin: "0 0" }} className="animate-rotate-slow">
            <path
              d="M -60 0 A 60 60 0 0 1 0 -60"
              stroke="#00d4ff"
              strokeWidth="1"
              strokeOpacity="0.4"
              strokeDasharray="15 8"
              fill="none"
            />
            <path
              d="M -65 0 A 65 65 0 0 1 0 -65"
              stroke="#00d4ff"
              strokeWidth="0.5"
              strokeOpacity="0.2"
              fill="none"
            />
          </g>

          {/* Middle reverse arc */}
          <g
            style={{ transformOrigin: "0 0" }}
            className="animate-rotate-slow-reverse"
          >
            <path
              d="M -45 0 A 45 45 0 0 1 0 -45"
              stroke="#0088cc"
              strokeWidth="1.5"
              strokeOpacity="0.6"
              strokeDasharray="20 5"
              fill="none"
            />
            <circle cx="-45" cy="0" r="2" fill="#00d4ff" fillOpacity="0.8" />
          </g>

          {/* Inner fast rotating arc */}
          <g
            style={{ transformOrigin: "0 0", animation: "rotate-slow 8s linear infinite" }}
          >
            <path
              d="M -28 0 A 28 28 0 0 1 0 -28"
              stroke="#00d4ff"
              strokeWidth="2"
              strokeOpacity="0.7"
              fill="none"
            />
          </g>

          {/* Static corner L-bracket */}
          <path
            d="M -75 -5 L -75 -75 L -5 -75"
            stroke="#00d4ff"
            strokeWidth="1"
            strokeOpacity="0.5"
            fill="none"
          />
          <path
            d="M -70 -10 L -70 -70 L -10 -70"
            stroke="#00d4ff"
            strokeWidth="0.5"
            strokeOpacity="0.2"
            fill="none"
          />

          {/* Dot markers */}
          <circle cx="-75" cy="-75" r="2.5" fill="#00d4ff" fillOpacity="0.9" />
          <circle cx="-75" cy="-5" r="1.5" fill="#00d4ff" fillOpacity="0.6" />
          <circle cx="-5" cy="-75" r="1.5" fill="#00d4ff" fillOpacity="0.6" />

          {/* Small tick marks */}
          <line x1="-30" y1="-75" x2="-30" y2="-70" stroke="#00d4ff" strokeWidth="1" strokeOpacity="0.4" />
          <line x1="-50" y1="-75" x2="-50" y2="-70" stroke="#00d4ff" strokeWidth="1" strokeOpacity="0.4" />
          <line x1="-75" y1="-30" x2="-70" y2="-30" stroke="#00d4ff" strokeWidth="1" strokeOpacity="0.4" />
          <line x1="-75" y1="-50" x2="-70" y2="-50" stroke="#00d4ff" strokeWidth="1" strokeOpacity="0.4" />
        </g>
      </svg>
    </div>
  );
}

export function HUDCenterRing() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      <div className="relative w-96 h-96 opacity-10">
        <svg
          width="384"
          height="384"
          viewBox="0 0 384 384"
          fill="none"
          className="absolute inset-0"
        >
          <g transform="translate(192,192)">
            <circle
              cx="0"
              cy="0"
              r="180"
              stroke="#00d4ff"
              strokeWidth="0.5"
              strokeDasharray="4 8"
              fill="none"
              className="animate-rotate-slow"
              style={{ transformOrigin: "0 0" }}
            />
            <circle
              cx="0"
              cy="0"
              r="150"
              stroke="#00d4ff"
              strokeWidth="1"
              strokeDasharray="20 10"
              fill="none"
              className="animate-rotate-slow-reverse"
              style={{ transformOrigin: "0 0" }}
            />
            <circle
              cx="0"
              cy="0"
              r="100"
              stroke="#0088cc"
              strokeWidth="0.5"
              fill="none"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

export function HUDScanLine() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0,212,255,0.15), rgba(0,212,255,0.4), rgba(0,212,255,0.15), transparent)",
          animation: "scan-line 6s linear infinite",
        }}
      />
    </div>
  );
}

export function HUDGridBackground() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: "50px 50px",
      }}
    />
  );
}

export function StatusBar() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="flex items-center gap-4 text-xs text-hud-muted font-mono">
      <span className="text-hud-cyan opacity-60">{timeStr}</span>
      <span className="opacity-40">|</span>
      <span className="flex items-center gap-1">
        <span
          className="w-1.5 h-1.5 rounded-full bg-green-400"
          style={{ boxShadow: "0 0 4px #4ade80", animation: "pulse-glow 2s ease-in-out infinite" }}
        />
        ONLINE
      </span>
      <span className="flex items-center gap-1">
        <span
          className="w-1.5 h-1.5 rounded-full bg-hud-cyan"
          style={{ animation: "pulse-glow 2s ease-in-out infinite 0.5s" }}
        />
        AI READY
      </span>
      <span className="flex items-center gap-1">
        <span
          className="w-1.5 h-1.5 rounded-full bg-hud-orange"
          style={{ boxShadow: "0 0 4px #ff6600", animation: "pulse-glow 2s ease-in-out infinite 1s" }}
        />
        VOICE READY
      </span>
    </div>
  );
}
