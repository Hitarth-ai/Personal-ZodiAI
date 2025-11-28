"use client";

import Image from "next/image";
import { UIMessage } from "ai";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type VoiceLanguage = "en" | "hi" | "gu" | "hinglish";

type TalkingPanditProps = {
  messages: UIMessage[];
  sendMessage: (args: { text: string }) => void;
  enabled?: boolean;
  language?: VoiceLanguage;
  /** true while the LLM is still generating the answer */
  isStreaming?: boolean;
};

// ---------- helpers ----------

function extractTextFromMessage(message: UIMessage): string {
  const anyMsg: any = message;
  if (typeof anyMsg.text === "string") return anyMsg.text;
  if (typeof anyMsg.content === "string") return anyMsg.content;
  if (Array.isArray(anyMsg.parts)) {
    return anyMsg.parts
      .map((p: any) => {
        if (typeof p === "string") return p;
        if (typeof p.text === "string") return p.text;
        return "";
      })
      .join(" ");
  }
  return "";
}

// short conversational summary for TTS
function getSpokenSummary(fullText: string): string {
  if (!fullText) return "";

  // basic sentence split
  const sentences = fullText.split(/(?<=[.!?])\s+/);
  const short = sentences.slice(0, 2).join(" "); // first 2 sentences

  const trimmed = short.length > 260 ? short.slice(0, 257) + "..." : short;

  // make it feel like a spoken reply but without extra filler
  return trimmed;
}

// For now use Indian English for all – your content is mostly English/Hinglish
function localeFor(_language: VoiceLanguage): string {
  return "en-IN";
}

// ---------- avatar ----------

function PanditAvatar({
  listening,
  speaking,
}: {
  listening: boolean;
  speaking: boolean;
}) {
  const active = listening || speaking;

  return (
    <div className="relative h-14 w-14 flex-shrink-0">
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-br from-orange-200 to-orange-50 shadow-lg transition ${active ? "scale-105" : "scale-100"
          }`}
      />
      <div
        className={`absolute inset-1 rounded-full bg-white transition ${active ? "ring-2 ring-orange-400" : "ring-0"
          }`}
      />
      <Image
        src={speaking ? "/pandit-talk.gif" : "/Pandit.png"}
        alt="ZodiAI Panditji"
        width={56}
        height={56}
        className={`relative h-14 w-14 rounded-full object-cover transition`}
      />
    </div>
  );
}

// ---------- main widget ----------

export function TalkingPandit({
  messages,
  sendMessage,
  enabled = true,
  language = "en",
  isStreaming = false,
  className,
}: TalkingPanditProps & { className?: string }) {
  const [isClient, setIsClient] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastSpokenId, setLastSpokenId] = useState<string | null>(null);
  const [hasIntroduced, setHasIntroduced] = useState(false);

  const recognitionRef = useRef<any | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // ---------- init STT ----------

  useEffect(() => {
    setIsClient(true);
    if (typeof window === "undefined") return;

    const win = window as any;
    const SpeechRecognition =
      win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = localeFor(language);
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript && transcript.trim()) {
        sendMessage({ text: transcript.trim() });
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setSpeechSupported(true);
  }, [sendMessage, language]);

  // ---------- helpers to stop TTS completely ----------

  const hardStopSpeaking = () => {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsSpeaking(false);
  };

  // stop speech whenever widget is disabled
  useEffect(() => {
    if (!isClient) return;
    if (!enabled) {
      hardStopSpeaking();
      try {
        recognitionRef.current?.stop();
      } catch { }
      setIsListening(false);
    }
  }, [enabled, isClient]);

  // stop speech when TTS is toggled off
  useEffect(() => {
    if (!isClient) return;
    if (!ttsEnabled) {
      hardStopSpeaking();
    }
  }, [ttsEnabled, isClient]);

  // ---------- mic handlers ----------

  const startListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert(
        "Voice input is not supported in this browser. Try Chrome on desktop or Android."
      );
      return;
    }
    // if pandit is speaking, stop and start listening
    hardStopSpeaking();

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.error("Error starting recognition", err);
    }
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
    } catch { }
    setIsListening(false);
  };

  // ---------- intro line (once) ----------

  useEffect(() => {
    if (!isClient || !enabled || hasIntroduced) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const intro =
      language === "gu"
        ? "Kem cho beta? I am ZodiAI, tamaro AI pandit. Shu puchvu chho?"
        : language === "hi" || language === "hinglish"
          ? "Namaste beta, main ZodiAI hoon, tumhara AI Pandit. Bolo beta, kya puchna hai?"
          : "Hello beta, I'm ZodiAI, your AI Pandit. Tell me, what's your question?";

    const utterance = new SpeechSynthesisUtterance(intro);
    utterance.lang = localeFor(language);

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    hardStopSpeaking();
    window.speechSynthesis.speak(utterance);
    utteranceRef.current = utterance;
    setHasIntroduced(true);
  }, [enabled, isClient, language, hasIntroduced]);

  // ---------- speak summary of new assistant messages ----------

  useEffect(() => {
    if (!isClient || !ttsEnabled || !enabled) return;
    if (isStreaming) return; // wait until answer finished streaming
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (messages.length === 0) return;

    const last = messages[messages.length - 1];
    if (last.role !== "assistant") return;
    if (last.id === lastSpokenId) return;

    const fullText = extractTextFromMessage(last);
    if (!fullText.trim()) return;

    const spokenText = getSpokenSummary(fullText);
    if (!spokenText.trim()) return;

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = localeFor(language);

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    hardStopSpeaking();
    window.speechSynthesis.speak(utterance);
    utteranceRef.current = utterance;
    setLastSpokenId(last.id);
  }, [
    messages,
    isClient,
    ttsEnabled,
    enabled,
    lastSpokenId,
    language,
    isStreaming,
  ]);

  if (!isClient || !enabled) return null;

  const subtitle = isListening
    ? "Listening… bolo beta."
    : "Tap mic and ask.";

  return (
    <div className={className}>
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-orange-100 bg-white/95 px-4 py-4 shadow-sm">
        <PanditAvatar listening={isListening} speaking={isSpeaking} />

        <div className="flex flex-col text-center">
          <span className="text-sm font-semibold text-slate-900">
            Talk to Panditji
          </span>
          <span className="text-[11px] text-slate-500">{subtitle}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* mic */}
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            disabled={!speechSupported}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md transition ${isListening
              ? "bg-orange-500 animate-pulse"
              : "bg-orange-400 hover:bg-orange-500"
              }`}
            title={isListening ? "Stop listening" : "Start listening"}
          >
            {isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>

          {/* speaker toggle */}
          <button
            type="button"
            onClick={() => setTtsEnabled((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            title={ttsEnabled ? "Mute Pandit voice" : "Unmute Pandit voice"}
          >
            {ttsEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TalkingPandit;
