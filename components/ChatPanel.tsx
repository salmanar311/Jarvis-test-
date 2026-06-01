"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Volume2, VolumeX, Trash2 } from "lucide-react";
import VoiceButton, { speakText } from "./VoiceButton";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPanel() {
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const messageText = text || input.trim();
      if (!messageText || isLoading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: messageText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      // Prepare history for API (exclude welcome message if it's the default)
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const assistantMessageId = `assistant-${Date.now()}`;

      // Add empty assistant message to stream into
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
        },
      ]);

      try {
        abortRef.current = new AbortController();

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            userMessage: messageText,
          }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let fullResponse = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId
                ? { ...m, content: fullResponse }
                : m
            )
          );
        }

        // Speak the response if voice is enabled
        if (voiceEnabled && fullResponse) {
          // Strip markdown for speech
          const cleanText = fullResponse
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .replace(/\*(.*?)\*/g, "$1")
            .replace(/`(.*?)`/g, "$1")
            .replace(/#{1,6}\s/g, "")
            .trim();
          speakText(cleanText);
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Chat error:", error);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId
                ? {
                    ...m,
                    content:
                      "I apologise, Sir. I encountered an error processing your request. Please verify the API configuration and try again.",
                  }
                : m
            )
          );
        }
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [input, isLoading, messages, voiceEnabled]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearMessages = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setMessages([
      {
        id: "welcome-new",
        role: "assistant",
        content:
          "Memory cleared. All previous conversation data has been purged from active memory. How may I assist you, Sir?",
        timestamp: new Date(),
      },
    ]);
    setIsLoading(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-hud-cyan/20">
        <div className="flex items-center gap-2">
          <span className="text-xs text-hud-muted">
            NEURAL LINK ACTIVE —{" "}
          </span>
          <span className="text-xs text-hud-cyan">
            {messages.length - 1} EXCHANGES
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceEnabled((v) => !v)}
            className={`p-1.5 rounded transition-all text-xs border ${
              voiceEnabled
                ? "border-hud-cyan text-hud-cyan bg-cyan-900/20"
                : "border-hud-muted/30 text-hud-muted hover:border-hud-cyan/50 hover:text-hud-cyan/70"
            }`}
            title={voiceEnabled ? "Disable voice output" : "Enable voice output"}
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col animate-fade-in-up ${
              message.role === "user" ? "items-end" : "items-start"
            }`}
          >
            {/* Label */}
            <div
              className={`text-[10px] mb-1 font-mono tracking-widest ${
                message.role === "user"
                  ? "text-hud-orange/70"
                  : "text-hud-cyan/70"
              }`}
            >
              {message.role === "user" ? "YOU" : "JARVIS"} —{" "}
              {formatTime(message.timestamp)}
            </div>

            {/* Message bubble */}
            <div
              className={`max-w-[85%] px-4 py-3 rounded text-sm leading-relaxed relative ${
                message.role === "user"
                  ? "bg-orange-900/20 border border-hud-orange/40 text-hud-text"
                  : "bg-cyan-900/10 border border-hud-cyan/30 text-hud-text"
              }`}
              style={
                message.role === "user"
                  ? { boxShadow: "0 0 10px rgba(255,102,0,0.1)" }
                  : { boxShadow: "0 0 10px rgba(0,212,255,0.1)" }
              }
            >
              {message.role === "assistant" && (
                <span className="text-hud-cyan font-bold mr-2 text-xs tracking-wider">
                  JARVIS:
                </span>
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

      {/* Input area */}
      <div className="border-t border-hud-cyan/20 p-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter command or query... (Enter to send, Shift+Enter for newline)"
              disabled={isLoading}
              rows={1}
              className="w-full hud-input rounded px-3 py-2 text-sm text-hud-text bg-hud-dark/60 border border-hud-cyan/20 resize-none placeholder-hud-muted/50 font-mono transition-all focus:outline-none focus:border-hud-cyan/60 focus:shadow-[0_0_10px_rgba(0,212,255,0.2)] disabled:opacity-50"
              style={{ minHeight: "42px", maxHeight: "120px" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
              }}
            />
          </div>

          <VoiceButton
            onTranscript={(text) => {
              setInput((prev) => prev ? `${prev} ${text}` : text);
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
          ENCRYPTED CHANNEL • CLAUDE SONNET 4-6 • STREAMING MODE
        </div>
      </div>
    </div>
  );
}
