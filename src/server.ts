import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import reboundRouter from "./routes/rebound.js";
import { limiter } from "./lib/rateLimit.js";

const app = express();

// --- Security & middleware ---
app.use(helmet());
app.use(
  cors({
    origin: "*", // allow Expo mobile + browsers
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(limiter);

// --- Health check route ---
app.get("/health", (_req, res) =>
  res.json({ ok: true, service: "rebound-ai", ts: Date.now() })
);

// --- Temporary GET route for debugging (optional) ---
app.get("/rebound/start", (_req, res) => {
  res.json({
    message:
      "Rebound AI is online. This route expects POST requests from the mobile app.",
  });
});

// --- Core API routes ---
app.use("/rebound", reboundRouter);

// --- Global error handler ---
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("ERROR:", err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal server error" });
});

// --- Start server ---
const port = Number(process.env.PORT) || 5050;
app.listen(port, "0.0.0.0", () =>
  console.log(`✅ Rebound AI API listening on :${port}`)
);
