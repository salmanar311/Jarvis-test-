"use client";

import { useState } from "react";
import { KeyRound, Eye, EyeOff, CheckCircle, ExternalLink } from "lucide-react";

interface SettingsPanelProps {
  apiKey: string;
  onSave: (key: string) => void;
}

export default function SettingsPanel({ apiKey, onSave }: SettingsPanelProps) {
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const trimmed = inputKey.trim();
    onSave(trimmed);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    setInputKey("");
    onSave("");
  };

  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto">
      <div className="max-w-lg mx-auto w-full space-y-6">
        <div className="border border-hud-cyan/20 rounded p-4 bg-cyan-900/5">
          <h2 className="text-hud-cyan font-mono text-sm font-bold mb-1 flex items-center gap-2">
            <KeyRound size={14} /> ANTHROPIC API KEY
          </h2>
          <p className="text-hud-muted text-xs font-mono mb-4 leading-relaxed">
            Required for the AI chat feature. Your key is stored only in your browser&apos;s localStorage — never sent to any server except Anthropic directly.
          </p>

          <div className="relative mb-3">
            <input
              type={showKey ? "text" : "password"}
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="w-full hud-input rounded px-3 py-2 pr-10 text-sm text-hud-text bg-hud-dark/60 border border-hud-cyan/20 placeholder-hud-muted/50 font-mono transition-all focus:outline-none focus:border-hud-cyan/60 focus:shadow-[0_0_8px_rgba(0,212,255,0.2)]"
            />
            <button
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-hud-muted hover:text-hud-cyan transition-colors"
            >
              {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!inputKey.trim()}
              className="hud-btn px-4 py-2 rounded text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saved ? <><CheckCircle size={14} />SAVED!</> : <><KeyRound size={14} />SAVE KEY</>}
            </button>
            {apiKey && (
              <button
                onClick={handleClear}
                className="px-4 py-2 rounded text-sm border border-red-500/30 text-red-400 hover:bg-red-900/20 transition-all font-mono text-xs"
              >
                CLEAR
              </button>
            )}
          </div>

          {apiKey && (
            <div className="mt-3 flex items-center gap-2 text-xs text-hud-cyan font-mono">
              <CheckCircle size={12} />
              <span>API key is set — AI chat is active</span>
            </div>
          )}
        </div>

        <div className="border border-hud-cyan/10 rounded p-4 bg-hud-dark/30">
          <h3 className="text-hud-muted font-mono text-xs font-bold mb-2 tracking-widest">HOW TO GET AN API KEY</h3>
          <ol className="text-hud-muted/80 text-xs font-mono space-y-1 list-decimal list-inside">
            <li>Visit console.anthropic.com</li>
            <li>Sign up or log in</li>
            <li>Go to API Keys → Create Key</li>
            <li>Copy and paste it above</li>
          </ol>
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-hud-cyan/70 text-xs font-mono hover:text-hud-cyan transition-colors"
          >
            <ExternalLink size={11} /> Open Anthropic Console
          </a>
        </div>

        <div className="border border-hud-cyan/10 rounded p-4 bg-hud-dark/30">
          <h3 className="text-hud-muted font-mono text-xs font-bold mb-2 tracking-widest">SYSTEM INFO</h3>
          <div className="space-y-1 text-xs font-mono text-hud-muted/70">
            <div className="flex justify-between"><span>AI Model</span><span className="text-hud-cyan">claude-sonnet-4-6</span></div>
            <div className="flex justify-between"><span>Search Engine</span><span className="text-hud-cyan">Wikipedia API</span></div>
            <div className="flex justify-between"><span>Voice Engine</span><span className="text-hud-cyan">Web Speech API</span></div>
            <div className="flex justify-between"><span>Storage</span><span className="text-hud-cyan">Browser localStorage</span></div>
            <div className="flex justify-between"><span>Deployment</span><span className="text-hud-cyan">GitHub Pages</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
