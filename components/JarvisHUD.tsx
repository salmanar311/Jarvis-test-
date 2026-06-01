"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
type BootPhase = "cold" | "flicker" | "powering" | "live";

export default function JarvisHUD() {
  const [hudState, setHudState] = useState<HUDState>("idle");
  const [lastTranscript, setLastTranscript] = useState("");
  const [lastResponse, setLastResponse] = useState("");
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [elevenLabsKey, setElevenLabsKey] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bootPhase, setBootPhase] = useState<BootPhase>("cold");
  const [flickerOn, setFlickerOn] = useState(false);
  const [bootText, setBootText] = useState("");
  const voiceRef = useRef<{ startListening: () => void } | null>(null);

  useEffect(() => {
    setApiKey(localStorage.getItem("jarvis_api_key") || "");
    setElevenLabsKey(localStorage.getItem("jarvis_elevenlabs_key") || "");
  }, []);

  const handlePowerOn = () => {
    if (bootPhase !== "cold") return;
    setBootPhase("flicker");

    // Rapid flicker sequence — like electricity surging
    const flickers = [0, 80, 140, 200, 240, 320, 360, 420, 460, 520, 560, 600, 640, 700];
    flickers.forEach((t, i) => {
      setTimeout(() => setFlickerOn(i % 2 === 0), t);
    });

    // After flicker, go to powering — HUD appears with staggered glow
    setTimeout(() => {
      setFlickerOn(true);
      setBootPhase("powering");
      setBootText("INITIALIZING...");
    }, 750);

    setTimeout(() => setBootText("LOADING NEURAL MATRIX..."), 1100);
    setTimeout(() => setBootText("CALIBRATING VOICE SYSTEMS..."), 1500);
    setTimeout(() => setBootText("ALL SYSTEMS NOMINAL"), 1900);

    // Go live and immediately start listening
    setTimeout(() => {
      setBootPhase("live");
      setBootText("");
    }, 2400);

    // Auto-start listening after HUD is live
    setTimeout(() => {
      setHudState("listening");
    }, 2600);
  };

  const handleSettingsSave = (ak: string, elk: string) => {
    setApiKey(ak);
    setElevenLabsKey(elk);
  };

  const appendResponse = useCallback((chunk: string) => {
    setLastResponse((prev) => prev + chunk);
  }, []);

  const handleNeedApiKey = useCallback(() => setSettingsOpen(true), []);

  // ── COLD / FLICKER SCREEN ─────────────────────────────────────────────────
  if (bootPhase === "cold" || bootPhase === "flicker") {
    return (
      <div
        className="relative h-screen overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: "#000508" }}
      >
        <div className="absolute inset-0 hud-grid opacity-10 pointer-events-none" />

        {/* Faint reactor rings */}
        <div className="absolute" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
          <svg width="340" height="340" viewBox="0 0 340 340">
            {[165, 140, 115, 92, 70].map((r, i) => (
              <circle key={i} cx="170" cy="170" r={r} fill="none" stroke="#00d4ff"
                strokeWidth="0.5" strokeOpacity={bootPhase === "flicker" && flickerOn ? 0.12 + i * 0.02 : 0.03}
                strokeDasharray={i % 2 === 0 ? "4 8" : "none"}
                style={{ transition: "stroke-opacity 0.05s" }} />
            ))}
          </svg>
        </div>

        {/* The button */}
        <button
          onClick={handlePowerOn}
          disabled={bootPhase === "flicker"}
          className="relative z-10 rounded-full"
          style={{
            width: 72, height: 72,
            border: `1.5px solid rgba(0,212,255,${bootPhase === "flicker" && flickerOn ? 0.9 : 0.25})`,
            background: bootPhase === "flicker" && flickerOn
              ? "radial-gradient(circle, rgba(0,212,255,0.2) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)",
            boxShadow: bootPhase === "flicker" && flickerOn
              ? "0 0 40px rgba(0,212,255,0.6), 0 0 80px rgba(0,212,255,0.3)"
              : "0 0 8px rgba(0,212,255,0.08)",
            transition: "all 0.04s",
            cursor: bootPhase === "cold" ? "pointer" : "default",
          }}
        >
          <div className="absolute inset-2 rounded-full" style={{
            border: `1px solid rgba(0,212,255,${bootPhase === "flicker" && flickerOn ? 0.5 : 0.1})`,
            transition: "all 0.04s",
          }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full" style={{
              width: 10, height: 10,
              background: "#00d4ff",
              opacity: bootPhase === "flicker" && flickerOn ? 1 : 0.3,
              boxShadow: bootPhase === "flicker" && flickerOn ? "0 0 20px #00d4ff, 0 0 40px #00d4ff" : "0 0 4px #00d4ff",
              transition: "all 0.04s",
            }} />
          </div>
        </button>
      </div>
    );
  }

  // ── POWERING UP / LIVE ────────────────────────────────────────────────────
  const isPowering = bootPhase === "powering";
  const isLive = bootPhase === "live";

  return (
    <div
      className="relative h-screen overflow-hidden hud-grid"
      style={{ backgroundColor: "#000a14" }}
    >
      <div className="scan-line-container absolute inset-0 pointer-events-none z-10" />

      {/* Everything fades/brightens in during power-up */}
      <div style={{
        opacity: isLive ? 1 : 0.6,
        transition: "opacity 0.6s ease-in",
        position: "absolute", inset: 0, pointerEvents: "none",
      }}>
        <HUDDecorations />
      </div>

      {/* Boot text overlay during power-up */}
      {isPowering && bootText && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
          style={{ paddingTop: "70%" }}>
          <div className="font-mono text-xs tracking-[0.5em]"
            style={{
              color: "#00d4ff",
              textShadow: "0 0 12px rgba(0,212,255,0.8)",
              animation: "fadeInUp 0.2s ease-out",
            }}>
            {bootText}
          </div>
        </div>
      )}

      {/* Top bar — slides in */}
      <div style={{
        opacity: isLive ? 1 : 0,
        transform: isLive ? "translateY(0)" : "translateY(-8px)",
        transition: "opacity 0.5s ease-out 0.2s, transform 0.5s ease-out 0.2s",
      }}>
        <HUDTopBar />
      </div>

      {/* Left panel — fades in */}
      <div style={{
        opacity: isLive ? 1 : 0,
        transform: isLive ? "translateX(0)" : "translateX(-12px)",
        transition: "opacity 0.6s ease-out 0.3s, transform 0.6s ease-out 0.3s",
      }}>
        <HUDLeftPanel hudState={hudState} />
      </div>

      {/* Right panel — fades in */}
      <div style={{
        opacity: isLive ? 1 : 0,
        transform: isLive ? "translateX(0)" : "translateX(12px)",
        transition: "opacity 0.6s ease-out 0.4s, transform 0.6s ease-out 0.4s",
      }}>
        <HUDRightPanel
          lastTranscript={lastTranscript}
          lastResponse={lastResponse}
          conversationCount={conversationHistory.length / 2}
        />
      </div>

      {/* Arc reactor — scales up from tiny */}
      <div className="absolute" style={{
        top: "50%", left: "50%",
        transform: `translate(-50%, -50%) scale(${isPowering ? 0.6 : 1})`,
        zIndex: 5,
        transition: "transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
        opacity: 1,
      }}>
        <ArcReactor state={hudState} />
      </div>

      {/* Voice button */}
      <div className="absolute" style={{
        bottom: "6vh", left: "50%", transform: "translateX(-50%)", zIndex: 20,
        opacity: isLive ? 1 : 0,
        transition: "opacity 0.4s ease-out 0.6s",
      }}>
        <VoiceController
          ref={voiceRef}
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

      {/* Settings gear */}
      <button
        onClick={() => setSettingsOpen(true)}
        className="absolute top-3 right-3 z-30 w-7 h-7 flex items-center justify-center border border-cyan-500/20 text-cyan-700 hover:text-cyan-400 rounded transition-all"
        title="Settings"
      >
        <Settings size={12} />
      </button>

      {/* Bottom strip */}
      <div className="absolute bottom-0 left-0 right-0 px-6 py-1 flex items-center justify-between z-20 pointer-events-none"
        style={{ opacity: isLive ? 1 : 0, transition: "opacity 0.4s ease-out 0.5s" }}>
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
