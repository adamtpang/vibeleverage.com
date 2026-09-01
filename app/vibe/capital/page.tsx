"use client";

import { useEffect, useRef, useState } from "react";

import { VibePageHeader } from "@/components/vibe/page-header";
import { VibeStatusCard } from "@/components/vibe/status-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Comp {
  label: string;
  amount: string;
  note: string;
  source?: string;
}

interface Recommendation {
  lineItems: Array<{ item: string; qty: string; rate: string; amount: string }>;
  total: string;
  reasoning: string;
}

interface Job {
  id: string;
  subject: string;
  context: string;
  phase: "queued" | "researching" | "ready_for_review" | "saved" | "error";
  log: string[];
  error?: string;
  comps?: Comp[];
  recommendation?: Recommendation;
  openDecisions?: string[];
  draftDocument?: string;
  savedPath?: string;
}

const PHASE_LABEL: Record<Job["phase"], string> = {
  queued: "Queued",
  researching: "Researching market comps (claude CLI, WebSearch only)",
  ready_for_review: "Ready for your review",
  saved: "Draft saved locally",
  error: "Error",
};

const PHASE_TONE: Record<Job["phase"], "active" | "done" | "error"> = {
  queued: "active",
  researching: "active",
  ready_for_review: "done",
  saved: "done",
  error: "error",
};

export default function VibeCapitalPage() {
  const [subject, setSubject] = useState("");
  const [context, setContext] = useState("");
  const [job, setJob] = useState<Job | null>(null);
  const [draftText, setDraftText] = useState("");
  const [starting, setStarting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    return () => esRef.current?.close();
  }, []);

  function streamJob(jobId: string) {
    esRef.current?.close();
    const es = new EventSource(`/api/vibe/capital/${jobId}/events`);
    es.onmessage = (evt) => {
      const j: Job = JSON.parse(evt.data);
      setJob(j);
      if (j.phase === "ready_for_review" && j.draftDocument) {
        setDraftText((prev) => prev || j.draftDocument!);
      }
    };
    es.onerror = () => es.close();
    esRef.current = es;
  }

  async function start() {
    setError(null);
    setStarting(true);
    try {
      const res = await fetch("/api/vibe/capital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start.");
      setDraftText("");
      setJob(data.job);
      streamJob(data.job.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start.");
    } finally {
      setStarting(false);
    }
  }

  async function saveDraft() {
    if (!job) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/vibe/capital/${job.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftDocument: draftText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save.");
      setJob(data.job);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  const busy = !!job && !["saved", "error"].includes(job.phase);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <VibePageHeader
        eyebrow="Vibe Capital"
        title="Research a price, draft it, stop there"
        description="Full autonomy up to the trigger. This researches real market comps and drafts a priced recommendation. It cannot send an invoice, move money, or execute a trade, that stays your hand on the trigger, always, no exceptions built into this page."
      />

      <div className="reveal mt-10 space-y-3" style={{ animationDelay: "220ms" }}>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="What's being priced (e.g. part-time ambassador role, 2 events/mo)"
          disabled={busy}
        />
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Scope of work, results already delivered, any existing draft numbers"
          disabled={busy}
          rows={4}
          className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-lever disabled:opacity-50"
        />
        <Button onClick={start} disabled={starting || !subject.trim() || busy}>
          {starting ? "Starting..." : "Research and draft"}
        </Button>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {job && (
        <div className="mt-10 space-y-8">
          <VibeStatusCard
            label={PHASE_LABEL[job.phase]}
            tone={PHASE_TONE[job.phase]}
            error={job.error}
            log={job.log}
          />

          {job.comps && job.comps.length > 0 && (
            <div className="reveal">
              <p className="label text-lever">Market comps</p>
              <div className="mt-3 space-y-2">
                {job.comps.map((c, i) => (
                  <div
                    key={i}
                    className="group relative overflow-hidden rounded-lg border border-border bg-card p-4"
                  >
                    <span className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-lever transition-transform duration-500 ease-out group-hover:scale-x-100" />
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="text-sm font-medium text-foreground">{c.label}</p>
                      <p className="font-mono text-sm text-foreground">{c.amount}</p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{c.note}</p>
                    {c.source && (
                      <a
                        href={c.source}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block text-xs text-lever underline underline-offset-2"
                      >
                        {c.source}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {job.recommendation && (
            <div className="reveal rounded-lg border border-border bg-card p-5">
              <p className="label text-lever">Recommendation</p>
              <div className="mt-3 space-y-1">
                {job.recommendation.lineItems.map((li, i) => (
                  <div key={i} className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      {li.item} {li.qty ? `(${li.qty})` : ""}
                    </span>
                    <span className="font-mono">{li.amount}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-border pt-2 text-sm font-medium text-foreground">
                  <span>Total</span>
                  <span className="font-mono">{job.recommendation.total}</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{job.recommendation.reasoning}</p>
            </div>
          )}

          {job.openDecisions && job.openDecisions.length > 0 && (
            <div className="reveal rounded-lg border border-lever/40 bg-card p-5">
              <p className="label text-lever">Not a research question, yours to decide</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {job.openDecisions.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}

          {(job.phase === "ready_for_review" || job.phase === "saved") && (
            <div className="reveal">
              <p className="label text-lever">Draft document, edit before saving</p>
              <textarea
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                disabled={job.phase === "saved"}
                rows={14}
                className="mt-3 w-full rounded-md border border-border bg-card px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-lever disabled:opacity-70"
              />
              {job.phase === "ready_for_review" && (
                <Button className="mt-4" onClick={saveDraft} disabled={saving || !draftText.trim()}>
                  {saving ? "Saving..." : "Save draft locally"}
                </Button>
              )}
            </div>
          )}

          {job.phase === "saved" && job.savedPath && (
            <div className="reveal rounded-lg border border-lever/40 bg-card p-5">
              <p className="text-sm text-foreground">
                Saved to <span className="font-mono">{job.savedPath}</span>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Nothing was sent and no money moved. Review it, fill in the open decisions
                above, then send it yourself.
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
