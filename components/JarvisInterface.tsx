"use client";

import { useState, useEffect } from "react";
import { MessageSquare, ListTodo, Search, Activity, Cpu, Wifi, Shield, Settings, LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import ChatPanel from "./ChatPanel";
import TaskPanel from "./TaskPanel";
import SearchPanel from "./SearchPanel";
import SettingsPanel from "./SettingsPanel";
import { HUDCornerRings, HUDGridBackground, HUDScanLine } from "./HUDElements";

type Tab = "chat" | "tasks" | "search" | "settings";
type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

const tabs: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "chat", label: "NEURAL LINK", icon: MessageSquare },
  { id: "tasks", label: "TASK LOG", icon: ListTodo },
  { id: "search", label: "NET SCAN", icon: Search },
  { id: "settings", label: "SETTINGS", icon: Settings },
];

function useCurrentTime() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDate(now.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" }).toUpperCase());
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return { time, date };
}

function SystemStatus({ hasKey }: { hasKey: boolean }) {
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setUptime((u) => u + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (s: number) =>
    `${Math.floor(s / 3600).toString().padStart(2, "0")}:${Math.floor((s % 3600) / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="flex items-center gap-3 text-[10px] font-mono text-hud-muted">
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ boxShadow: "0 0 5px #4ade80", animation: "pulse-glow 2s ease-in-out infinite" }} />
        <span className="text-green-400">ONLINE</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Cpu size={10} className={hasKey ? "text-hud-cyan" : "text-hud-orange"} />
        <span className={hasKey ? "text-hud-cyan" : "text-hud-orange"}>{hasKey ? "AI READY" : "KEY NEEDED"}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Wifi size={10} className="text-hud-orange" />
        <span className="text-hud-orange">NET ACTIVE</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Shield size={10} className="text-hud-cyan/60" />
        <span className="text-hud-cyan/60">ENCRYPTED</span>
      </div>
      <span className="text-hud-muted/50 hidden md:inline">UP: {formatUptime(uptime)}</span>
    </div>
  );
}

function SidebarTab({ tab, active, onClick }: { tab: { id: Tab; label: string; icon: LucideIcon }; active: boolean; onClick: () => void }) {
  const Icon = tab.icon;
  return (
    <button
      onClick={onClick}
      className={`w-full flex flex-col items-center gap-1.5 py-4 px-2 transition-all duration-200 relative font-mono text-[10px] tracking-wider ${
        active ? "text-hud-cyan bg-cyan-900/20 border-r-2 border-hud-cyan" : "text-hud-muted hover:text-hud-cyan/70 hover:bg-cyan-900/10"
      }`}
    >
      {active && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-hud-cyan" style={{ boxShadow: "0 0 8px rgba(0,212,255,0.8)" }} />}
      <Icon size={20} />
      <span className="hidden lg:block">{tab.label}</span>
    </button>
  );
}

export default function JarvisInterface() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [apiKey, setApiKey] = useState("");
  const { time, date } = useCurrentTime();

  useEffect(() => {
    const stored = localStorage.getItem("jarvis_api_key") || "";
    setApiKey(stored);
  }, []);

  const handleSaveKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("jarvis_api_key", key);
  };

  const handleNeedApiKey = () => setActiveTab("settings");

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ backgroundColor: "#000a14" }}>
      <HUDGridBackground />
      <HUDScanLine />
      <HUDCornerRings position="tl" />
      <HUDCornerRings position="tr" />
      <HUDCornerRings position="bl" />
      <HUDCornerRings position="br" />

      <header className="relative z-10 border-b border-hud-cyan/30 bg-black/40 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-10 flex-shrink-0">
              <svg viewBox="0 0 40 40" className="w-10 h-10">
                <circle cx="20" cy="20" r="18" stroke="#00d4ff" strokeWidth="1" fill="none" strokeOpacity="0.5" strokeDasharray="4 3" className="animate-rotate-slow" style={{ transformOrigin: "20px 20px" }} />
                <circle cx="20" cy="20" r="13" stroke="#0088cc" strokeWidth="1.5" fill="none" className="animate-rotate-slow-reverse" style={{ transformOrigin: "20px 20px" }} />
                <circle cx="20" cy="20" r="7" fill="rgba(0, 212, 255, 0.15)" stroke="#00d4ff" strokeWidth="1" />
                <circle cx="20" cy="20" r="3" fill="#00d4ff" className="animate-pulse-glow" />
                <line x1="20" y1="7" x2="20" y2="13" stroke="#00d4ff" strokeWidth="0.8" strokeOpacity="0.6" />
                <line x1="20" y1="27" x2="20" y2="33" stroke="#00d4ff" strokeWidth="0.8" strokeOpacity="0.6" />
                <line x1="7" y1="20" x2="13" y2="20" stroke="#00d4ff" strokeWidth="0.8" strokeOpacity="0.6" />
                <line x1="27" y1="20" x2="33" y2="20" stroke="#00d4ff" strokeWidth="0.8" strokeOpacity="0.6" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-[0.3em] text-hud-cyan font-mono" style={{ textShadow: "0 0 10px rgba(0,212,255,0.8), 0 0 20px rgba(0,212,255,0.4)" }}>
                J.A.R.V.I.S
              </h1>
              <p className="text-[10px] text-hud-muted tracking-widest font-mono">JUST A RATHER VERY INTELLIGENT SYSTEM</p>
            </div>
          </div>
          <div className="hidden md:block"><SystemStatus hasKey={!!apiKey} /></div>
          <div className="text-right font-mono flex-shrink-0">
            <div className="text-xl font-bold text-hud-cyan tracking-widest" style={{ textShadow: "0 0 8px rgba(0,212,255,0.6)" }}>{time}</div>
            <div className="text-[10px] text-hud-muted tracking-wider">{date}</div>
          </div>
        </div>
        <div className="px-4 py-1.5 flex items-center gap-6 text-[10px] font-mono text-hud-muted/60 border-t border-hud-cyan/10 bg-black/20">
          <Activity size={10} className="text-hud-cyan/40" />
          <span>SYS: <span className="text-green-400">NOMINAL</span></span>
          <span>CORE TEMP: <span className="text-hud-cyan">98.6°F</span></span>
          <span>SHIELD: <span className="text-hud-orange">ACTIVE</span></span>
          <span>AI MODEL: <span className="text-hud-cyan">CLAUDE SONNET 4-6</span></span>
          <span className="ml-auto text-hud-muted/40">STARK INDUSTRIES © 2025</span>
        </div>
      </header>

      <div className="relative z-10 flex flex-1 overflow-hidden">
        <aside className="w-14 lg:w-24 flex-shrink-0 border-r border-hud-cyan/20 bg-black/30 backdrop-blur-sm flex flex-col">
          {tabs.map((tab) => (
            <SidebarTab key={tab.id} tab={tab} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
          ))}
          <div className="mt-auto p-3 text-center opacity-30">
            <div className="w-full h-px bg-hud-cyan/30 mb-3" />
            <svg viewBox="0 0 40 40" className="w-8 h-8 mx-auto">
              <circle cx="20" cy="20" r="16" stroke="#00d4ff" strokeWidth="0.5" fill="none" strokeDasharray="2 4" className="animate-rotate-slow" style={{ transformOrigin: "20px 20px" }} />
              <circle cx="20" cy="20" r="3" fill="#00d4ff" fillOpacity="0.5" />
            </svg>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-2 border-b border-hud-cyan/20 bg-black/20 backdrop-blur-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-hud-cyan" style={{ boxShadow: "0 0 6px rgba(0,212,255,0.8)", animation: "pulse-glow 2s ease-in-out infinite" }} />
              <span className="text-xs font-mono text-hud-cyan tracking-widest">
                {tabs.find((t) => t.id === activeTab)?.label} — MODULE ACTIVE
              </span>
            </div>
            <div className="flex items-center gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 text-[10px] font-mono rounded tracking-wider transition-all ${
                    activeTab === tab.id
                      ? "bg-hud-cyan/10 text-hud-cyan border border-hud-cyan/40"
                      : "text-hud-muted hover:text-hud-cyan/70 border border-transparent"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-hidden hud-panel m-2 rounded relative">
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-hud-cyan/50 pointer-events-none" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-hud-cyan/50 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-hud-cyan/50 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-hud-cyan/50 pointer-events-none" />
            <div className="h-full flex flex-col overflow-hidden">
              {activeTab === "chat" && <ChatPanel apiKey={apiKey} onNeedApiKey={handleNeedApiKey} />}
              {activeTab === "tasks" && <TaskPanel />}
              {activeTab === "search" && <SearchPanel />}
              {activeTab === "settings" && <SettingsPanel apiKey={apiKey} onSave={handleSaveKey} />}
            </div>
          </div>
        </main>
      </div>

      <footer className="relative z-10 border-t border-hud-cyan/20 bg-black/40 backdrop-blur-sm px-4 py-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-hud-muted/50">
          <span>MARK 85 — EMERGENCY OVERRIDE: INITIATE</span>
          <span>SECURE CHANNEL ACTIVE — AES-256 ENCRYPTED</span>
          <span>POWERED BY ANTHROPIC CLAUDE</span>
        </div>
      </footer>
    </div>
  );
}
