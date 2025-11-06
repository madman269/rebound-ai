import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates an AI reply for Rebound AI sessions.
 * Always returns a string — never throws an unhandled error.
 */
export async function generateEcho({
  stage,
  summary,
  mode,
  lastMessages,
}) {
  try {
    const systemPrompt = buildSystemPrompt(stage, summary, mode);
    const contextMessages = (lastMessages || []).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // --- Call OpenAI ---
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.85,
      max_tokens: 200,
      messages: [
        { role: "system", content: systemPrompt },
        ...contextMessages,
      ],
    });

    // --- Extract and sanitize response ---
    const raw = completion.choices?.[0]?.message?.content || "";
    const clean = raw.trim();

    // Return safe text
    if (clean.length > 0) return clean;

    // fallback if empty string
    return randomFallback(stage, mode);
  } catch (err) {
    console.error("❌ generateEcho error:", err.message);
    // fallback for any failure (network, timeout, etc.)
    return randomFallback(stage, mode);
  }
}

/**
 * Creates a tailored system prompt based on mode/stage.
 */
function buildSystemPrompt(stage, summary, mode) {
  let base =
    "You are Rebound AI — a calm, emotionally intelligent listener who helps users heal from heartbreak. Speak with warmth and insight, never judging.";
  if (mode === "alt_future" || mode === "alternate") {
    base +=
      " You guide users through 'what-if' scenarios, imagining alternate timelines with empathy and creativity.";
  }
  if (mode === "closure") {
    base +=
      " Help them process loss, regret, and forgiveness. Keep your tone gentle and grounded.";
  }
  if (mode === "rebound" || mode === "supportive") {
    base +=
      " You rebuild confidence and self-love through uplifting, motivating tone.";
  }
  if (summary) {
    base += ` The user's situation summary: "${summary}". Use this as emotional context.`;
  }
  if (stage) {
    base += ` The current emotional stage is ${stage}. Adjust your tone accordingly.`;
  }
  return base;
}

/**
 * Provides friendly fallback text if OpenAI fails or returns nothing.
 */
function randomFallback(stage, mode) {
  const fallbacks = {
    closure: [
      "It’s okay — you’ve come a long way. What’s still lingering on your mind?",
      "You don’t have to rush closure. Sometimes it comes in quiet waves.",
      "I’m here. Tell me what you wish they’d understood.",
    ],
    alternate: [
      "In another timeline, maybe this played out differently… want to imagine it?",
      "Let’s rewrite this story together. Where does it start?",
      "What would have happened if you’d said something else that day?",
    ],
    supportive: [
      "You’re doing better than you think — let’s keep going.",
      "Even the strongest people need to talk. I’m listening.",
      "Healing doesn’t mean forgetting — it means forgiving yourself.",
    ],
    rebound: [
      "You’re allowed to start again. What do you want to build next?",
      "Energy attracts energy. You’re glowing more than you realize.",
      "This is your comeback arc — and I’m here for it.",
    ],
  };

  const list = fallbacks[mode] || fallbacks.closure;
  return list[Math.floor(Math.random() * list.length)];
}
