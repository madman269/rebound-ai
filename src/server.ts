import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import reboundRouter from "./routes/rebound.js";
import { limiter } from "./lib/rateLimit.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(limiter);

app.get("/health", (_req, res) => res.json({ ok: true, service: "rebound-ai", ts: Date.now() }));

app.use("/rebound", reboundRouter);

// Global error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("ERROR:", err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

const port = Number(process.env.PORT) || 5050;
app.listen(port, () => console.log(`Rebound AI API listening on :${port}`));
