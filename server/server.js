import "dotenv/config";
import axios from "axios";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

class RateLimitError extends Error {
  constructor(message = "RATE_LIMIT: exceeded retries") {
    super(message);
    this.name = "RateLimitError";
    this.status = 429;
  }
}

const app = express();
const PORT = process.env.PORT || 4000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn(
    "[texai-backend] Missing OPENAI_API_KEY. Set it in server/.env before starting the server."
  );
}

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || "*",
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan("tiny"));

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

const MIN_INTERVAL_MS = Number(process.env.OPENAI_MIN_INTERVAL_MS ?? 2500);
let lastOpenAICall = 0;

app.post("/chat", chatLimiter, async (req, res) => {
  if (!OPENAI_API_KEY) {
    return res.status(500).send("OPENAI_API_KEY is not configured on server.");
  }

  const { userInput, mode, tone, history } = req.body ?? {};

  if (!userInput || typeof userInput !== "string") {
    return res.status(400).send("userInput is required.");
  }

  try {
    const systemPrompt = buildSystemPrompt(mode, tone);
    const messages = [
      { role: "system", content: systemPrompt },
      ...(Array.isArray(history)
        ? history.map((item) => ({
            role: item.role ?? "user",
            content: `${item.content ?? ""}\n\n[Mode:${item.mode ?? "informational"}|Tone:${item.tone ?? "training"}]`,
          }))
        : []),
      { role: "user", content: userInput },
    ];

    const aiResponse = await callOpenAIWithRetry(messages, tone);
    return res.json({ content: aiResponse });
  } catch (error) {
    console.error("[texai-backend] Chat error:", error);
    if (error instanceof RateLimitError) {
      return res.status(error.status).send(error.message);
    }
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.error ||
        error.message;

      if (status === 429) {
        return res.status(429).send("RATE_LIMIT: OpenAI rate limit hit.");
      }

      return res.status(status).send(message ?? "OpenAI request failed.");
    }

    return res.status(500).send("Unexpected server error.");
  }
});

app.get("/", (_, res) => {
  res.json({
    status: "ok",
    message: "TEXAI backend is running.",
  });
});

app.listen(PORT, () => {
  console.log(`[texai-backend] Listening on port ${PORT}`);
});

async function callOpenAIWithRetry(messages, tone = "training") {
  const maxRetries = 4;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const now = Date.now();
      const sinceLastCall = now - lastOpenAICall;
      if (sinceLastCall < MIN_INTERVAL_MS) {
        await sleep(MIN_INTERVAL_MS - sinceLastCall);
      }

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          temperature: tone === "field" ? 0.4 : 0.7,
          max_tokens: 350,
          messages,
        },
        {
          timeout: 25_000,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      const content =
        response.data?.choices?.[0]?.message?.content?.trim() ?? "";
      lastOpenAICall = Date.now();
      return content;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        const backoff = 500 * (attempt + 1);
        await sleep(backoff);
        continue;
      }
      throw error;
    }
  }

  throw new RateLimitError();
}

function buildSystemPrompt(mode = "informational", tone = "training") {
  const base =
    "You are TEXAI, an explainable AI assistant for Texas law enforcement. Follow CJIS, FISMA, FedRAMP, and Privacy by Design principles. Provide references when possible.";
  const toneDirective =
    tone === "field"
      ? "Respond concisely with immediate, step-by-step guidance suitable for real-time operations."
      : "Respond with a detailed, instructional tone suitable for classroom or self-paced learning.";
  const modeDirectiveMap = {
    informational:
      "Deliver clear regulatory guidance, cite relevant policies, and suggest follow-up resources.",
    quiz:
      "Act as a quiz engine. Ask questions one at a time, wait for responses, and provide scoring plus explanations.",
    simulation:
      "Run a branching scenario. Present decisions, adapt based on responses, and explain best practices.",
  };

  return `${base} ${toneDirective} ${modeDirectiveMap[mode]}`
    .replace(/\s+/g, " ")
    .trim();
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
