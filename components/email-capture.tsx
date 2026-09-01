"use client";

import * as React from "react";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ---------------------------------------------------------------------------
// Capture endpoint. FormSubmit delivers each signup to the inbox below with
// no account needed; the first submission triggers a one-time activation
// email to that inbox. To upgrade to Formspree later, replace this with
// "https://formspree.io/f/<id>". Keep this a real endpoint: the success
// state below tells people they are on the list.
// ---------------------------------------------------------------------------
const CAPTURE_ENDPOINT = "https://formsubmit.co/ajax/adamtpang@gmail.com";

type Status = "idle" | "invalid" | "submitting" | "done" | "error";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

type EmailCaptureProps = {
  buttonLabel?: string;
  helperText?: string;
  source?: string;
  subject?: string;
  successMessage?: string;
};

export function EmailCapture({
  buttonLabel = "Get diagnosed",
  helperText = "One lever-sharpening email when we open. No spam, ever.",
  source = "hero",
  subject = "vibeleverage.com signup",
  successMessage = "On the list. We'll send your diagnosis the day the doors open.",
}: EmailCaptureProps = {}) {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<Status>("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();

    if (!EMAIL_RE.test(value)) {
      setStatus("invalid");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch(CAPTURE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: value,
          source,
          _subject: subject,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      // FormSubmit signals delivery in the body, not the HTTP status. Never
      // confirm a signup that was not actually accepted.
      const data = (await res.json()) as { success?: unknown };
      if (String(data.success) !== "true") throw new Error("Not delivered");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-lever/30 bg-lever/10 px-4 py-3.5 text-sm">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lever text-background">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
        <span className="text-foreground">{successMessage}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full">
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <Input
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="you@where.you.build"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          aria-label="Email address"
          aria-invalid={status === "invalid"}
          className="h-12 flex-1 border-border bg-secondary/40 text-base placeholder:text-muted-foreground/60 focus-visible:ring-lever"
        />
        <Button
          type="submit"
          disabled={status === "submitting"}
          className="group h-12 gap-2 px-6 text-base font-semibold"
        >
          {status === "submitting" ? "Sending..." : buttonLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
      <p className="mt-2.5 min-h-4 text-xs">
        {status === "invalid" ? (
          <span className="text-destructive">Enter a valid email address.</span>
        ) : status === "error" ? (
          <span className="text-destructive">Something went wrong. Try again.</span>
        ) : (
          <span className="text-muted-foreground/70">
            {helperText}
          </span>
        )}
      </p>
    </form>
  );
}
