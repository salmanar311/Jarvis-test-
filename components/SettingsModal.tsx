"use client";

import React, { useState, useEffect } from "react";
import { X, Key, Save } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (anthropicKey: string, elevenLabsKey: string) => void;
}

export default function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
  const [anthropicKey, setAnthropicKey] = useState("");
  const [elevenLabsKey, setElevenLabsKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAnthropicKey(localStorage.getItem("jarvis_api_key") || "");
      setElevenLabsKey(localStorage.getItem("jarvis_elevenlabs_key") || "");
      setSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem("jarvis_api_key", anthropicKey);
    localStorage.setItem("jarvis_elevenlabs_key", elevenLabsKey);
    onSave(anthropicKey, elevenLabsKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,5,10,0.85)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="relative w-full max-w-md mx-4 hud-panel rounded-lg p-6"
        style={{ boxShadow: "0 0 60px rgba(0,212,255,0.15), 0 0 120px rgba(0,212,255,0.05)" }}
      >
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-6 h-px bg-cyan-400" />
        <div className="absolute top-0 left-0 w-px h-6 bg-cyan-400" />
        <div className="absolute top-0 right-0 w-6 h-px bg-cyan-400" />
        <div className="absolute top-0 right-0 w-px h-6 bg-cyan-400" />
        <div className="absolute bottom-0 left-0 w-6 h-px bg-cyan-400" />
        <div className="absolute bottom-0 left-0 w-px h-6 bg-cyan-400" />
        <div className="absolute bottom-0 right-0 w-6 h-px bg-cyan-400" />
        <div className="absolute bottom-0 right-0 w-px h-6 bg-cyan-400" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-cyan-400 font-bold tracking-widest text-sm">SYSTEM CONFIGURATION</h2>
            <p className="text-cyan-700 text-xs tracking-wider mt-1">STARK INDUSTRIES — CLASSIFIED</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border border-cyan-500/30 text-cyan-500 hover:text-cyan-300 hover:border-cyan-400 rounded transition-all"
          >
            <X size={14} />
          </button>
        </div>

        {/* API Key field */}
        <div className="mb-4">
          <label className="flex items-center gap-2 text-cyan-500 text-xs tracking-widest mb-2">
            <Key size={12} />
            ANTHROPIC API KEY
          </label>
          <input
            type="password"
            value={anthropicKey}
            onChange={(e) => setAnthropicKey(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full hud-input rounded px-3 py-2.5 text-sm text-cyan-200 bg-black/60 border border-cyan-500/30 placeholder-cyan-800 font-mono focus:outline-none focus:border-cyan-400 transition-all"
            style={{ caretColor: "#00d4ff" }}
          />
          <p className="text-cyan-800 text-xs mt-1 tracking-wider">Required for AI responses</p>
        </div>

        {/* ElevenLabs key field */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-cyan-500 text-xs tracking-widest mb-2">
            <Key size={12} />
            ELEVENLABS API KEY
          </label>
          <input
            type="password"
            value={elevenLabsKey}
            onChange={(e) => setElevenLabsKey(e.target.value)}
            placeholder="Optional — enables premium voice"
            className="w-full hud-input rounded px-3 py-2.5 text-sm text-cyan-200 bg-black/60 border border-cyan-500/30 placeholder-cyan-800 font-mono focus:outline-none focus:border-cyan-400 transition-all"
            style={{ caretColor: "#00d4ff" }}
          />
          <p className="text-cyan-800 text-xs mt-1 tracking-wider">Optional — falls back to browser TTS</p>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className={`w-full py-3 flex items-center justify-center gap-2 rounded border font-mono text-sm tracking-widest transition-all duration-200 ${
            saved
              ? "border-green-500 text-green-400 bg-green-900/20"
              : "hud-btn hover:bg-cyan-900/20"
          }`}
        >
          <Save size={14} />
          {saved ? "CONFIGURATION SAVED" : "SAVE CONFIGURATION"}
        </button>
      </div>
    </div>
  );
}
