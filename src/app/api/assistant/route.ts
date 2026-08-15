import { NextResponse } from "next/server";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { anthropicApiKey, isAnthropicConfigured } from "@/lib/env";
import { buildKnowledgeBaseText } from "@/lib/assistant/knowledge-base";
import { getLocalResponse } from "@/lib/assistant/local-responder";
import { telemetry } from "@/lib/telemetry";

const CLAUDE_MODEL = "claude-sonnet-5";

const assistantRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(30),
  locale: z.enum(["it", "en"]).default("it"),
});

export async function POST(request: Request) {
  const parsed = assistantRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const { messages, locale } = parsed.data;
  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");

  if (!lastUserMessage) {
    return NextResponse.json({ error: "no_user_message" }, { status: 400 });
  }

  if (!isAnthropicConfigured) {
    const reply = getLocalResponse(lastUserMessage.content, locale);
    return NextResponse.json({ mode: "local" as const, reply });
  }

  try {
    const client = new Anthropic({ apiKey: anthropicApiKey });
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 400,
      system: buildKnowledgeBaseText(locale),
      messages: messages.map((message) => ({ role: message.role, content: message.content })),
    });

    const text = response.content.find((block) => block.type === "text")?.text;
    if (!text) throw new Error("empty_response");

    telemetry.info("assistant.claude_reply", "Risposta generata da Claude", {
      messageCount: messages.length,
    });

    return NextResponse.json({ mode: "claude" as const, reply: { text } });
  } catch (error) {
    telemetry.error("assistant.claude_failed", "Chiamata a Claude fallita, uso il fallback locale", {
      message: error instanceof Error ? error.message : "unknown",
    });
    const reply = getLocalResponse(lastUserMessage.content, locale);
    return NextResponse.json({ mode: "local" as const, reply });
  }
}
