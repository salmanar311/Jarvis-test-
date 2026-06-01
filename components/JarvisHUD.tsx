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

type HUDState = "idle" | "listening" | "thinking" | "speaking";

export default function JarvisHUD() {
  const [hudState, setHudState] = useState<HUDState>("idle");
  const [lastTranscript, setLastTranscript] = useState("");
  const [lastResponse, setLastResponse] = useState("");
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [elevenLabsKey, setElevenLabsKey] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bootMessage, setBootMessage] = useState("SYSTEMS ONLINE");
  const [showBoot, setShowBoot] = useState(true);

  useEffect(() => {
    setApiKey(localStorage.getItem("jarvis_api_key") || "");
    setElevenLabsKey(localStorage.getItem("jarvis_elevenlabs_key") || "");

    const timer1 = setTimeout(() => setBootMessage("J.A.R.V.I.S. INITIALIZED"), 800);
    const timer2 = setTimeout(() => setBootMessage("ALL SYSTEMS NOMINAL"), 1600);
    const timer3 = setTimeout(() => setShowBoot(false), 2800);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const handleSettingsSave = (ak: string, elk: string) => {
    setApiKey(ak);
    setElevenLabsKey(elk);
  };

  const appendResponse = useCallback((chunk: string) => {
    setLastResponse((prev) => prev + chunk);
  }, []);

  const handleNeedApiKey = useCallback(() => {
    setSettingsOpen(true);
  }, []);

  return (
    <div
      className="relative h-screen overflow-hidden hud-grid"
      style={{ backgroundColor: "#000a14" }}
    >
      {/* Animated scan line */}
      <div className="scan-line-container absolute inset-0 pointer-events-none z-10" />

      {/* Boot flash */}
      {showBoot && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div
            className="text-cyan-400 font-bold tracking-[0.5em] text-xl font-mono"
            style={{
              textShadow: "0 0 20px rgba(0,212,255,0.9), 0 0 40px rgba(0,212,255,0.5)",
              animation: "fadeInUp 0.4s ease-out forwards",
            }}
          >
            {bootMessage}
          </div>
        </div>
      )}

      {/* Settings gear button */}
      <button
        onClick={() => setSettingsOpen(true)}
        className="absolute top-3 right-3 z-30 w-8 h-8 flex items-center justify-center border border-cyan-500/30 text-cyan-600 hover:text-cyan-400 hover:border-cyan-400 rounded transition-all bg-black/40"
        title="Settings"
      >
        <Settings size={14} />
      </button>

      {/* Top bar */}
      <HUDTopBar />

      {/* Left panels — absolutely positioned, floating */}
      <HUDLeftPanel hudState={hudState} />

      {/* Right panels — absolutely positioned, floating */}
      <HUDRightPanel
        lastTranscript={lastTranscript}
        lastResponse={lastResponse}
        conversationCount={conversationHistory.length / 2}
      />

      {/* Central Arc Reactor — absolutely centered */}
      <div
        className="absolute"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 5,
        }}
      >
        <ArcReactor state={hudState} />
      </div>

      {/* Voice controller — below center */}
      <div
        className="absolute"
        style={{
          bottom: "5vh",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
        }}
      >
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

      {/* Bottom status bar */}
      <div
        className="absolute bottom-0 left-0 right-0 px-6 py-1.5 flex items-center justify-between z-20"
        style={{ pointerEvents: "none" }}
      >
        <span className="text-cyan-800 text-[10px] tracking-widest font-mono">STARK INDUSTRIES © 3000</span>
        <span className="text-cyan-600 text-[10px] tracking-[0.3em] font-mono font-bold">
          {hudState === "idle"
            ? "TAP MICROPHONE TO SPEAK"
            : hudState === "listening"
            ? "VOICE CAPTURE ACTIVE"
            : hudState === "thinking"
            ? "NEURAL PROCESSING..."
            : "AUDIO OUTPUT ACTIVE"}
        </span>
        <span className="text-cyan-800 text-[10px] tracking-widest font-mono">MODEL: CLAUDE SONNET 4.6</span>
      </div>

      {/* Settings modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSettingsSave}
      />
    </div>
  );
}
