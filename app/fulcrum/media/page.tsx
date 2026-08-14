"use client";

import { useEffect, useRef, useState } from "react";

import { ApprovalCard } from "@/components/fulcrum/approval-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Cut {
  start: number;
  end: number;
  reason: string;
  context: string;
}

interface Job {
  id: string;
  sourcePath: string;
  phase:
    | "queued"
    | "transcribing"
    | "analyzing"
    | "ready_for_review"
    | "applying_cuts"
    | "done"
    | "error";
  createdAt: string;
  log: string[];
  error?: string;
  transcriptExcerpt?: string;
  proposedCuts?: Cut[];
  cutsTotalSeconds?: number;
  sourceDurationSeconds?: number;
  package?: {
    title: string;
    description: string;
    chapters: Array<{ time: string; label: string }>;
  };
  editedPath?: string;
}

const PHASE_LABEL: Record<Job["phase"], string> = {
  queued: "Queued",
  transcribing: "Transcribing (local Whisper)",
  analyzing: "Analyzing (cuts + packaging)",
  ready_for_review: "Ready for your review",
  applying_cuts: "Applying approved cuts",
  done: "Done",
  error: "Error",
};

function fmtDuration(seconds?: number) {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function cutKey(c: Cut) {
  return `${c.start}-${c.end}`;
}

export default function FulcrumMediaPage() {
  const [sourcePath, setSourcePath] = useState("");
  const [job, setJob] = useState<Job | null>(null);
  const [decisions, setDecisions] = useState<Record<string, "approved" | "skipped">>({});
  const [starting, setStarting] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    return () => esRef.current?.close();
  }, []);

  function streamJob(jobId: string) {
    esRef.current?.close();
    const es = new EventSource(`/api/fulcrum/media/${jobId}/events`);
    es.onmessage = (evt) => {
      const j: Job = JSON.parse(evt.data);
      setJob(j);
      // default every newly-seen cut to pending, without clobbering a decision already made
      if (j.proposedCuts) {
        setDecisions((prev) => {
          const next = { ...prev };
          for (const c of j.proposedCuts!) {
            if (!(cutKey(c) in next)) next[cutKey(c)] = "approved"; // mechanical proposals default on, still one click to reject
          }
          return next;
        });
      }
    };
    es.onerror = () => es.close();
    esRef.current = es;
  }

  async function start() {
    setError(null);
    setStarting(true);
    try {
      const res = await fetch("/api/fulcrum/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourcePath }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start.");
      setDecisions({});
      setJob(data.job);
      streamJob(data.job.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start.");
    } finally {
      setStarting(false);
    }
  }

  async function apply() {
    if (!job?.proposedCuts) return;
    const approvedCuts = job.proposedCuts.filter((c) => decisions[cutKey(c)] === "approved");
    setApplying(true);
    setError(null);
    try {
      const res = await fetch(`/api/fulcrum/media/${job.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cuts: approvedCuts }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to apply.");
      setJob(data.job);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply.");
    } finally {
      setApplying(false);
    }
  }

  const approvedCount = job?.proposedCuts?.filter((c) => decisions[cutKey(c)] === "approved").length ?? 0;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-lever">Fulcrum Media</p>
      <h1 className="mt-3 text-3xl font-semibold text-foreground">
        Transcribe, cut, and package an episode
      </h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        Local only. This runs the podcast-pipeline scripts on your machine,
        Whisper does not run on the deployed site. Nothing is cut or
        published until you approve it below.
      </p>

      <div className="mt-10 flex gap-3">
        <Input
          value={sourcePath}
          onChange={(e) => setSourcePath(e.target.value)}
          placeholder="C:\path\to\episode.mp4"
          disabled={!!job && job.phase !== "done" && job.phase !== "error"}
        />
        <Button
          onClick={start}
          disabled={starting || !sourcePath.trim() || (!!job && !["done", "error"].includes(job.phase))}
        >
          {starting ? "Starting..." : "Analyze"}
        </Button>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {job && (
        <div className="mt-10 space-y-8">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {PHASE_LABEL[job.phase]}
              </span>
              {job.sourceDurationSeconds ? (
                <span className="font-mono text-xs text-muted-foreground">
                  {fmtDuration(job.sourceDurationSeconds)}
                </span>
              ) : null}
            </div>
            {job.error && <p className="mt-2 text-sm text-destructive">{job.error}</p>}
            <pre className="mt-3 max-h-40 overflow-y-auto whitespace-pre-wrap text-xs text-muted-foreground">
              {job.log.slice(-12).join("\n")}
            </pre>
          </div>

          {job.package && (
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-lever">Title</p>
              <p className="mt-1 text-lg text-foreground">{job.package.title}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-lever">
                Description
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {job.package.description}
              </p>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-lever">
                Chapters
              </p>
              <ul className="mt-1 space-y-1 font-mono text-sm text-muted-foreground">
                {job.package.chapters.map((c, i) => (
                  <li key={i}>
                    {c.time} {c.label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {job.proposedCuts && job.proposedCuts.length > 0 && (
            <div>
              <div className="flex items-baseline justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-lever">
                  Proposed cuts, one card each, review and decide
                </p>
                <span className="font-mono text-xs text-muted-foreground">
                  {approvedCount}/{job.proposedCuts.length} approved
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {job.proposedCuts.map((cut) => {
                  const key = cutKey(cut);
                  const [pre, rest] = cut.context.split("[[");
                  const [removed, post] = (rest ?? "").split("]]");
                  return (
                    <ApprovalCard
                      key={key}
                      title={cut.reason}
                      subtitle={`${fmtDuration(cut.start)}–${fmtDuration(cut.end)}, ${(cut.end - cut.start).toFixed(1)}s`}
                      status={decisions[key] ?? "approved"}
                      disabled={job.phase !== "ready_for_review"}
                      onApprove={() => setDecisions((d) => ({ ...d, [key]: "approved" }))}
                      onSkip={() => setDecisions((d) => ({ ...d, [key]: "skipped" }))}
                      body={
                        <span>
                          {pre}
                          <span className="rounded bg-destructive/20 px-1 text-destructive line-through">
                            {removed}
                          </span>
                          {post}
                        </span>
                      }
                    />
                  );
                })}
              </div>
              {job.phase === "ready_for_review" && (
                <Button className="mt-5" onClick={apply} disabled={applying}>
                  {applying ? "Applying..." : `Apply ${approvedCount} approved cut${approvedCount === 1 ? "" : "s"}`}
                </Button>
              )}
            </div>
          )}

          {job.phase === "done" && job.editedPath && (
            <div className="rounded-lg border border-lever/40 bg-card p-5">
              <p className="text-sm text-foreground">
                Edited file ready: <span className="font-mono">{job.editedPath}</span>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Nothing was published. Review it, then upload it yourself,
                same as every episode this season.
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
