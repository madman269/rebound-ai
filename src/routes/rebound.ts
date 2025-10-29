import { Router } from "express";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { clampText } from "../lib/sanitizer.js";
import { nextStageFromTranscript } from "../lib/stage.js";
import { generateEcho } from "../lib/openai.js";
import type { Session, ChatMsg } from "../types.js";

const router = Router();
const sessions = new Map<string, Session>();

// POST /rebound/start
const StartSchema = z.object({
  mode: z.enum(["closure", "alt_future"]).default("closure"),
  summary: z.string().optional()
});
router.post("/start", async (req, res, next) => {
  try {
    const { mode, summary } = StartSchema.parse(req.body);
    const id = uuid();
    const sess: Session = {
      id,
      mode,
      summary: summary ? clampText(summary, 2000) : undefined,
      history: []
    };
    sessions.set(id, sess);
    res.json({ sessionId: id });
  } catch (e) {
    next(e);
  }
});

// POST /rebound/reply
const ReplySchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string().min(1).max(2000)
});
router.post("/reply", async (req, res, next) => {
  try {
    const { sessionId, message } = ReplySchema.parse(req.body);
    const sess = sessions.get(sessionId);
    if (!sess) return res.status(404).json({ error: "Session not found" });

    const userMsg: ChatMsg = { role: "user", content: clampText(message) };
    sess.history.push(userMsg);

    const stage = nextStageFromTranscript(sess.history.filter(m => m.role === "user").map(m => m.content));

    const aiText = await generateEcho({
      stage,
      summary: sess.summary,
      mode: sess.mode,
      lastMessages: sess.history.slice(-12) // keep context tight
    });

    const aiMsg: ChatMsg = { role: "assistant", content: aiText };
    sess.history.push(aiMsg);

    res.json({ stage, reply: aiText });
  } catch (e) {
    next(e);
  }
});

// Optional: GET /rebound/history?sessionId=...
router.get("/history", (req, res) => {
  const sessionId = req.query.sessionId as string;
  const sess = sessionId && sessions.get(sessionId);
  if (!sess) return res.status(404).json({ error: "Session not found" });
  res.json({ history: sess.history, mode: sess.mode, summary: sess.summary });
});

export default router;
