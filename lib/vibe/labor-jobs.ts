import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

// Vibe Labor, the AI-labor half of the spec (the human-hiring half, job
// post and screening-criteria drafting that stops short of an actual hire,
// is not built yet, see VIBE.md). This is the one lever where the idea
// maze this session ran concluded the live path isn't a product at all:
// "AI employee" SaaS (Lindy, 11x, Artisan) is already funded and crowded,
// the open branch is using a personal agent fleet harder, exactly the
// pattern this file automates. Take a recurring task, decompose it into a
// small number of genuinely independent subtasks, run them in parallel
// through the local `claude` CLI, then synthesize the results into one
// report. Same subscription-powered CLI as Media, Code, and Capital, not a
// metered ANTHROPIC_API_KEY.
//
// This closes fully autonomous, on purpose: unlike Capital, nothing here
// moves money or sends anything external, the fleet only researches and
// reports, so there is no trigger step to gate behind a human hand. The
// worker tool set (WebSearch, WebFetch, Read, Glob, Grep) has no ability
// to mutate anything either, mutation is Vibe Code's job, already
// scoped and gated there.

const JOBS_DIR = path.join(process.cwd(), ".vibe", "labor-jobs");
const MAX_SUBTASKS = 5;

export type LaborJobPhase = "queued" | "planning" | "running" | "synthesizing" | "done" | "error";
export type SubtaskStatus = "queued" | "running" | "done" | "error";

export interface LaborSubtask {
  id: string;
  label: string;
  prompt: string;
  status: SubtaskStatus;
  result?: string;
  error?: string;
}

export interface VibeLaborJob {
  id: string;
  task: string;
  phase: LaborJobPhase;
  createdAt: string;
  updatedAt: string;
  log: string[];
  error?: string;
  subtasks?: LaborSubtask[];
  report?: string;
}

function ensureJobsDir() {
  mkdirSync(JOBS_DIR, { recursive: true });
}

export function jobFile(id: string) {
  return path.join(JOBS_DIR, `${id}.json`);
}

function saveJob(job: VibeLaborJob) {
  ensureJobsDir();
  job.updatedAt = new Date().toISOString();
  writeFileSync(jobFile(job.id), JSON.stringify(job, null, 2), "utf-8");
}

export function loadJob(id: string): VibeLaborJob | null {
  const file = jobFile(id);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf-8"));
}

export function listJobs(): VibeLaborJob[] {
  ensureJobsDir();
  return readdirSync(JOBS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(path.join(JOBS_DIR, f), "utf-8")) as VibeLaborJob)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function appendLog(job: VibeLaborJob, line: string) {
  job.log.push(`[${new Date().toISOString()}] ${line}`);
  saveJob(job);
}

/**
 * Loads, mutates, and saves in one synchronous pass (no `await` between
 * read and write), so concurrent subtasks finishing near-simultaneously
 * each get an atomic slice of the event loop instead of racing and
 * clobbering each other's update. All fs calls here are the sync variants
 * on purpose, that's what makes this safe.
 */
function updateSubtask(jobId: string, subtaskId: string, patch: Partial<LaborSubtask>) {
  const job = loadJob(jobId);
  if (!job || !job.subtasks) return;
  const st = job.subtasks.find((s) => s.id === subtaskId);
  if (!st) return;
  Object.assign(st, patch);
  saveJob(job);
}

/** Starts a job and returns immediately. Planning, the fleet, and synthesis all continue in the background. */
export function startLaborJob(task: string): VibeLaborJob {
  const job: VibeLaborJob = {
    id: randomUUID(),
    task,
    phase: "queued",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    log: [],
  };
  saveJob(job);

  void processLaborJob(job.id).catch((err) => {
    const j = loadJob(job.id);
    if (j) {
      j.phase = "error";
      j.error = err instanceof Error ? err.message : String(err);
      saveJob(j);
    }
  });

  return job;
}

const PLANNER_SYSTEM_PROMPT = `You are Vibe Labor's planner. Given a recurring task someone currently
does by hand, decompose it into 3 to 5 independent, genuinely parallelizable subtasks that together
cover the whole task. Each subtask must be self-contained: a worker given only that one subtask's
prompt, with no visibility into the others, must be able to complete it fully on its own. Do not create
a subtask that depends on another subtask's output. Return strict JSON only, no prose, no markdown
fences: {"subtasks": [{"label": string, "prompt": string}]}. 3 to 5 items.`;

const WORKER_SYSTEM_PROMPT = `You are one worker in a small AI agent fleet handling one scoped piece of
a larger recurring task. Do exactly the subtask given to you, nothing more. You may use WebSearch,
WebFetch, Read, Glob, and Grep to research or gather real information. You have no ability to edit,
write, publish, or execute anything, and must never claim to have changed, sent, or published
anything. Return a clear, well-organized plain-text report of what you found or produced for this one
subtask.`;

const SYNTHESIS_SYSTEM_PROMPT = `You are Vibe Labor's synthesizer. You are given the original
recurring task and the reports from several independent workers who each handled one piece of it in
parallel. Combine them into one clear, organized report a human can read in place of having done the
entire task by hand. Reconcile contradictions between workers rather than listing both silently.
Explicitly flag anything that still needs a human's judgment call, decision, or action, do not imply
the task is fully finished if part of it genuinely is not. Plain markdown, no surrounding code fence.`;

async function processLaborJob(id: string) {
  let job = loadJob(id);
  if (!job) return;

  job.phase = "planning";
  appendLog(job, "planning: decomposing the task into independent subtasks");

  const planRaw = await runClaudeText(
    PLANNER_SYSTEM_PROMPT,
    job.task,
    [],
    (line) => appendLog(loadJob(id)!, line.trim())
  );

  let plan: { subtasks?: Array<{ label: string; prompt: string }> };
  try {
    plan = JSON.parse(planRaw);
  } catch {
    job = loadJob(id)!;
    job.phase = "error";
    job.error = "claude CLI's planning response was not valid JSON, review manually. Raw: " + planRaw.slice(0, 500);
    saveJob(job);
    return;
  }

  const planned = (plan.subtasks ?? []).slice(0, MAX_SUBTASKS);
  if (planned.length === 0) {
    job = loadJob(id)!;
    job.phase = "error";
    job.error = "planner returned zero subtasks, nothing to run.";
    saveJob(job);
    return;
  }

  job = loadJob(id)!;
  job.subtasks = planned.map((s) => ({
    id: randomUUID(),
    label: s.label,
    prompt: s.prompt,
    status: "queued" as SubtaskStatus,
  }));
  job.phase = "running";
  saveJob(job);
  appendLog(job, `fleet of ${job.subtasks.length}, running in parallel`);

  await Promise.all(
    job.subtasks.map(async (subtask) => {
      updateSubtask(id, subtask.id, { status: "running" });
      try {
        const result = await runClaudeText(
          WORKER_SYSTEM_PROMPT,
          subtask.prompt,
          ["WebSearch", "WebFetch", "Read", "Glob", "Grep"],
          (line) => appendLog(loadJob(id)!, `[${subtask.label}] ${line.trim()}`)
        );
        updateSubtask(id, subtask.id, { status: "done", result });
      } catch (err) {
        updateSubtask(id, subtask.id, {
          status: "error",
          error: err instanceof Error ? err.message : String(err),
        });
      }
    })
  );

  job = loadJob(id)!;
  job.phase = "synthesizing";
  appendLog(job, "synthesizing fleet results into one report");

  const combined = job
    .subtasks!.map((s) =>
      s.status === "done"
        ? `## ${s.label}\n${s.result}`
        : `## ${s.label}\n[worker failed: ${s.error}]`
    )
    .join("\n\n");
  const synthesisInput = `Original task: ${job.task}\n\nWorker reports:\n\n${combined}`;

  const report = await runClaudeText(
    SYNTHESIS_SYSTEM_PROMPT,
    synthesisInput,
    [],
    (line) => appendLog(loadJob(id)!, line.trim())
  );

  job = loadJob(id)!;
  job.report = report;
  job.phase = "done";
  saveJob(job);
  appendLog(job, "done, review the report below");
}

// A live run exposed the failure mode a timeout-free fleet has: one worker
// ran long past the other three with nothing to show for it (unclear
// whether it was genuinely still searching or wedged), and with no cap,
// Promise.all just waits forever, so the whole job, and the synthesis step
// after it, never completes. A single slow subtask silently defeats the
// entire "closes fully autonomous" point of this agent, so every call gets
// a hard ceiling: on timeout the child is killed outright (no orphaned
// process burning plan usage in the background) and that one call fails,
// which the worker path already treats as a per-subtask error, not a
// job-wide one.
const TOOL_CALL_TIMEOUT_MS = 4 * 60 * 1000; // workers: web search takes real time
const TEXT_CALL_TIMEOUT_MS = 90 * 1000; // planner/synthesizer: no tools, should be fast

/**
 * Same temp-file system-prompt pattern as every other Vibe agent, for
 * the same reason: shell:true joins argv into one string without safe
 * quoting on Windows, and a long system prompt full of punctuation risks
 * being mangled by that join. `allowedTools` empty means a pure text-in,
 * text-out call (the planner and synthesizer); non-empty grants exactly
 * those tools and denies every other tool by name (the worker).
 */
function runClaudeText(
  systemPrompt: string,
  prompt: string,
  allowedTools: string[],
  onLine?: (line: string) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const promptFile = path.join(os.tmpdir(), `vibe-labor-system-${randomUUID()}.txt`);
    writeFileSync(promptFile, systemPrompt, "utf-8");
    let settled = false;
    const cleanup = () => {
      try {
        rmSync(promptFile, { force: true });
      } catch {
        // best effort, tmpdir gets cleaned eventually regardless
      }
    };

    const ALL_TOOLS = ["Bash", "Edit", "Write", "Read", "Glob", "Grep", "WebFetch", "WebSearch"];
    const disallowed = ALL_TOOLS.filter((t) => !allowedTools.includes(t));

    const args = [
      "-p",
      "--output-format",
      "json",
      "--system-prompt-file",
      promptFile,
      "--disallowedTools",
      ...disallowed,
      "--permission-mode",
      allowedTools.length > 0 ? "bypassPermissions" : "dontAsk",
    ];
    if (allowedTools.length > 0) args.push("--allowedTools", ...allowedTools);

    const child = spawn("claude", args, { cwd: process.cwd(), shell: true });

    const timeoutMs = allowedTools.length > 0 ? TOOL_CALL_TIMEOUT_MS : TEXT_CALL_TIMEOUT_MS;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill();
      cleanup();
      reject(new Error(`claude CLI timed out after ${Math.round(timeoutMs / 1000)}s, killed`));
    }, timeoutMs);

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => {
      stderr += d.toString();
      onLine?.(d.toString());
    });
    child.on("error", (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cleanup();
      reject(err);
    });
    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cleanup();
      if (code !== 0) {
        reject(new Error(`claude CLI exited ${code}: ${stderr.slice(-2000)}`));
        return;
      }
      try {
        const parsed = JSON.parse(stdout);
        if (parsed.is_error) {
          reject(new Error(`claude CLI reported an error: ${JSON.stringify(parsed).slice(0, 500)}`));
          return;
        }
        if (parsed.total_cost_usd != null) {
          onLine?.(`claude CLI usage cost: $${parsed.total_cost_usd.toFixed(4)} (against your plan)`);
        }
        resolve(String(parsed.result ?? ""));
      } catch {
        reject(new Error(`could not parse claude CLI output: ${stdout.slice(-2000)}`));
      }
    });

    child.stdin.write(prompt);
    child.stdin.end();
  });
}
