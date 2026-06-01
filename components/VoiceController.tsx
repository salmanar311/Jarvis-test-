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
    listening: "border-orange-500 text-orange-400 bg-orange-900/20 mic-listening",
    thinking: "border-yellow-500 text-yellow-400 bg-yellow-900/10",
    speaking: "border-cyan-400 text-cyan-300 bg-cyan-900/20",
  }[hudState];

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={isActive ? stopListening : startListening}
        disabled={isDisabled}
        className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${buttonColor}`}
        style={
          hudState === "listening"
            ? { boxShadow: "0 0 20px rgba(255,102,0,0.6), 0 0 40px rgba(255,102,0,0.3)" }
            : hudState === "speaking"
            ? { boxShadow: "0 0 20px rgba(0,212,255,0.6), 0 0 40px rgba(0,212,255,0.3)" }
            : {}
        }
      >
        <Mic size={28} className={hudState === "listening" ? "animate-pulse" : ""} />
      </button>
      <div
        className={`text-xs tracking-[0.3em] font-mono font-bold transition-colors duration-300 ${
          hudState === "listening"
            ? "text-orange-400"
            : hudState === "thinking"
            ? "text-yellow-400"
            : hudState === "speaking"
            ? "text-cyan-300"
            : "text-cyan-600"
        }`}
      >
        {stateLabel}
      </div>
      {!speechSupported && (
        <div className="text-xs text-red-400 tracking-wider">VOICE UNSUPPORTED</div>
      )}
    </div>
  );
}
