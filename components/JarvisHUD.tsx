"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Settings } from "lucide-react";
import { ChatMessage } from "@/lib/jarvis-ai";
import ArcReactor from "./ArcReactor";
import VoiceController from "./VoiceController";
import HUDTopBar from "./HUDTopBar";
import HUDLeftPanel from "./HUDLeftPanel";
import HUDRightPanel from "./HUDRightPanel";
import SettingsModal from "./SettingsModal";
import HUDDecorations from "./HUDDecorations";

type HUDState = "idle" | "listening" | "thinking" | "speaking";

export default function JarvisHUD() {
  const [hudState, setHudState] = useState<HUDState>("idle");
  const [lastTranscript, setLastTranscript] = useState("");
  const [lastResponse, setLastResponse] = useState("");
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [elevenLabsKey, setElevenLabsKey] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Cold start state
  const [powered, setPowered] = useState(false);
  const [powering, setPowering] = useState(false); // mid-boot animation
  const [hudVisible, setHudVisible] = useState(false);

  useEffect(() => {
    setApiKey(localStorage.getItem("jarvis_api_key") || "");
    setElevenLabsKey(localStorage.getItem("jarvis_elevenlabs_key") || "");
  }, []);

  const handlePowerOn = () => {
    if (powering || powered) return;
    setPowering(true);
    // Stagger: button pulses → reactor spins up → HUD fades in
    setTimeout(() => setPowered(true), 600);
    setTimeout(() => setHudVisible(true), 1200);
    setTimeout(() => setPowering(false), 2000);
  };

  const handleSettingsSave = (ak: string, elk: string) => {
    setApiKey(ak);
    setElevenLabsKey(elk);
  };

  const appendResponse = useCallback((chunk: string) => {
    setLastResponse((prev) => prev + chunk);
  }, []);

  const handleNeedApiKey = useCallback(() => setSettingsOpen(true), []);

  // ── COLD STATE: just a button ──────────────────────────────────────────────
  if (!powered) {
    return (
      <div className="relative h-screen overflow-hidden flex items-center justify-center" style={{ backgroundColor: "#000508" }}>
        {/* Very faint grid */}
        <div className="absolute inset-0 hud-grid opacity-20 pointer-events-none" />

        {/* Faint reactor outline */}
        <div className="absolute" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
          <svg width="320" height="320" viewBox="0 0 320 320">
            {[155, 130, 108, 88, 68].map((r, i) => (
              <circle key={i} cx="160" cy="160" r={r} fill="none" stroke="#00d4ff"
                strokeWidth="0.5" strokeOpacity={0.04 + i * 0.01}
                strokeDasharray={i % 2 === 0 ? "4 8" : "none"} />
            ))}
          </svg>
        </div>

        {/* The one button */}
        <button
          onClick={handlePowerOn}
          className="relative z-10 rounded-full transition-all duration-300"
          style={{
            width: 72,
            height: 72,
            border: `1.5px solid rgba(0,212,255,${powering ? 0.9 : 0.3})`,
            background: powering
              ? "radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)",
            boxShadow: powering
              ? "0 0 40px rgba(0,212,255,0.5), 0 0 80px rgba(0,212,255,0.2), inset 0 0 20px rgba(0,212,255,0.1)"
              : "0 0 10px rgba(0,212,255,0.1)",
            animation: powering ? "core-pulse 0.4s ease-in-out infinite" : "core-pulse 4s ease-in-out infinite",
          }}
        >
          {/* Inner ring */}
          <div className="absolute inset-2 rounded-full" style={{
            border: `1px solid rgba(0,212,255,${powering ? 0.6 : 0.15})`,
          }} />
          {/* Core dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full" style={{
              width: 10,
              height: 10,
              background: "#00d4ff",
              opacity: powering ? 1 : 0.4,
              boxShadow: powering ? "0 0 16px #00d4ff, 0 0 32px #00d4ff" : "0 0 6px #00d4ff",
            }} />
          </div>
        </button>
      </div>
    );
  }

  // ── POWERED STATE: full HUD ────────────────────────────────────────────────
  return (
    <div
      className="relative h-screen overflow-hidden hud-grid"
      style={{
        backgroundColor: "#000a14",
        // Fade entire HUD in after power-on
        opacity: hudVisible ? 1 : 0,
        transition: "opacity 0.8s ease-in",
      }}
    >
      <div className="scan-line-container absolute inset-0 pointer-events-none z-10" />
      <HUDDecorations />

      {/* Settings gear */}
      <button
        onClick={() => setSettingsOpen(true)}
        className="absolute top-3 right-14 z-30 w-7 h-7 flex items-center justify-center border border-cyan-500/20 text-cyan-700 hover:text-cyan-400 hover:border-cyan-400/50 rounded transition-all"
        title="Settings"
      >
        <Settings size={12} />
      </button>

      <HUDTopBar />
      <HUDLeftPanel hudState={hudState} />
      <HUDRightPanel
        lastTranscript={lastTranscript}
        lastResponse={lastResponse}
        conversationCount={conversationHistory.length / 2}
      />

      {/* Arc reactor */}
      <div className="absolute" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 5 }}>
        <ArcReactor state={hudState} />
      </div>

      {/* Voice button — simple round, below reactor */}
      <div className="absolute" style={{ bottom: "6vh", left: "50%", transform: "translateX(-50%)", zIndex: 20 }}>
        <VoiceController
          apiKey={apiKey}
          elevenLabsKey={elevenLabsKey}
          hudState={hudState}
          setHudState={setHudState}
          setLastTranscript={setLastTranscript}
          setLastResponse={setLastResponse}
          appendResponse={appendResponse}
          conversationHistory={conversationHistory}
          setConversationHistory={setConversationHistory}
          onNeedApiKey={handleNeedApiKey}
        />
      </div>

      {/* Bottom strip */}
      <div className="absolute bottom-0 left-0 right-0 px-6 py-1 flex items-center justify-between z-20 pointer-events-none">
        <span className="text-cyan-900 text-[9px] tracking-widest font-mono">STARK INDUSTRIES</span>
        <span className="text-cyan-700 text-[9px] tracking-[0.25em] font-mono">
          {hudState === "idle" ? "STANDBY" : hudState === "listening" ? "LISTENING" : hudState === "thinking" ? "PROCESSING" : "SPEAKING"}
        </span>
        <span className="text-cyan-900 text-[9px] tracking-widest font-mono">CLAUDE SONNET 4.6</span>
      </div>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} onSave={handleSettingsSave} />
    </div>
  );
}
