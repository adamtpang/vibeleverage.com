"use client";

import { useEffect, useRef, useState } from "react";

import { ApprovalCard } from "@/components/fulcrum/approval-card";
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

export default function FulcrumCodePage() {
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
    const es = new EventSource(`/api/fulcrum/code/${jobId}/events`);
    es.onmessage = (evt) => setJob(JSON.parse(evt.data));
    es.onerror = () => es.close();
    esRef.current = es;
  }

  async function start() {
    setError(null);
    setStarting(true);
    try {
      const res = await fetch("/api/fulcrum/code", {
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
      const res = await fetch(`/api/fulcrum/code/${job.id}`, { method: "POST" });
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
      <p className="text-xs uppercase tracking-[0.3em] text-lever">Fulcrum Code</p>
      <h1 className="mt-3 text-3xl font-semibold text-foreground">
        Give it a task, review the diff, approve the merge
      </h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        Local only. Runs on a fresh git branch, never main. Nothing is
        pushed or deployed, ever, from here, those stay separate, manual,
        explicit steps.
      </p>

      <div className="mt-10 space-y-3">
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
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{PHASE_LABEL[job.phase]}</span>
              {job.branch && (
                <span className="font-mono text-xs text-muted-foreground">{job.branch}</span>
              )}
            </div>
            {job.error && <p className="mt-2 text-sm text-destructive">{job.error}</p>}
            <pre className="mt-3 max-h-48 overflow-y-auto whitespace-pre-wrap text-xs text-muted-foreground">
              {job.log.slice(-12).join("\n")}
            </pre>
          </div>

          {job.diff && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-lever">
                Review, then decide
              </p>
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
            <div className="rounded-lg border border-lever/40 bg-card p-5">
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
