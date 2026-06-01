"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, MicOff } from "lucide-react";

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
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

export default function VoiceButton({ onTranscript, disabled }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  const startListening = useCallback(() => {
    const SpeechRecognitionCtor =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    if (!SpeechRecognitionCtor) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: { error: string }) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [onTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  if (!isSupported) {
    return (
      <button disabled className="p-2 rounded opacity-30 cursor-not-allowed border border-hud-muted text-hud-muted" title="Voice input not supported">
        <MicOff size={18} />
      </button>
    );
  }

  return (
    <button
      onClick={isListening ? stopListening : startListening}
      disabled={disabled}
      title={isListening ? "Stop listening" : "Start voice input"}
      className={`relative p-2 rounded transition-all duration-200 border disabled:opacity-40 disabled:cursor-not-allowed ${
        isListening
          ? "border-hud-orange text-hud-orange bg-orange-900/20"
          : "border-hud-cyan text-hud-cyan bg-cyan-900/10 hover:bg-cyan-900/20"
      }`}
    >
      {isListening ? (
        <>
          <Mic size={18} className="animate-pulse" />
          <span className="absolute inset-0 rounded animate-ping border border-hud-orange opacity-30" />
        </>
      ) : (
        <Mic size={18} />
      )}
    </button>
  );
}

export function speakText(text: string, rate = 1.0, pitch = 0.9) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = 0.9;
  const voices = window.speechSynthesis.getVoices();
  const britishVoice = voices.find(
    (v) => v.lang.includes("en-GB") || v.name.toLowerCase().includes("british") || v.name.toLowerCase().includes("daniel")
  );
  if (britishVoice) utterance.voice = britishVoice;
  window.speechSynthesis.speak(utterance);
}
