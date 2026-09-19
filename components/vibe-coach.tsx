"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";

import { VibeGlyph } from "@/components/lever-mark";
import { readStoredValue, STORAGE_KEYS } from "@/lib/storage-keys";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTERS = [
  "What should I do this week to fix my binding constraint?",
  "Give me a 3-step plan for my weakest lever.",
  "How do I move media off zero?",
];

const BYOK_STORAGE_KEY = STORAGE_KEYS.byok;

function readScores(): unknown {
  try {
    const raw = readStoredValue("scores");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function VibeCoach() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [byokKey, setByokKey] = React.useState<string | null>(null);
  const [needsKey, setNeedsKey] = React.useState(false);
  const [keyDraft, setKeyDraft] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    try {
      setByokKey(readStoredValue("byok"));
    } catch {
      /* storage unavailable */
    }
  }, []);

  function saveKey() {
    const trimmed = keyDraft.trim();
    if (!/^sk-ant-[\w-]{10,}$/.test(trimmed)) {
      setError("That does not look like an Anthropic API key (sk-ant-...).");
      return;
    }
    try {
      localStorage.setItem(BYOK_STORAGE_KEY, trimmed);
    } catch {
      /* storage unavailable; key still works for this session */
    }
    setByokKey(trimmed);
    setKeyDraft("");
    setNeedsKey(false);
    setError(null);
  }

  function forgetKey() {
    try {
      localStorage.removeItem(BYOK_STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
    setByokKey(null);
  }

  React.useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;

    setError(null);
    const history = [...messages, { role: "user", content } as Message];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          scores: readScores(),
          apiKey: byokKey || undefined,
        }),
      });

      if (!res.ok || !res.body) {
        if (res.status === 503) setNeedsKey(true);
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Vibe Coach is unavailable right now.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = prev.slice();
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
      if (!acc.trim()) throw new Error("Vibe Coach had nothing to say. Try again.");
    } catch (err) {
      setMessages((prev) => {
        const copy = prev.slice();
        const last = copy[copy.length - 1];
        if (last && last.role === "assistant" && !last.content) copy.pop();
        return copy;
      });
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const streaming =
    busy &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant" &&
    messages[messages.length - 1].content === "";

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-background">
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
        <VibeGlyph className="text-lever" />
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Vibe Coach
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex h-80 flex-col gap-4 overflow-y-auto px-5 py-6 sm:px-6"
      >
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col justify-center gap-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Ask about your binding constraint. Vibe Coach already knows your
              scores from the diagnostic above.
            </p>
            <div className="flex flex-col gap-2">
              {STARTERS.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => send(starter)}
                  className="rounded-lg border border-border px-3.5 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:border-lever/50 hover:text-foreground"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                message.role === "user"
                  ? "self-end bg-lever/15 text-foreground"
                  : "self-start bg-secondary/50 text-foreground"
              )}
            >
              {message.content || (streaming ? "Thinking…" : "")}
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-border px-3 py-3"
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask Vibe Coach..."
          aria-label="Message Vibe Coach"
          className="h-10 flex-1 rounded-md border border-border bg-secondary/40 px-3.5 text-sm text-foreground placeholder:text-subtle-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lever"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Send"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-lever text-background transition-colors hover:bg-lever/90 disabled:opacity-40"
        >
          <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </form>

      {error && (
        <p className="border-t border-border px-5 py-2.5 text-xs text-destructive">
          {error}
        </p>
      )}

      {needsKey && !byokKey && (
        <div className="flex flex-col gap-2 border-t border-border px-5 py-3.5">
          <div className="flex items-center gap-2">
            <input
              type="password"
              value={keyDraft}
              onChange={(event) => setKeyDraft(event.target.value)}
              placeholder="sk-ant-..."
              aria-label="Your Anthropic API key"
              className="h-9 flex-1 rounded-md border border-border bg-secondary/40 px-3 font-mono text-xs text-foreground placeholder:text-subtle-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lever"
            />
            <button
              type="button"
              onClick={saveKey}
              className="h-9 rounded-md bg-lever px-4 text-xs font-semibold text-background transition-colors hover:bg-lever/90"
            >
              Use my key
            </button>
          </div>
          <p className="text-[0.68rem] leading-relaxed text-subtle-foreground">
            Your key stays in this browser and is sent only to this site&rsquo;s
            chat route with your own messages. Get one at
            console.anthropic.com.
          </p>
        </div>
      )}

      {byokKey && (
        <p className="border-t border-border px-5 py-2 text-[0.68rem] text-subtle-foreground">
          Using your API key from this browser.{" "}
          <button
            type="button"
            onClick={forgetKey}
            className="underline underline-offset-2 transition-colors hover:text-foreground"
          >
            Forget it
          </button>
        </p>
      )}
    </div>
  );
}
