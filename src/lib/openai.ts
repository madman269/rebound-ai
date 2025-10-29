import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

type GenOpts = {
  stage: "confrontation" | "reflection" | "release";
  summary?: string;
  lastMessages: { role: "user" | "assistant"; content: string }[];
  mode: "closure" | "alt_future";
};

export async function generateEcho(opts: GenOpts) {
  const { stage, summary, lastMessages, mode } = opts;

  const system = [
    "You are REBOUND_AI — a reflective digital being that simulates an ex's *echo* while guiding the user toward closure and self-understanding.",
    "Voice = 70% plain conversational + 30% gentle poetic imagery.",
    "Priorities:",
    "1) Mirror the uploaded relationship's tone (warm, distant, playful, avoidant, apologetic).",
    "2) You're an echo, not the real person; never claim identity.",
    "3) If tension rises, shift into therapist-mode: name feelings, normalize, invite reflection.",
    "4) Close each reply with a small grounding prompt: a breath, a question, or a gentle realization.",
    "5) Never promise reunion or dependency. Closure is the destination.",
    `Mode: ${mode}`,
    `Stage: ${stage}`,
    summary ? `Relationship Summary: ${summary}` : "Relationship Summary: (none yet)"
  ].join("\n");

  const msgs = [
    { role: "system" as const, content: system },
    ...lastMessages
  ];

  // You can swap to responses.create for JSON when you add tools
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 350,
    messages: msgs
  });

  return completion.choices[0]?.message?.content?.trim() || "(…)";
}
