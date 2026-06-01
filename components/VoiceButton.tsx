"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, MicOff } from "lucide-react";

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

// Extend window for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function VoiceButton({ onTranscript, disabled }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <button
        disabled
        className="p-2 rounded opacity-30 cursor-not-allowed border border-hud-muted text-hud-muted"
        title="Voice input not supported in this browser"
      >
        <MicOff size={18} />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      title={isListening ? "Stop listening" : "Start voice input"}
      className={`
        relative p-2 rounded transition-all duration-200 font-mono text-sm
        ${isListening
          ? "border-hud-orange text-hud-orange bg-orange-900/20 mic-listening"
          : "border-hud-cyan text-hud-cyan bg-cyan-900/10 hover:bg-cyan-900/20"
        }
        border disabled:opacity-40 disabled:cursor-not-allowed
      `}
    >
      {isListening ? (
        <>
          <Mic size={18} className="animate-pulse" />
          {/* Ripple rings */}
          <span className="absolute inset-0 rounded animate-ping border border-hud-orange opacity-30" />
        </>
      ) : (
        <Mic size={18} />
      )}
    </button>
  );
}

// Utility: speak text using SpeechSynthesis
export function speakText(text: string, rate = 1.0, pitch = 0.9) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = 0.9;

  // Try to find a British English voice
  const voices = window.speechSynthesis.getVoices();
  const britishVoice = voices.find(
    (v) =>
      v.lang.includes("en-GB") ||
      v.name.toLowerCase().includes("british") ||
      v.name.toLowerCase().includes("daniel")
  );

  if (britishVoice) {
    utterance.voice = britishVoice;
  }

  window.speechSynthesis.speak(utterance);
}
