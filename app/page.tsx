"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
import {
  ArrowUp,
  Loader2,
  Plus,
  Square,
  Sparkles,
  Briefcase,
  Heart,
  CalendarDays,
} from "lucide-react";
import { MessageWall } from "@/components/messages/message-wall";
import { ChatHeader } from "@/app/parts/chat-header";
import { ChatHeaderBlock } from "@/app/parts/chat-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UIMessage } from "ai";
import { useEffect, useState, useRef, FormEvent } from "react";
import {
  AI_NAME,
  CLEAR_CHAT_TEXT,
  OWNER_NAME,
  WELCOME_MESSAGE,
} from "@/config";
import Image from "next/image";
import Link from "next/link";

const formSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty.")
    .max(4000, "Message must be at most 4000 characters."),
});

const STORAGE_KEY = "chat-messages";

type StorageData = {
  messages: UIMessage[];
  durations: Record<string, number>;
};

type BirthDetails = {
  name: string;
  day: string;
  month: string;
  year: string;
  hour: string;
  minute: string;
  place: string;
};

const loadMessagesFromStorage = (): StorageData => {
  if (typeof window === "undefined") return { messages: [], durations: {} };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { messages: [], durations: {} };
    const parsed = JSON.parse(stored);
    return {
      messages: parsed.messages || [],
      durations: parsed.durations || {},
    };
  } catch (error) {
    console.error("Failed to load messages from localStorage:", error);
    return { messages: [], durations: {} };
  }
};

const saveMessagesToStorage = (
  messages: UIMessage[],
  durations: Record<string, number>
) => {
  if (typeof window === "undefined") return;
  try {
    const data: StorageData = { messages, durations };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save messages to localStorage:", error);
  }
};

export default function Chat() {
  const [isClient, setIsClient] = useState(false);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    name: "",
    day: "",
    month: "",
    year: "",
    hour: "",
    minute: "",
    place: "",
  });

  const welcomeMessageShownRef = useRef<boolean>(false);

  const stored =
    typeof window !== "undefined"
      ? loadMessagesFromStorage()
      : { messages: [], durations: {} };
  const [initialMessages] = useState<UIMessage[]>(stored.messages);

  const { messages, sendMessage, status, stop, setMessages } = useChat({
    messages: initialMessages,
  });

  useEffect(() => {
    setIsClient(true);
    setDurations(stored.durations);
    setMessages(stored.messages);
  }, []);

  useEffect(() => {
    if (isClient) {
      saveMessagesToStorage(messages, durations);
    }
  }, [durations, messages, isClient]);

  const handleDurationChange = (key: string, duration: number) => {
    setDurations((prevDurations) => {
      const newDurations = { ...prevDurations };
      newDurations[key] = duration;
      return newDurations;
    });
  };

  useEffect(() => {
    if (
      isClient &&
      initialMessages.length === 0 &&
      !welcomeMessageShownRef.current
    ) {
      const welcomeMessage: UIMessage = {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        parts: [
          {
            type: "text",
            text: WELCOME_MESSAGE,
          },
        ],
      };
      setMessages([welcomeMessage]);
      saveMessagesToStorage([welcomeMessage], {});
      welcomeMessageShownRef.current = true;
    }
  }, [isClient, initialMessages.length, setMessages]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    sendMessage({ text: data.message });
    form.reset();
  }

  function clearChat() {
    const newMessages: UIMessage[] = [];
    const newDurations: Record<string, number> = {};
    setMessages(newMessages);
    setDurations(newDurations);
    saveMessagesToStorage(newMessages, newDurations);
    toast.success("Chat cleared");
  }

  function handleBirthSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { name, day, month, year, hour, minute, place } = birthDetails;

    if (!name || !day || !month || !year || !place) {
      toast.error("Please fill at least name, date of birth, and place.");
      return;
    }

    const safeHour = hour || "12";
    const safeMinute = minute || "00";

    const text = `My name is ${name}. My date of birth is ${day}-${month}-${year} at ${safeHour}:${safeMinute} (approx). I was born in ${place}. Please use Vedic astrology to interpret my chart and give me an initial overview, then show me a menu of what ZodiAI can help me with.`;

    sendMessage({ text });
  }

  const quickQuestions = [
    {
      label: "Personality & strengths",
      icon: <Sparkles className="h-3.5 w-3.5 mr-1.5" />,
      text: "Give me a detailed personality and core strengths overview based on my chart.",
    },
    {
      label: "Career themes",
      icon: <Briefcase className="h-3.5 w-3.5 mr-1.5" />,
      text: "What career and learning themes do you see in my chart?",
    },
    {
      label: "Relationships",
      icon: <Heart className="h-3.5 w-3.5 mr-1.5" />,
      text: "What patterns or tendencies do you see in relationships?",
    },
    {
      label: "This week’s focus",
      icon: <CalendarDays className="h-3.5 w-3.5 mr-1.5" />,
      text: "What should I focus on this week based on my chart and current energies?",
    },
  ];

  const hasBasicBirthInfo =
    birthDetails.name &&
    birthDetails.day &&
    birthDetails.month &&
    birthDetails.year &&
    birthDetails.place;

  return (
    <div className="flex h-screen items-center justify-center font-sans bg-slate-950 text-slate-50">
      <main className="relative w-full h-screen overflow-hidden">
        {/* Background orbs / gradients */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-purple-600/40 via-indigo-500/20 to-sky-500/0 blur-3xl" />
          <div className="absolute -bottom-48 right-0 h-96 w-96 rounded-full bg-gradient-to-tl from-indigo-500/40 via-emerald-400/10 to-transparent blur-3xl" />
        </div>

        {/* Top header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-slate-950 via-slate-950/70 to-transparent backdrop-blur-sm pb-4">
          <ChatHeader>
            <ChatHeaderBlock />
            <ChatHeaderBlock className="justify-center items-center gap-3">
              <div className="relative">
                <Avatar className="size-10 ring-2 ring-purple-500/70 shadow-lg shadow-purple-700/40">
                  <AvatarImage src="/logo.png" />
                  <AvatarFallback>
                    <Image
                      src="/logo.png"
                      alt="Logo"
                      width={40}
                      height={40}
                    />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]" />
              </div>
              <div className="flex flex-col leading-tight">
                <p className="tracking-tight text-sm font-semibold">
                  ZodiAI · chat with {AI_NAME}
                </p>
                <span className="text-[11px] text-slate-300">
                  Vedic · Astrology · AI — by Hitarth &amp; Yatharth
                </span>
              </div>
            </ChatHeaderBlock>
            <ChatHeaderBlock className="justify-end">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer border-slate-600/70 bg-slate-900/60 hover:bg-slate-800/80 text-xs"
                onClick={clearChat}
              >
                <Plus className="size-4 mr-1" />
                {CLEAR_CHAT_TEXT}
              </Button>
            </ChatHeaderBlock>
          </ChatHeader>
        </div>

        {/* Main scrollable area */}
        <div className="h-screen overflow-y-auto px-5 py-4 w-full pt-[96px] pb-[230px]">
          <div className="flex flex-col items-center justify-end min-h-full">
            {isClient ? (
              <>
                {/* Birth details card */}
                <div className="w-full max-w-3xl mb-4">
                  <div className="relative rounded-2xl border border-purple-500/40 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-900/40 shadow-[0_0_40px_rgba(126,34,206,0.45)] p-4 sm:p-5 space-y-3 overflow-hidden">
                    <div className="pointer-events-none absolute -top-10 -right-8 h-32 w-32 rounded-full bg-gradient-to-br from-purple-500/60 via-indigo-400/30 to-transparent blur-3xl opacity-70" />
                    <div className="relative flex items-center justify-between gap-2">
                      <div>
                        <h2 className="text-sm font-semibold flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-purple-300" />
                          Step 1 · Enter your birth details
                        </h2>
                        <p className="text-[11px] text-slate-300 mt-1">
                          ZodiAI uses your birth data to call AstrologyAPI and
                          interpret your chart. Approximate time is okay if you
                          don&apos;t know it exactly.
                        </p>
                      </div>
                      {hasBasicBirthInfo && (
                        <div className="hidden sm:flex flex-col items-end text-[11px] text-slate-300 bg-slate-900/70 border border-slate-700/70 rounded-xl px-3 py-2">
                          <span className="uppercase tracking-wide text-[10px] text-slate-400 mb-0.5">
                            preview
                          </span>
                          <span className="font-medium">
                            {birthDetails.name}
                          </span>
                          <span>
                            {birthDetails.day}-{birthDetails.month}-
                            {birthDetails.year}
                            {birthDetails.hour &&
                              ` · ${birthDetails.hour}:${birthDetails.minute || "00"}`}
                          </span>
                          <span className="truncate max-w-[180px]">
                            {birthDetails.place}
                          </span>
                        </div>
                      )}
                    </div>

                    <form
                      onSubmit={handleBirthSubmit}
                      className="relative grid gap-2 sm:grid-cols-2 mt-2"
                    >
                      <div className="sm:col-span-2">
                        <Input
                          className="bg-slate-950/70 border-slate-700/70"
                          placeholder="Name"
                          value={birthDetails.name}
                          onChange={(e) =>
                            setBirthDetails((bd) => ({
                              ...bd,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="flex gap-2">
                        <Input
                          className="bg-slate-950/70 border-slate-700/70"
                          placeholder="DD"
                          value={birthDetails.day}
                          onChange={(e) =>
                            setBirthDetails((bd) => ({
                              ...bd,
                              day: e.target.value,
                            }))
                          }
                        />
                        <Input
                          className="bg-slate-950/70 border-slate-700/70"
                          placeholder="MM"
                          value={birthDetails.month}
                          onChange={(e) =>
                            setBirthDetails((bd) => ({
                              ...bd,
                              month: e.target.value,
                            }))
                          }
                        />
                        <Input
                          className="bg-slate-950/70 border-slate-700/70"
                          placeholder="YYYY"
                          value={birthDetails.year}
                          onChange={(e) =>
                            setBirthDetails((bd) => ({
                              ...bd,
                              year: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="flex gap-2">
                        <Input
                          className="bg-slate-950/70 border-slate-700/70"
                          placeholder="Hour (0–23)"
                          value={birthDetails.hour}
                          onChange={(e) =>
                            setBirthDetails((bd) => ({
                              ...bd,
                              hour: e.target.value,
                            }))
                          }
                        />
                        <Input
                          className="bg-slate-950/70 border-slate-700/70"
                          placeholder="Minute"
                          value={birthDetails.minute}
                          onChange={(e) =>
                            setBirthDetails((bd) => ({
                              ...bd,
                              minute: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Input
                          className="bg-slate-950/70 border-slate-700/70"
                          placeholder="Place of birth (City, Country)"
                          value={birthDetails.place}
                          onChange={(e) =>
                            setBirthDetails((bd) => ({
                              ...bd,
                              place: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="sm:col-span-2 flex justify-end">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={
                            status === "streaming" || status === "submitted"
                          }
                          className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 shadow-md shadow-purple-700/40 text-xs"
                        >
                          <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                          Send details to {AI_NAME}
                        </Button>
                      </div>
                    </form>

                    <p className="text-[11px] text-slate-300/80 relative">
                      This information stays in this browser session and is used
                      only to personalize responses. Please{" "}
                      <span className="font-semibold">
                        do not enter passwords, ID numbers or private
                        identifiers.
                      </span>
                    </p>
                  </div>
                </div>

                {/* Conversation */}
                <MessageWall
                  messages={messages}
                  status={status}
                  durations={durations}
                  onDurationChange={handleDurationChange}
                />
                {status === "submitted" && (
                  <div className="flex justify-start max-w-3xl w-full mt-2">
                    <Loader2 className="size-4 animate-spin text-purple-300" />
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-center max-w-2xl w-full">
                <Loader2 className="size-4 animate-spin text-purple-300" />
              </div>
            )}
          </div>
        </div>

        {/* Bottom input + quick actions + footer */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent backdrop-blur-sm pt-13">
          <div className="w-full px-5 pt-4 pb-1 flex justify-center relative overflow-visible">
            <div className="message-fade-overlay" />
            <div className="max-w-3xl w-full">
              {/* Quick action chips */}
              <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
                <span className="mr-1 text-slate-400">Quick asks:</span>
                {quickQuestions.map((q) => (
                  <Button
                    key={q.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-[11px] border-slate-700/80 bg-slate-950/70 hover:bg-purple-600/20 hover:border-purple-400/80 transition-colors"
                    onClick={() => sendMessage({ text: q.text })}
                    disabled={status === "streaming" || status === "submitted"}
                  >
                    {q.icon}
                    {q.label}
                  </Button>
                ))}
              </div>

              {/* Chat input */}
              <form id="chat-form" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <Controller
                    name="message"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="chat-form-message"
                          className="sr-only"
                        >
                          Message
                        </FieldLabel>
                        <div className="relative">
                          <textarea
                            {...field}
                            id="chat-form-message"
                            className="w-full min-h-[60px] max-h-40 resize-none pr-14 pl-5 py-3 bg-slate-950/80 border border-slate-700/80 rounded-[20px] text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/70 shadow-inner shadow-slate-900 placeholder:text-slate-500"
                            placeholder="Ask ZodiAI a question…  (Shift+Enter for new line, Enter to send)"
                            disabled={status === "streaming"}
                            aria-invalid={fieldState.invalid}
                            autoComplete="off"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                form.handleSubmit(onSubmit)();
                              }
                            }}
                          />

                          {(status === "ready" || status === "error") && (
                            <Button
                              className="absolute right-3 top-2.5 rounded-full h-9 w-9 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 shadow-md shadow-purple-700/50"
                              type="submit"
                              disabled={!field.value.trim()}
                              size="icon"
                            >
                              <ArrowUp className="size-4" />
                            </Button>
                          )}
                          {(status === "streaming" ||
                            status === "submitted") && (
                            <Button
                              className="absolute right-3 top-2.5 rounded-full h-9 w-9 bg-slate-800 hover:bg-slate-700 border border-slate-600"
                              size="icon"
                              type="button"
                              onClick={() => {
                                stop();
                              }}
                            >
                              <Square className="size-4" />
                            </Button>
                          )}
                        </div>
                      </Field>
                    )}
                  />
                </FieldGroup>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="w-full px-5 pb-3 items-center flex flex-col gap-1 justify-center text-[11px] text-slate-400">
            <div>
              © {new Date().getFullYear()} {OWNER_NAME} ·{" "}
              <Link href="/terms" className="underline">
                Terms of Use
              </Link>{" "}
              · Powered by{" "}
              <Link href="https://ringel.ai/" className="underline">
                Ringel.AI
              </Link>
            </div>
            <div className="text-slate-500">
              Astrology offers guidance, not fixed destiny. Use ZodiAI for
              reflection, and consult qualified professionals for medical,
              legal or financial decisions.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
