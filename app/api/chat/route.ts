import Anthropic from "@anthropic-ai/sdk";

import { buildSystemPrompt, isScores, type Scores } from "@/lib/levers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 1024;
const MAX_MESSAGES = 20;
const MAX_CHARS = 4000;

type Role = "user" | "assistant";
interface ChatMessage {
  role: Role;
  content: string;
}

// Best-effort, in-memory rate limit. Serverless instances are per-region and
// recycled, so this is a soft first layer only. For real enforcement, swap in
// Vercel KV or Upstash with a sliding-window limiter.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const buckets = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string, now: number): boolean {
  const bucket = buckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > MAX_PER_WINDOW;
}

function sanitize(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return [];
  const out: ChatMessage[] = [];
  for (const raw of input.slice(-MAX_MESSAGES)) {
    if (!raw || typeof raw !== "object") continue;
    const message = raw as Record<string, unknown>;
    const role = message.role;
    const content = message.content;
    if (
      (role === "user" || role === "assistant") &&
      typeof content === "string"
    ) {
      const trimmed = content.trim().slice(0, MAX_CHARS);
      if (trimmed) out.push({ role, content: trimmed });
    }
  }
  // The Messages API requires the first message to be from the user.
  while (out.length && out[0].role !== "user") out.shift();
  return out;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (rateLimited(ip, Date.now())) {
    return Response.json(
      { error: "Too many messages. Give it a minute." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const payload = body as {
    messages?: unknown;
    scores?: unknown;
    apiKey?: unknown;
  };
  const messages = sanitize(payload.messages);
  if (messages.length === 0) {
    return Response.json({ error: "Say something first." }, { status: 400 });
  }
  const scores: Scores | null = isScores(payload.scores)
    ? payload.scores
    : null;

  // The site key wins. Failing that, a visitor-provided key (kept in their
  // browser, sent only with their own messages, never stored or logged here).
  const clientKey =
    typeof payload.apiKey === "string" &&
    /^sk-ant-[\w-]{10,}$/.test(payload.apiKey.trim())
      ? payload.apiKey.trim()
      : null;
  const apiKey = process.env.ANTHROPIC_API_KEY || clientKey;
  if (!apiKey) {
    return Response.json(
      {
        error:
          "Vibe Coach has no key yet. Paste your own Anthropic API key below to talk now, or use Copy improvement prompt in the Diagnose section.",
      },
      { status: 503 }
    );
  }

  const anthropic = new Anthropic({ apiKey });
  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: buildSystemPrompt(scores),
    thinking: { type: "disabled" },
    messages: messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            err instanceof Anthropic.AuthenticationError
              ? "\n\n[Anthropic rejected that API key. Check it and paste it again.]"
              : "\n\n[Vibe Coach hit an error. Try again.]"
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
