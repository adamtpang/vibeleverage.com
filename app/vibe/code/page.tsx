"use client";

import { useEffect, useRef, useState } from "react";

import { ApprovalCard } from "@/components/vibe/approval-card";
import { VibePageHeader } from "@/components/vibe/page-header";
import { VibeStatusCard } from "@/components/vibe/status-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Job {
  id: string;
  repoPath: string;
  task: string;
  branch: string;
  baseBranch: string;
  phase: "queued" | "working" | "ready_for_review" | "merged" | "error";
  log: string[];
  error?: string;
  diff?: string;
  commits?: string[];
  filesChanged?: string[];
}

const PHASE_LABEL: Record<Job["phase"], string> = {
  queued: "Queued",
  working: "Working (claude, on a fresh branch)",
  ready_for_review: "Ready for your review",
  merged: "Merged locally",
  error: "Error",
};

const PHASE_TONE: Record<Job["phase"], "active" | "done" | "error"> = {
  queued: "active",
  working: "active",
  ready_for_review: "done",
  merged: "done",
  error: "error",
};

export default function VibeCodePage() {
  const [repoPath, setRepoPath] = useState("");
  const [task, setTask] = useState("");
  const [job, setJob] = useState<Job | null>(null);
  const [mergeDecision, setMergeDecision] = useState<"approved" | "skipped">("approved");
  const [starting, setStarting] = useState(false);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    return () => esRef.current?.close();
  }, []);

  function streamJob(jobId: string) {
    esRef.current?.close();
    const es = new EventSource(`/api/vibe/code/${jobId}/events`);
    es.onmessage = (evt) => setJob(JSON.parse(evt.data));
    es.onerror = () => es.close();
    esRef.current = es;
  }

  async function start() {
    setError(null);
    setStarting(true);
    try {
      const res = await fetch("/api/vibe/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoPath, task }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start.");
      setMergeDecision("approved");
      setJob(data.job);
      streamJob(data.job.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start.");
    } finally {
      setStarting(false);
    }
  }

  async function merge() {
    if (!job) return;
    setMerging(true);
    setError(null);
    try {
      const res = await fetch(`/api/vibe/code/${job.id}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to merge.");
      setJob(data.job);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to merge.");
    } finally {
      setMerging(false);
    }
  }

  const busy = !!job && !["ready_for_review", "merged", "error"].includes(job.phase);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <VibePageHeader
        eyebrow="Vibe Code"
        title="Give it a task, review the diff, approve the merge"
        description="Local only. Runs on a fresh git branch, never main. Nothing is pushed or deployed, ever, from here, those stay separate, manual, explicit steps."
      />

      <div className="reveal mt-10 space-y-3" style={{ animationDelay: "220ms" }}>
        <Input
          value={repoPath}
          onChange={(e) => setRepoPath(e.target.value)}
          placeholder="C:\path\to\a-git-repo"
          disabled={busy}
        />
        <Input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Ship one automation that does a recurring task without you"
          disabled={busy}
        />
        <Button onClick={start} disabled={starting || busy || !repoPath.trim() || !task.trim()}>
          {starting ? "Starting..." : "Run"}
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
            meta={
              job.branch ? (
                <span className="font-mono text-xs text-muted-foreground">{job.branch}</span>
              ) : null
            }
          />

          {job.diff && (
            <div className="reveal">
              <p className="label mb-2 text-lever">Review, then decide</p>
              <ApprovalCard
                title={`Merge into ${job.baseBranch} (local only, never pushed)`}
                subtitle={`${job.commits?.length ?? 0} commit(s), ${job.filesChanged?.length ?? 0} file(s) changed`}
                status={job.phase === "merged" ? "approved" : mergeDecision}
                disabled={job.phase !== "ready_for_review"}
                onApprove={() => setMergeDecision("approved")}
                onSkip={() => setMergeDecision("skipped")}
                body={
                  <pre className="mt-1 max-h-80 overflow-y-auto whitespace-pre-wrap font-mono text-xs">
                    {job.diff}
                  </pre>
                }
              />
              {job.phase === "ready_for_review" && mergeDecision === "approved" && (
                <Button className="mt-4" onClick={merge} disabled={merging}>
                  {merging ? "Merging..." : `Merge into ${job.baseBranch}`}
                </Button>
              )}
            </div>
          )}

          {job.phase === "merged" && (
            <div className="reveal rounded-lg border border-lever/40 bg-card p-5">
              <p className="text-sm text-foreground">
                Merged into <span className="font-mono">{job.baseBranch}</span>, locally.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Not pushed, not deployed. Review the history, then push and
                deploy yourself when you are ready.
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
