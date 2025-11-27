"use client";

import { UIMessage } from "ai";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type TalkingPanditProps = {
  messages: UIMessage[];
  sendMessage: (args: { text: string }) => void;
  enabled?: boolean; // controlled from page.tsx toggle
  language?: "en" | "hi" | "gu";
};

// -------- Helper: extract text from AI message --------
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

// -------- Avatar component (expressive Pandit) --------

type PanditAvatarProps = {
  listening: boolean;
  speaking: boolean;
};

function PanditAvatar({ listening, speaking }: PanditAvatarProps) {
  const [mouthOpen, setMouthOpen] = useState(false);

  // simple mouth animation while speaking
  useEffect(() => {
    if (!speaking) {
      setMouthOpen(false);
      return;
    }
    const id = setInterval(() => {
      setMouthOpen((m) => !m);
    }, 160);
    return () => clearInterval(id);
  }, [speaking]);

  const halo =
    listening || speaking ? "ring-2 ring-orange-400 shadow-lg" : "ring-0";

  // eye style changes a bit when listening
  const eyeHeight = listening ? 6 : 4;
  const eyeTop = listening ? 14 : 16;

  return (
    <div
      className={`relative flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 ${halo}`}
    >
      {/* Face circle */}
      <div className="relative h-12 w-12 rounded-full bg-[#ffe0c2] shadow-inner">
        {/* Turban / headcloth */}
        <div className="absolute inset-x-0 top-0 h-5 rounded-t-full bg-orange-500" />
        <div className="absolute left-1/2 top-4 h-3 w-3 -translate-x-1/2 rounded-full bg-white/80" />
        <div className="absolute left-1/2 top-5 h-1 w-2 -translate-x-1/2 rounded-full bg-red-500" />

        {/* Ears */}
        <div className="absolute -left-1 top-6 h-4 w-3 rounded-full bg-[#ffd3aa]" />
        <div className="absolute -right-1 top-6 h-4 w-3 rounded-full bg-[#ffd3aa]" />

        {/* Eyes */}
        <div className="absolute left-1/2 top-0 flex w-full justify-between px-3">
          <div
            style={{ marginTop: eyeTop, height: eyeHeight }}
            className="w-3 rounded-full bg-[#303030]"
          />
          <div
            style={{ marginTop: eyeTop, height: eyeHeight }}
            className="w-3 rounded-full bg-[#303030]"
          />
        </div>

        {/* Brows */}
        <div className="absolute left-1/2 top-0 flex w-full justify-between px-3">
          <div className="mt-10 h-1 w-4 rounded-full bg-[#8b4f2c]" />
          <div className="mt-10 h-1 w-4 rounded-full bg-[#8b4f2c]" />
        </div>

        {/* Mustache */}
        <div className="absolute left-1/2 top-0 flex w-full justify-center">
          <div className="mt-[34px] h-2 w-10 rounded-full bg-[#5c3924]" />
        </div>

        {/* Mouth */}
        <div className="absolute left-1/2 top-0 flex w-full justify-center">
          <div
            className="mt-[38px] rounded-full bg-[#8b3a2a] transition-all"
            style={{
              width: mouthOpen ? 26 : 18,
              height: mouthOpen ? 10 : 4,
            }}
          />
        </div>

        {/* Beard / chin */}
        <div className="absolute inset-x-2 bottom-0 h-4 rounded-b-full bg-[#f7d2aa]/80" />
      </div>
    </div>
  );
}

// -------- Main TalkingPandit widget (voice STT/TTS + avatar) --------

export function TalkingPandit({
  messages,
  sendMessage,
  enabled = true,
  language = "en",
}: TalkingPanditProps) {
  const [isClient, setIsClient] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastSpokenId, setLastSpokenId] = useState<string | null>(null);

  const recognitionRef = useRef<any | null>(null);

  // Init STT on client
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

    const recognition = new SpeechRecognition() as any;
    // basic language mapping
    recognition.lang =
      language === "hi"
        ? "hi-IN"
        : language === "gu"
        ? "gu-IN"
        : "en-IN";

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

  const startListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert(
        "Voice input is not supported in this browser. Try Chrome on desktop or Android."
      );
      return;
    }
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
    } catch {}
    setIsListening(false);
  };

  // Speak new assistant messages with TTS
  useEffect(() => {
    if (!isClient || !ttsEnabled || !enabled) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.role !== "assistant") return;
    if (last.id === lastSpokenId) return;

    const text = extractTextFromMessage(last);
    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);

    // TTS language mapping (browsers' support varies)
    utterance.lang =
      language === "hi"
        ? "hi-IN"
        : language === "gu"
        ? "gu-IN"
        : "en-IN";

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setLastSpokenId(last.id);
  }, [messages, isClient, ttsEnabled, enabled, lastSpokenId, language]);

  if (!isClient || !enabled) return null;

  return (
    <div className="fixed bottom-24 right-4 z-40">
      <div className="rounded-3xl border border-orange-100 bg-white/95 shadow-lg px-3 py-2 flex items-center gap-3">
        {/* Pandit Avatar with expressions */}
        <PanditAvatar listening={isListening} speaking={isSpeaking} />

        {/* Text */}
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-slate-900">
            Talk to Panditji
          </span>
          <span className="text-[10px] text-slate-500">
            {speechSupported
              ? isListening
                ? "Listening… speak now."
                : "Tap mic and ask your question."
              : "Voice not supported on this browser."}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          {/* Mic */}
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            disabled={!speechSupported}
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-white text-xs ${
              isListening
                ? "border-orange-400 bg-orange-500"
                : "border-orange-200 bg-orange-400/90 hover:bg-orange-500"
            }`}
            title={isListening ? "Stop listening" : "Start listening"}
          >
            {isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
          </button>

          {/* Speaker toggle */}
          <button
            type="button"
            onClick={() => setTtsEnabled((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 text-xs hover:bg-slate-50"
            title={ttsEnabled ? "Mute pandit voice" : "Unmute pandit voice"}
          >
            {ttsEnabled ? (
              <Volume2 className="h-3 w-3" />
            ) : (
              <VolumeX className="h-3 w-3" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TalkingPandit;
