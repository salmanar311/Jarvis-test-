"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Volume2, VolumeX, Trash2, KeyRound } from "lucide-react";
import VoiceButton, { speakText } from "./VoiceButton";
import { streamJarvisResponse, ChatMessage } from "@/lib/jarvis-ai";
import { speakWithElevenLabs } from "@/lib/elevenlabs";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  apiKey: string;
  elevenLabsKey: string;
  onNeedApiKey: () => void;
}

export default function ChatPanel({ apiKey, elevenLabsKey, onNeedApiKey }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Good day. All systems are online and fully operational. I am J.A.R.V.I.S. — how may I assist you today, Sir?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const messageText = text || input.trim();
      if (!messageText || isLoading) return;

      if (!apiKey) {
        onNeedApiKey();
        return;
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: messageText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      const history: ChatMessage[] = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const assistantId = `assistant-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", timestamp: new Date() },
      ]);

      let fullResponse = "";

      try {
        await streamJarvisResponse(history, messageText, apiKey, (chunk) => {
          fullResponse += chunk;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: fullResponse } : m))
          );
        });

        if (voiceEnabled && fullResponse) {
          const clean = fullResponse
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .replace(/\*(.*?)\*/g, "$1")
            .replace(/`(.*?)`/g, "$1")
            .replace(/#{1,6}\s/g, "")
            .trim();
          if (elevenLabsKey) {
            speakWithElevenLabs(clean, elevenLabsKey).catch(() => speakText(clean));
          } else {
            speakText(clean);
          }
        }
      } catch (error: unknown) {
        const msg =
          error instanceof Error ? error.message : "Unknown error";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: `I apologise, Sir. Encountered an error: ${msg}. Please verify your API key in Settings.`,
                }
              : m
          )
        );
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [input, isLoading, messages, voiceEnabled, apiKey, onNeedApiKey]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearMessages = () => {
    setMessages([
      {
        id: "welcome-new",
        role: "assistant",
        content:
          "Memory cleared. All previous conversation data has been purged. How may I assist you, Sir?",
        timestamp: new Date(),
      },
    ]);
    setIsLoading(false);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-hud-cyan/20">
        <div className="flex items-center gap-2">
          <span className="text-xs text-hud-muted">NEURAL LINK ACTIVE — </span>
          <span className="text-xs text-hud-cyan">{messages.length - 1} EXCHANGES</span>
        </div>
        <div className="flex items-center gap-2">
          {!apiKey && (
            <button
              onClick={onNeedApiKey}
              className="p-1.5 rounded border border-hud-orange/50 text-hud-orange hover:bg-orange-900/20 transition-all text-xs flex items-center gap-1"
              title="Set API key"
            >
              <KeyRound size={13} />
              <span className="text-[10px]">SET KEY</span>
            </button>
          )}
          <button
            onClick={() => setVoiceEnabled((v) => !v)}
            className={`p-1.5 rounded transition-all text-xs border ${
              voiceEnabled
                ? "border-hud-cyan text-hud-cyan bg-cyan-900/20"
                : "border-hud-muted/30 text-hud-muted hover:border-hud-cyan/50"
            }`}
            title={voiceEnabled ? "Disable voice" : "Enable voice"}
          >
            {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
          <button
            onClick={clearMessages}
            className="p-1.5 rounded transition-all text-xs border border-hud-muted/30 text-hud-muted hover:border-red-500/50 hover:text-red-400"
            title="Clear conversation"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col animate-fade-in-up ${message.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`text-[10px] mb-1 font-mono tracking-widest ${
                message.role === "user" ? "text-hud-orange/70" : "text-hud-cyan/70"
              }`}
            >
              {message.role === "user" ? "YOU" : "JARVIS"} — {formatTime(message.timestamp)}
            </div>
            <div
              className={`max-w-[85%] px-4 py-3 rounded text-sm leading-relaxed ${
                message.role === "user"
                  ? "bg-orange-900/20 border border-hud-orange/40"
                  : "bg-cyan-900/10 border border-hud-cyan/30"
              }`}
              style={
                message.role === "user"
                  ? { boxShadow: "0 0 10px rgba(255,102,0,0.1)" }
                  : { boxShadow: "0 0 10px rgba(0,212,255,0.1)" }
              }
            >
              {message.role === "assistant" && (
                <span className="text-hud-cyan font-bold mr-2 text-xs tracking-wider">JARVIS:</span>
              )}
              {message.content === "" && isLoading ? (
                <span className="inline-flex items-center gap-1">
                  <span className="text-hud-muted text-xs mr-2">Processing</span>
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </span>
              ) : (
                <span className="whitespace-pre-wrap">{message.content}</span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-hud-cyan/20 p-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={apiKey ? "Enter command or query... (Enter to send)" : "Set your API key first..."}
              disabled={isLoading}
              rows={1}
              className="w-full hud-input rounded px-3 py-2 text-sm text-hud-text bg-hud-dark/60 border border-hud-cyan/20 resize-none placeholder-hud-muted/50 font-mono transition-all focus:outline-none focus:border-hud-cyan/60 focus:shadow-[0_0_10px_rgba(0,212,255,0.2)] disabled:opacity-50"
              style={{ minHeight: "42px", maxHeight: "120px" }}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "auto";
                t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
              }}
            />
          </div>
          <VoiceButton
            onTranscript={(text) => {
              setInput((prev) => (prev ? `${prev} ${text}` : text));
              inputRef.current?.focus();
            }}
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            className="hud-btn p-2 rounded disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-sm px-3"
          >
            <Send size={16} />
            <span className="hidden sm:inline text-xs">SEND</span>
          </button>
        </div>
        <div className="mt-1 text-[10px] text-hud-muted/50 font-mono">
          {apiKey ? "ENCRYPTED CHANNEL • CLAUDE SONNET 4-6 • STREAMING MODE" : "⚠ API KEY REQUIRED — CLICK 'SET KEY' ABOVE"}
        </div>
      </div>
    </div>
  );
}
