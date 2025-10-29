export type Stage = "confrontation" | "reflection" | "release";

export function nextStageFromTranscript(messages: string[]): Stage {
  const last = (messages.at(-1) || "").toLowerCase();

  if (/\b(thank you|i see|makes sense|i'm ready|goodbye|farewell)\b/.test(last)) return "release";
  if (/\b(maybe|i guess|i understand|i think|why did we)\b/.test(last)) return "reflection";
  if (/\b(hate|never|always|you ruined|angry|mad|why did you)\b/.test(last)) return "confrontation";

  // Default gentle progression after a bit of chatting
  return messages.length > 12 ? "reflection" : "confrontation";
}
