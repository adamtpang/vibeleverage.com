"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

interface Subtask {
  id: string;
  label: string;
  prompt: string;
  status: "queued" | "running" | "done" | "error";
  result?: string;
  error?: string;
}

interface Job {
  id: string;
  task: string;
  phase: "queued" | "planning" | "running" | "synthesizing" | "done" | "error";
  log: string[];
  error?: string;
  subtasks?: Subtask[];
  report?: string;
}

const PHASE_LABEL: Record<Job["phase"], string> = {
  queued: "Queued",
  planning: "Planning (decomposing into subtasks)",
  running: "Fleet running in parallel",
  synthesizing: "Synthesizing results into one report",
  done: "Done",
  error: "Error",
};

const STATUS_DOT: Record<Subtask["status"], string> = {
  queued: "bg-muted-foreground/40",
  running: "bg-lever animate-pulse",
  done: "bg-lever",
  error: "bg-destructive",
};

export default function FulcrumLaborPage() {
  const [task, setTask] = useState("");
  const [job, setJob] = useState<Job | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    return () => esRef.current?.close();
  }, []);

  function streamJob(jobId: string) {
    esRef.current?.close();
    const es = new EventSource(`/api/fulcrum/labor/${jobId}/events`);
    es.onmessage = (evt) => setJob(JSON.parse(evt.data));
    es.onerror = () => es.close();
    esRef.current = es;
  }

  async function start() {
    setError(null);
    setStarting(true);
    try {
      const res = await fetch("/api/fulcrum/labor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start.");
      setJob(data.job);
      streamJob(data.job.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start.");
    } finally {
      setStarting(false);
    }
  }

  const busy = !!job && !["done", "error"].includes(job.phase);
  const doneCount = job?.subtasks?.filter((s) => s.status === "done" || s.status === "error").length ?? 0;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-lever">Fulcrum Labor</p>
      <h1 className="mt-3 text-3xl font-semibold text-foreground">
        A small agent fleet, one recurring task
      </h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        Decomposes a recurring task into a few independent subtasks, runs them in
        parallel, synthesizes one report. Research and analysis only, nothing here
        edits, writes, or executes. The human-hiring half of this lever, real job
        posts and screening, is still spec-only, not built yet.
      </p>

      <div className="mt-10 space-y-3">
        <textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="A recurring task you currently do by hand, e.g. 'survey how N competitors price X'"
          disabled={busy}
          rows={4}
          className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-lever disabled:opacity-50"
        />
        <Button onClick={start} disabled={starting || !task.trim() || busy}>
          {starting ? "Starting..." : "Plan and run the fleet"}
        </Button>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {job && (
        <div className="mt-10 space-y-8">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{PHASE_LABEL[job.phase]}</span>
              {job.subtasks && (
                <span className="font-mono text-xs text-muted-foreground">
                  {doneCount}/{job.subtasks.length} workers finished
                </span>
              )}
            </div>
            {job.error && <p className="mt-2 text-sm text-destructive">{job.error}</p>}
            <pre className="mt-3 max-h-40 overflow-y-auto whitespace-pre-wrap text-xs text-muted-foreground">
              {job.log.slice(-14).join("\n")}
            </pre>
          </div>

          {job.subtasks && job.subtasks.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-lever">
                The fleet, {job.subtasks.length} worker{job.subtasks.length === 1 ? "" : "s"}
              </p>
              <div className="mt-3 space-y-2">
                {job.subtasks.map((s) => (
                  <div key={s.id} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${STATUS_DOT[s.status]}`} />
                      <p className="text-sm font-medium text-foreground">{s.label}</p>
                    </div>
                    {s.status === "done" && s.result && (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                        {s.result}
                      </p>
                    )}
                    {s.status === "error" && (
                      <p className="mt-2 text-sm text-destructive">{s.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {job.phase === "done" && job.report && (
            <div className="rounded-lg border border-lever/40 bg-card p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-lever">Synthesized report</p>
              <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                {job.report}
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
