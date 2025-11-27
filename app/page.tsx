"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
import { ArrowUp, Loader2, Plus, Square, Sparkles } from "lucide-react";
import { MessageWall } from "@/components/messages/message-wall";
import { ChatHeader, ChatHeaderBlock } from "@/app/parts/chat-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UIMessage } from "ai";
import { FormEvent, useEffect, useState } from "react";
import { AI_NAME, CLEAR_CHAT_TEXT, OWNER_NAME, WELCOME_MESSAGE } from "@/config";
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

  useEffect(() => {
    if (isClient && messages.length === 0) {
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
    }
  }, [isClient, messages.length, setMessages]);

  const handleDurationChange = (key: string, duration: number) => {
    setDurations((prev) => ({ ...prev, [key]: duration }));
  };

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
      text: "Give me a detailed personality and core strengths overview based on my chart.",
    },
    {
      label: "Career themes",
      text: "What career and learning themes do you see in my chart?",
    },
    {
      label: "Relationships",
      text: "What patterns or tendencies do you see in relationships?",
    },
    {
      label: "This week’s focus",
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
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      {/* MAIN COLUMN */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-950">
          <ChatHeader>
            <ChatHeaderBlock />
            <ChatHeaderBlock className="justify-center items-center gap-3">
              <Avatar className="size-9 border border-slate-700 bg-slate-900">
                <AvatarImage src="/logo.png" />
                <AvatarFallback>
                  <Image src="/logo.png" alt="Logo" width={32} height={32} />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col leading-tight">
                <p className="tracking-tight text-sm font-semibold">
                  ZodiAI · chat with {AI_NAME}
                </p>
                <span className="text-[11px] text-slate-400">
                  Vedic astrology assistant · for reflection &amp; guidance
                </span>
              </div>
            </ChatHeaderBlock>
            <ChatHeaderBlock className="justify-end">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs"
                onClick={clearChat}
              >
                <Plus className="size-4 mr-1" />
                {CLEAR_CHAT_TEXT}
              </Button>
            </ChatHeaderBlock>
          </ChatHeader>
        </header>

        {/* Middle: scrollable chat area */}
        <div className="flex-1 flex flex-col items-center px-4 py-4">
          <div
            id="chat-scroll-container"
            className="w-full max-w-3xl flex-1 overflow-y-auto space-y-4 pb-4"
          >
            {/* Birth details card */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-slate-300" />
                    Enter your birth details
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    ZodiAI uses your birth data to call AstrologyAPI and
                    interpret your chart. Approximate time is okay.
                  </p>
                </div>

                {hasBasicBirthInfo && (
                  <div className="hidden sm:flex flex-col items-start text-[11px] text-slate-200 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 leading-snug space-y-1">
                    <span className="uppercase tracking-wide text-[10px] text-slate-500">
                      Preview
                    </span>
                    <span className="font-medium">{birthDetails.name}</span>
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
                className="grid gap-2 sm:grid-cols-2 mt-1"
              >
                <div className="sm:col-span-2">
                  <Input
                    className="bg-slate-950 border-slate-700 text-slate-50"
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
                    className="bg-slate-950 border-slate-700 text-slate-50"
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
                    className="bg-slate-950 border-slate-700 text-slate-50"
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
                    className="bg-slate-950 border-slate-700 text-slate-50"
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
                    className="bg-slate-950 border-slate-700 text-slate-50"
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
                    className="bg-slate-950 border-slate-700 text-slate-50"
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
                    className="bg-slate-950 border-slate-700 text-slate-50"
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
                    disabled={status === "streaming" || status === "submitted"}
                    className="bg-indigo-600 hover:bg-indigo-500 text-xs"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Send details to {AI_NAME}
                  </Button>
                </div>
              </form>

              <p className="text-[11px] text-slate-500">
                This information stays in this browser session and is used only
                to personalize responses. Please don&apos;t enter passwords or
                ID numbers.
              </p>
            </section>

            {/* Messages */}
            {isClient ? (
              <>
                <MessageWall
                  messages={messages}
                  status={status}
                  durations={durations}
                  onDurationChange={handleDurationChange}
                />
                {status === "submitted" && (
                  <div className="flex justify-start max-w-3xl w-full mt-2">
                    <Loader2 className="size-4 animate-spin text-slate-400" />
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-center max-w-2xl w-full mt-6">
                <Loader2 className="size-4 animate-spin text-slate-400" />
              </div>
            )}
          </div>

          {/* Bottom input bar */}
          <div className="w-full max-w-3xl mt-3">
            {/* Quick asks */}
            <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              <span className="mr-1">Quick asks:</span>
              {quickQuestions.map((q) => (
                <Button
                  key={q.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-[11px] border-slate-700 bg-slate-900 hover:bg-slate-800"
                  onClick={() => sendMessage({ text: q.text })}
                  disabled={status === "streaming" || status === "submitted"}
                >
                  {q.label}
                </Button>
              ))}
            </div>

            {/* Chat input (multiline) */}
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
                          className="w-full min-h-[60px] max-h-40 resize-none pr-14 pl-5 py-3 bg-slate-900 border border-slate-700 rounded-[20px] text-sm leading-relaxed text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 placeholder:text-slate-500"
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
                            className="absolute right-3 top-2.5 rounded-full h-9 w-9 bg-indigo-600 hover:bg-indigo-500"
                            type="submit"
                            disabled={!field.value.trim()}
                            size="icon"
                          >
                            <ArrowUp className="size-4" />
                          </Button>
                        )}
                        {(status === "streaming" || status === "submitted") && (
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
        <footer className="border-t border-slate-800 px-4 py-3 text-[11px] text-slate-500 flex flex-col items-center gap-1">
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
          <div>
            Astrology offers guidance, not fixed destiny. Use ZodiAI for
            reflection, and consult professionals for medical, legal or
            financial decisions.
          </div>
        </footer>
      </main>
    </div>
  );
}
