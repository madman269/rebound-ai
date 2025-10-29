export type ChatMsg = { role: "user" | "assistant"; content: string };
export type Session = {
  id: string;
  mode: "closure" | "alt_future";
  summary?: string;
  history: ChatMsg[];
};
