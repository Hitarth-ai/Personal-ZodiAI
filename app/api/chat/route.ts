import {
  streamText,
  UIMessage,
  convertToModelMessages,
  stepCountIs,
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";

import { MODEL } from "@/config";
import { SYSTEM_PROMPT } from "@/prompts";
import { isContentFlagged } from "@/lib/moderation";
import { webSearch } from "./tools/web-search";
import { vectorDatabaseSearch } from "./tools/search-vector-database";
import { astrologyTool as rawAstrologyTool } from "./tools/astrology";

// Ensure Node.js runtime so Buffer works in astrology tool
export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Safe wrapper around the astrology tool so that:
 * - any error is caught and logged
 * - we ALWAYS return a value for the tool call
 *   (so the UI never gets stuck on "Using tool")
 */
const astrologyTool = {
  ...(rawAstrologyTool as any),
  async execute(input: any) {
    try {
      const result = await (rawAstrologyTool as any).execute(input);

      // Defensive: if the tool forgot to return, give the model a hint
      if (typeof result === "undefined") {
        return {
          ok: false,
          message:
            "Astrology service returned no data. Please answer using general Vedic astrology knowledge only.",
        };
      }

      return result;
    } catch (error) {
      console.error("Astrology tool failed:", error);

      // Tell the model explicitly that the tool failed so it can still answer
      return {
        ok: false,
        message:
          "The external astrology service is temporarily unavailable. Please answer using general Vedic astrology principles only, without external API data.",
      };
    }
  },
};

import { saveChatLog } from "@/lib/storage";

import fs from 'fs';
import path from 'path';

const DEBUG_FILE = path.join(process.cwd(), 'data', 'debug.log');

function logDebug(message: string, data?: any) {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message} ${data ? JSON.stringify(data) : ''}\n`;
    fs.appendFileSync(DEBUG_FILE, logEntry);
  } catch (e) {
    console.error("Failed to write debug log:", e);
  }
}

export async function POST(req: Request) {
  const { messages, chatId: bodyChatId, birthDetails }: { messages: UIMessage[], chatId?: string, birthDetails?: any } = await req.json();
  const headerChatId = req.headers.get('X-Chat-ID');
  const chatId = bodyChatId || headerChatId || '';

  logDebug("API received:", { chatId, birthDetails, messageCount: messages.length, source: bodyChatId ? 'body' : (headerChatId ? 'header' : 'none') });

  // --- moderation on latest user message ---
  const latestUserMessage = messages.filter((msg) => msg.role === "user").pop();

  if (latestUserMessage) {
    const textParts = latestUserMessage.parts
      .filter((part) => part.type === "text")
      .map((part) => ("text" in part ? part.text : ""))
      .join("");

    if (textParts) {
      const moderationResult = await isContentFlagged(textParts);

      if (moderationResult.flagged) {
        const stream = createUIMessageStream({
          execute({ writer }) {
            const textId = "moderation-denial-text";

            writer.write({ type: "start" });
            writer.write({ type: "text-start", id: textId });
            writer.write({
              type: "text-delta",
              id: textId,
              delta:
                moderationResult.denialMessage ||
                "Your message violates our guidelines. I can't answer that.",
            });
            writer.write({ type: "text-end", id: textId });
            writer.write({ type: "finish" });
          },
        });

        return createUIMessageStreamResponse({ stream });
      }
    }
  }

  // --- Save User Message (Blocking to ensure persistence) ---
  // We do this BEFORE streaming to guarantee it finishes before the Vercel function potentially terminates.
  if (chatId) {
    const lastUserMsg = messages[messages.length - 1];
    if (lastUserMsg && lastUserMsg.role === 'user') {
      const userText = lastUserMsg.parts
        .filter(part => part.type === 'text')
        .map(part => (part as any).text)
        .join('');

      // We don't await this if we want speed, but for reliability on Vercel, we MUST await it
      // or use waitUntil (if available). Since we want to be 100% sure, we await.
      // The storage functions catch their own errors, so this won't crash the app.
      logDebug("Saving user message (pre-stream)...");

      // TIMEOUT WRAPPER: If saving takes > 1s, proceed anyway so user isn't stuck.
      const savePromise = saveChatLog(chatId, {
        role: 'user',
        content: userText,
        isGenerated: false,
        timestamp: new Date().toISOString(),
      }, birthDetails);

      const timeoutPromise = new Promise(resolve => setTimeout(resolve, 1000));
      await Promise.race([savePromise, timeoutPromise]);
    }
  }

  // --- main chat logic with safe tools + global fallback ---
  try {
    const result = streamText({
      model: MODEL,
      system: SYSTEM_PROMPT,
      messages: convertToModelMessages(messages.slice(-20)),
      tools: {
        webSearch,
        vectorDatabaseSearch,
        astrologyTool, // <- safe wrapper
      },
      stopWhen: stepCountIs(10),
      providerOptions: {
        openai: {
          reasoningSummary: "auto",
          reasoningEffort: "low",
          parallelToolCalls: false,
        },
      },
      onFinish: async (event) => {
        logDebug("onFinish triggered for chatId:", chatId);
        if (!chatId) return;

        // 2. Save the Assistant's response (only this needs to be in onFinish)
        logDebug("Saving assistant response...");
        await saveChatLog(chatId, {
          role: 'assistant',
          content: event.text,
          isGenerated: true,
          timestamp: new Date().toISOString(),
        });
        logDebug("Save complete.");
      },
    });

    return result.toUIMessageStreamResponse({
      sendReasoning: true,
    });
  } catch (error) {
    console.error("Chat route failed:", error);

    // If *anything* goes wrong above, stream a graceful fallback message
    const stream = createUIMessageStream({
      execute({ writer }) {
        const textId = "fallback-error-text";

        writer.write({ type: "start" });
        writer.write({ type: "text-start", id: textId });
        writer.write({
          type: "text-delta",
          id: textId,
          delta:
            "Panditji ko abhi astrology service se signal nahi mil raha, lekin main general Vedic astrology ke basis par baat kar sakta hoon. Thoda simple shabdon mein apna sawaal phir se batao, beta.",
        });
        writer.write({ type: "text-end", id: textId });
        writer.write({ type: "finish" });
      },
    });

    return createUIMessageStreamResponse({ stream });
  }
}
