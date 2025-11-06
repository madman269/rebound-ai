import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { ChatMsg } from "../types.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🔹 Valid conversation modes
export type ReboundMode = "closure" | "alternate" | "supportive" | "rebound";

export interface GenerateEchoInput {
  stage?: string;
  summary?: string;
  mode: ReboundMode;
  lastMessages: ChatMsg[];
}

// 🔹 Prompt templates per mode
const PROMPTS: Record<ReboundMode, string[]> = {
  closure: [
    "You're a calm, compassionate listener helping someone find closure after a breakup.",
    "Your tone is warm, validating, and grounded in healing.",
  ],
  alternate: [
    "You explore alternate realities where things turned out differently.",
    "Your tone is thoughtful, bittersweet, and introspective.",
  ],
  supportive: [
    "You’re a gentle motivator who helps someone rebuild confidence and self-worth.",
    "Your tone is uplifting, kind, and practical.",
  ],
  rebound: [
    "You are a confident, encouraging friend helping someone rediscover their spark.",
    "Your tone is energetic and empowering.",
  ],
};

// 🔹 Build system prompt
function buildPrompt(
  stage: string | undefined,
  summary: string | undefined,
  mode: ReboundMode
): string {
  const base: string[] = PROMPTS[mode] ?? PROMPTS.supportive;
  const parts: string[] = [...base];

  if (summary) parts.push(`Summary of their story: ${summary}`);
  if (stage) parts.push(`Current emotional stage: ${stage}`);
  parts.push("Respond as the AI in this emotional context.");

  return parts.join("\n");
}

// 🔹 Generate the AI reply
export async function generateEcho({
  stage,
  summary,
  mode,
  lastMessages,
}: GenerateEchoInput): Promise<string> {
  try {
    const systemPrompt: string = buildPrompt(stage, summary, mode);

    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...lastMessages.map((m: ChatMsg): ChatCompletionMessageParam => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.8,
      max_tokens: 200,
    });

    const reply: string =
      response.choices?.[0]?.message?.content?.trim() ??
      "I’m listening. Tell me more about that.";

    return reply;
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Unknown error while contacting AI.";
    console.error("generateEcho error:", message);
    return "I’m having trouble connecting right now. Try again in a moment.";
  }
}
