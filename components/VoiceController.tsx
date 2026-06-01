"use client";

import React, { useState, useRef, useCallback } from "react";
import { Mic } from "lucide-react";
import { streamJarvisResponse, ChatMessage } from "@/lib/jarvis-ai";
import { speakWithElevenLabs } from "@/lib/elevenlabs";

type HUDState = "idle" | "listening" | "thinking" | "speaking";

interface VoiceControllerProps {
  apiKey: string;
  elevenLabsKey: string;
  hudState: HUDState;
  setHudState: (s: HUDState) => void;
  setLastTranscript: (t: string) => void;
  setLastResponse: (r: string) => void;
  appendResponse: (chunk: string) => void;
  conversationHistory: ChatMessage[];
  setConversationHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onNeedApiKey: () => void;
}

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

interface ISpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

function browserSpeak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 0.85;
    utterance.volume = 0.9;
    const voices = window.speechSynthesis.getVoices();
    const britishVoice = voices.find(
      (v) => v.lang.includes("en-GB") || v.name.toLowerCase().includes("daniel")
    );
    if (britishVoice) utterance.voice = britishVoice;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

export default function VoiceController({
  apiKey,
  elevenLabsKey,
  hudState,
  setHudState,
  setLastTranscript,
  setLastResponse,
  appendResponse,
  conversationHistory,
  setConversationHistory,
  onNeedApiKey,
}: VoiceControllerProps) {
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const [speechSupported] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  });

  const handleTranscript = useCallback(
    async (transcript: string) => {
      if (!transcript.trim()) return;

      if (!apiKey) {
        onNeedApiKey();
        return;
      }

      setLastTranscript(transcript);
      setLastResponse("");
      setHudState("thinking");

      let fullResponse = "";

      try {
        await streamJarvisResponse(
          conversationHistory,
          transcript,
          apiKey,
          (chunk) => {
            fullResponse += chunk;
            appendResponse(chunk);
          }
        );

        setConversationHistory((prev) => [
          ...prev,
          { role: "user", content: transcript },
          { role: "assistant", content: fullResponse },
        ]);

        setHudState("speaking");

        if (elevenLabsKey) {
          try {
            await speakWithElevenLabs(fullResponse, elevenLabsKey);
          } catch {
            await browserSpeak(fullResponse);
          }
        } else {
          await browserSpeak(fullResponse);
        }
      } catch (err) {
        console.error("Jarvis error:", err);
        setLastResponse("I'm afraid I encountered an error, sir.");
      } finally {
        setHudState("idle");
      }
    },
    [apiKey, elevenLabsKey, conversationHistory, setConversationHistory, setHudState, setLastTranscript, setLastResponse, appendResponse, onNeedApiKey]
  );

  const startListening = useCallback(() => {
    if (!speechSupported) return;
    const SpeechRecognitionCtor =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setHudState("listening");

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      handleTranscript(transcript);
    };

    recognition.onerror = () => {
      setHudState("idle");
    };

    recognition.onend = () => {
      if (hudState === "listening") setHudState("idle");
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [speechSupported, handleTranscript, hudState, setHudState]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setHudState("idle");
  }, [setHudState]);

  const stateLabel = {
    idle: "TAP TO SPEAK",
    listening: "LISTENING...",
    thinking: "PROCESSING...",
    speaking: "SPEAKING...",
  }[hudState];

  const isActive = hudState === "listening";
  const isDisabled = hudState === "thinking" || hudState === "speaking";

  const buttonColor = {
    idle: "border-cyan-500 text-cyan-400 bg-cyan-900/10 hover:bg-cyan-900/30 hover:border-cyan-400",
    listening: "border-cyan-400 text-cyan-300 bg-cyan-900/20 mic-listening",
    thinking: "border-cyan-600 text-cyan-500 bg-cyan-900/10",
    speaking: "border-cyan-400 text-cyan-300 bg-cyan-900/20",
  }[hudState];

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={isActive ? stopListening : startListening}
        disabled={isDisabled}
        className="flex items-center gap-2 px-5 py-2 border border-cyan-500/50 rounded font-mono text-xs tracking-widest transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        style={
          hudState === "listening"
            ? { color: '#00d4ff', borderColor: '#00d4ff', boxShadow: '0 0 12px rgba(0,212,255,0.4)', background: 'rgba(0,212,255,0.08)' }
            : hudState === "speaking"
            ? { color: '#00aad4', borderColor: 'rgba(0,212,255,0.4)', background: 'rgba(0,212,255,0.05)' }
            : { color: 'rgba(0,212,255,0.6)', background: 'rgba(0,212,255,0.03)' }
        }
      >
        <Mic size={13} className={hudState === "listening" ? "animate-pulse" : ""} />
        <span>{stateLabel}</span>
      </button>
      {!speechSupported && (
        <div className="text-[10px] text-red-400/60 tracking-wider font-mono">VOICE UNSUPPORTED IN THIS BROWSER</div>
      )}
    </div>
  );
}
