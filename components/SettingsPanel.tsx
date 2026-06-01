"use client";

import { useState } from "react";
import { KeyRound, Eye, EyeOff, CheckCircle, ExternalLink, Mic } from "lucide-react";

interface SettingsPanelProps {
  apiKey: string;
  onSave: (key: string) => void;
  elevenLabsKey: string;
  onSaveElevenLabs: (key: string) => void;
}

function KeyField({
  label,
  description,
  value,
  onChange,
  onSave,
  onClear,
  placeholder,
  saved,
  isSet,
  link,
  linkLabel,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onClear: () => void;
  placeholder: string;
  saved: boolean;
  isSet: boolean;
  link?: string;
  linkLabel?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="border border-hud-cyan/20 rounded p-4 bg-cyan-900/5">
      <h2 className="text-hud-cyan font-mono text-sm font-bold mb-1 flex items-center gap-2">
        <KeyRound size={14} /> {label}
      </h2>
      <p className="text-hud-muted text-xs font-mono mb-4 leading-relaxed">{description}</p>
      <div className="relative mb-3">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full hud-input rounded px-3 py-2 pr-10 text-sm text-hud-text bg-hud-dark/60 border border-hud-cyan/20 placeholder-hud-muted/50 font-mono transition-all focus:outline-none focus:border-hud-cyan/60 focus:shadow-[0_0_8px_rgba(0,212,255,0.2)]"
        />
        <button onClick={() => setShow((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-hud-muted hover:text-hud-cyan transition-colors">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={!value.trim()}
          className="hud-btn px-4 py-2 rounded text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saved ? <><CheckCircle size={14} />SAVED!</> : <><KeyRound size={14} />SAVE KEY</>}
        </button>
        {isSet && (
          <button onClick={onClear} className="px-4 py-2 rounded text-sm border border-red-500/30 text-red-400 hover:bg-red-900/20 transition-all font-mono text-xs">
            CLEAR
          </button>
        )}
      </div>
      {isSet && (
        <div className="mt-3 flex items-center gap-2 text-xs text-hud-cyan font-mono">
          <CheckCircle size={12} /><span>Key is set and active</span>
        </div>
      )}
      {link && (
        <a href={link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-hud-cyan/70 text-xs font-mono hover:text-hud-cyan transition-colors">
          <ExternalLink size={11} /> {linkLabel}
        </a>
      )}
    </div>
  );
}

export default function SettingsPanel({ apiKey, onSave, elevenLabsKey, onSaveElevenLabs }: SettingsPanelProps) {
  const [inputKey, setInputKey] = useState(apiKey);
  const [inputEL, setInputEL] = useState(elevenLabsKey);
  const [savedAnthropic, setSavedAnthropic] = useState(false);
  const [savedEL, setSavedEL] = useState(false);

  const handleSaveAnthropic = () => {
    onSave(inputKey.trim());
    setSavedAnthropic(true);
    setTimeout(() => setSavedAnthropic(false), 2000);
  };

  const handleSaveEL = () => {
    onSaveElevenLabs(inputEL.trim());
    setSavedEL(true);
    setTimeout(() => setSavedEL(false), 2000);
  };

  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto">
      <div className="max-w-lg mx-auto w-full space-y-6">

        <KeyField
          label="ANTHROPIC API KEY"
          description="Required for AI chat. Stored only in your browser — sent directly to Anthropic, never to any third-party server."
          value={inputKey}
          onChange={setInputKey}
          onSave={handleSaveAnthropic}
          onClear={() => { setInputKey(""); onSave(""); }}
          placeholder="sk-ant-api03-..."
          saved={savedAnthropic}
          isSet={!!apiKey}
          link="https://console.anthropic.com/settings/keys"
          linkLabel="Open Anthropic Console"
        />

        <div className="border border-hud-cyan/20 rounded p-4 bg-cyan-900/5">
          <h2 className="text-hud-cyan font-mono text-sm font-bold mb-1 flex items-center gap-2">
            <Mic size={14} /> ELEVENLABS VOICE KEY
            <span className="text-[10px] text-hud-orange border border-hud-orange/40 px-1.5 py-0.5 rounded">OPTIONAL</span>
          </h2>
          <p className="text-hud-muted text-xs font-mono mb-1 leading-relaxed">
            Gives Jarvis a realistic British AI voice (Daniel). Free tier: 10,000 characters/month.
            Without this, Jarvis uses your browser&apos;s built-in voice.
          </p>
          <p className="text-hud-muted/60 text-[10px] font-mono mb-4">
            Voice used: <span className="text-hud-cyan">Daniel (British, calm, deep)</span>
          </p>
          <div className="relative mb-3">
            <input
              type={false ? "text" : "password"}
              value={inputEL}
              onChange={(e) => setInputEL(e.target.value)}
              placeholder="sk_..."
              className="w-full hud-input rounded px-3 py-2 text-sm text-hud-text bg-hud-dark/60 border border-hud-cyan/20 placeholder-hud-muted/50 font-mono transition-all focus:outline-none focus:border-hud-cyan/60"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveEL}
              disabled={!inputEL.trim()}
              className="hud-btn px-4 py-2 rounded text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {savedEL ? <><CheckCircle size={14} />SAVED!</> : <><KeyRound size={14} />SAVE KEY</>}
            </button>
            {elevenLabsKey && (
              <button onClick={() => { setInputEL(""); onSaveElevenLabs(""); }} className="px-4 py-2 rounded text-sm border border-red-500/30 text-red-400 hover:bg-red-900/20 transition-all font-mono text-xs">
                CLEAR
              </button>
            )}
          </div>
          {elevenLabsKey && (
            <div className="mt-3 flex items-center gap-2 text-xs text-hud-cyan font-mono">
              <CheckCircle size={12} /><span>ElevenLabs voice active — Jarvis sounds real</span>
            </div>
          )}
          <a href="https://elevenlabs.io/app/speech-synthesis" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-hud-cyan/70 text-xs font-mono hover:text-hud-cyan transition-colors">
            <ExternalLink size={11} /> Get free ElevenLabs key
          </a>
        </div>

        <div className="border border-hud-cyan/10 rounded p-4 bg-hud-dark/30">
          <h3 className="text-hud-muted font-mono text-xs font-bold mb-2 tracking-widest">SYSTEM INFO</h3>
          <div className="space-y-1 text-xs font-mono text-hud-muted/70">
            <div className="flex justify-between"><span>AI Model</span><span className="text-hud-cyan">claude-sonnet-4-6</span></div>
            <div className="flex justify-between"><span>Addressing you as</span><span className="text-hud-cyan">Salman</span></div>
            <div className="flex justify-between"><span>Voice Engine</span><span className="text-hud-cyan">{elevenLabsKey ? "ElevenLabs (Daniel)" : "Browser Speech API"}</span></div>
            <div className="flex justify-between"><span>Search Engine</span><span className="text-hud-cyan">Wikipedia API</span></div>
            <div className="flex justify-between"><span>Storage</span><span className="text-hud-cyan">Browser localStorage</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
