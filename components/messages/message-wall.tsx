"use client";

import { UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { UserMessage } from "./user-message";
import { AssistantMessage } from "./assistant-message";
import Image from "next/image";

// Must match the id on the scrollable div in page.tsx
const SCROLL_CONTAINER_ID = "chat-scroll-container";

type MessageWallProps = {
  messages: UIMessage[];
  status?: string;
  durations?: Record<string, number>;
  onDurationChange?: (key: string, duration: number) => void;
};

export function MessageWall({
  messages,
  status,
  durations,
  onDurationChange,
}: MessageWallProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Track whether user is near the bottom of the main scroll container
  useEffect(() => {
    if (typeof window === "undefined") return;

    const container = document.getElementById(SCROLL_CONTAINER_ID);
    if (!container) return;

    const handleScroll = () => {
      const threshold = 80; // px from bottom counts as "at bottom"
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;

      setIsAtBottom(distanceFromBottom < threshold);
    };

    handleScroll(); // initial
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll only when user is already at the bottom
  useEffect(() => {
    if (messages.length === 0) return; // Don't scroll if no messages (new chat)
    if (status === "streaming" || status === "submitted") return; // Disable auto-scroll during streaming/submission
    if (!isAtBottom) return;
    if (typeof window === "undefined") return;

    const container = document.getElementById(SCROLL_CONTAINER_ID);
    if (!container) return;

    container.scrollTop = container.scrollHeight;
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isAtBottom, status]);

  // Scroll prompt to top when response starts
  useEffect(() => {
    if (status === "submitted" || status === "streaming") {
      // Find the last user message
      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
      if (lastUserMsg) {
        const el = document.getElementById(lastUserMsg.id);
        if (el) {
          el.scrollIntoView({ block: "start", behavior: "smooth" });
        }
      }
    }
    // Only run when status changes to submitted/streaming
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);


  return (
    <div className="relative max-w-3xl w-full">
      <div className="relative flex flex-col gap-4">
        {messages.map((message, idx) => {
          const isLastMessage = idx === messages.length - 1;
          return (
            <div key={message.id} id={message.id} className="w-full">
              {message.role === "user" ? (
                <UserMessage message={message} />
              ) : (
                <AssistantMessage
                  message={message}
                  status={status}
                  isLastMessage={isLastMessage}
                  durations={durations}
                  onDurationChange={onDurationChange}
                />
              )}
            </div>
          );
        })}
        {status === "submitted" && (
          <div className="flex justify-start w-full pl-4 py-2">
            <Image
              src="/loading.gif"
              alt="Loading..."
              width={40}
              height={40}
              className="object-contain"
              unoptimized
            />
          </div>
        )}
        <div
          className={`transition-all duration-500 ease-in-out ${status === "submitted" || status === "streaming" ? "h-[85vh]" : "h-[50vh]"
            }`}
          aria-hidden="true"
        />
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
