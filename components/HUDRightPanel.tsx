"use client";

import React, { useEffect, useRef } from "react";

interface HUDRightPanelProps {
  lastTranscript: string;
  lastResponse: string;
  conversationCount: number;
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

export default function HUDRightPanel({
  lastTranscript,
  lastResponse,
  conversationCount,
}: HUDRightPanelProps) {
  const responseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [lastResponse]);

  return (
    <div className="hud-panel relative flex flex-col h-full p-4 gap-4">
      <CornerBracket />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"
            style={{ boxShadow: "0 0 6px rgba(0,212,255,0.8)" }}
          />
          <span className="text-cyan-400 text-xs tracking-widest font-bold">NEURAL RESPONSE</span>
        </div>
        <span className="text-cyan-600 text-xs tracking-wider">
          CONV #{conversationCount.toString().padStart(4, "0")}
        </span>
      </div>

      {/* Last Query */}
      <div className="relative bg-black/40 border border-cyan-500/20 p-3 rounded flex-shrink-0">
        <CornerBracket />
        <div className="text-cyan-600 text-xs tracking-widest mb-1">LAST QUERY</div>
        {lastTranscript ? (
          <div className="text-cyan-300 text-sm font-mono leading-relaxed">
            &ldquo;{lastTranscript}&rdquo;
          </div>
        ) : (
          <div className="text-cyan-800 text-xs italic">Awaiting voice input...</div>
        )}
      </div>

      {/* Response */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="text-cyan-600 text-xs tracking-widest mb-2">JARVIS RESPONSE</div>
        <div
          ref={responseRef}
          className="flex-1 overflow-y-auto relative bg-black/30 border border-cyan-500/15 rounded p-3"
        >
          {lastResponse ? (
            <p className="text-cyan-100 text-sm font-mono leading-relaxed whitespace-pre-wrap">
              {lastResponse}
              <span className="inline-block w-0.5 h-4 bg-cyan-400 ml-0.5 animate-blink align-text-bottom" />
            </p>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
              <div className="text-cyan-800 text-xs tracking-widest">AWAITING NEURAL SIGNAL</div>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="typing-dot"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* JARVIS ONLINE indicator */}
      <div className="border-t border-cyan-500/20 pt-2">
        <div className="flex items-center justify-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full bg-green-400"
            style={{ boxShadow: "0 0 6px #4ade80", animation: "pulse-glow 2s ease-in-out infinite" }}
          />
          <span className="text-green-400 text-xs tracking-[0.4em] font-bold">JARVIS ONLINE</span>
          <div
            className="w-1.5 h-1.5 rounded-full bg-green-400"
            style={{ boxShadow: "0 0 6px #4ade80", animation: "pulse-glow 2s ease-in-out infinite" }}
          />
        </div>
      </div>
    </div>
  );
}
