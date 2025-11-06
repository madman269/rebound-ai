export interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

export interface Session {
  id: string;
  mode: "closure" | "alternate" | "supportive" | "rebound";
  summary?: string;
  history: ChatMsg[];
}
