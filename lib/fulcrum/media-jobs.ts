import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

// Fulcrum Media orchestrates the local podcast-pipeline scripts
// (transcribe.py, autoclean.py, cut.py). It cannot run on Vercel: Whisper
// and ffmpeg need a real filesystem and a long-lived process, neither of
// which a serverless function gives you. This is a local-dev-only feature
// by design, same as podcast-pipeline itself.

const PIPELINE_DIR =
  process.env.FULCRUM_PIPELINE_DIR ||
  path.join(process.cwd(), "..", "tools", "podcast-pipeline");
const PYTHON = process.env.FULCRUM_PYTHON || "python";
const JOBS_DIR = path.join(process.cwd(), ".fulcrum", "jobs");

export type JobPhase =
  | "queued"
  | "transcribing"
  | "analyzing"
  | "ready_for_review"
  | "applying_cuts"
  | "done"
  | "error";

export interface FulcrumMediaJob {
  id: string;
  sourcePath: string;
  phase: JobPhase;
  createdAt: string;
  updatedAt: string;
  log: string[];
  error?: string;
  transcriptPath?: string;
  transcriptExcerpt?: string;
  proposedCuts?: Array<{ start: number; end: number; reason: string; context: string }>;
  cutsTotalSeconds?: number;
  sourceDurationSeconds?: number;
  package?: {
    title: string;
    description: string;
    chapters: Array<{ time: string; label: string }>;
  };
  editedPath?: string;
}

function ensureJobsDir() {
  mkdirSync(JOBS_DIR, { recursive: true });
}

export function jobFile(id: string) {
  return path.join(JOBS_DIR, `${id}.json`);
}

function saveJob(job: FulcrumMediaJob) {
  ensureJobsDir();
  job.updatedAt = new Date().toISOString();
  writeFileSync(jobFile(job.id), JSON.stringify(job, null, 2), "utf-8");
}

export function loadJob(id: string): FulcrumMediaJob | null {
  const file = jobFile(id);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf-8"));
}

export function listJobs(): FulcrumMediaJob[] {
  ensureJobsDir();
  return readdirSync(JOBS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(path.join(JOBS_DIR, f), "utf-8")) as FulcrumMediaJob)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function appendLog(job: FulcrumMediaJob, line: string) {
  job.log.push(`[${new Date().toISOString()}] ${line}`);
  saveJob(job);
}

function run(cmd: string, args: string[], onLine?: (line: string) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    // shell: true because Windows' spawn() does not do the PATH resolution
    // a real shell does, "python" alone gives ENOENT without it.
    const child = spawn(cmd, args, { cwd: PIPELINE_DIR, shell: true });
    let stderrTail = "";
    child.stdout.on("data", (d) => onLine?.(d.toString()));
    child.stderr.on("data", (d) => {
      const s = d.toString();
      stderrTail = (stderrTail + s).slice(-4000);
      onLine?.(s);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(" ")} exited ${code}\n${stderrTail}`));
    });
  });
}

/** Starts a job and returns immediately with its id. Work continues in the background. */
export function startMediaJob(sourcePath: string): FulcrumMediaJob {
  if (!existsSync(PIPELINE_DIR)) {
    throw new Error(
      `podcast-pipeline not found at ${PIPELINE_DIR}. Set FULCRUM_PIPELINE_DIR if it lives somewhere else.`
    );
  }
  if (!existsSync(sourcePath)) {
    throw new Error(`source file not found: ${sourcePath}`);
  }

  const job: FulcrumMediaJob = {
    id: randomUUID(),
    sourcePath,
    phase: "queued",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    log: [],
  };
  saveJob(job);

  void processMediaJob(job.id).catch((err) => {
    const j = loadJob(job.id);
    if (j) {
      j.phase = "error";
      j.error = err instanceof Error ? err.message : String(err);
      saveJob(j);
    }
  });

  return job;
}

async function processMediaJob(id: string) {
  let job = loadJob(id);
  if (!job) return;

  const base = path.basename(job.sourcePath).replace(/\.[^.]+$/, "");
  const outDir = path.dirname(job.sourcePath);

  job.phase = "transcribing";
  appendLog(job, `transcribing ${job.sourcePath}`);
  await run(PYTHON, ["transcribe.py", job.sourcePath, "--model", "medium"], (line) =>
    appendLog(job!, line.trim())
  );

  const transcriptJsonPath = path.join(outDir, `${base}.json`);
  const transcript = JSON.parse(readFileSync(transcriptJsonPath, "utf-8"));

  job = loadJob(id)!;
  job.transcriptPath = transcriptJsonPath;
  job.sourceDurationSeconds = transcript.duration;
  job.transcriptExcerpt = transcript.segments
    .slice(0, 40)
    .map((s: { text: string }) => s.text)
    .join(" ")
    .slice(0, 2000);
  saveJob(job);

  job.phase = "analyzing";
  appendLog(job, "proposing mechanical cuts (fillers, gaps, repeats)");
  await run(PYTHON, ["autoclean.py", transcriptJsonPath], (line) => appendLog(job!, line.trim()));

  const cutsPath = path.join(outDir, `${base}.cuts.json`);
  const rawCuts: Array<{ start: number; end: number; reason: string }> = JSON.parse(
    readFileSync(cutsPath, "utf-8")
  );
  const cuts = rawCuts.map((c) => ({ ...c, context: cutContext(transcript, c.start, c.end) }));

  job = loadJob(id)!;
  job.proposedCuts = cuts;
  job.cutsTotalSeconds = cuts.reduce((sum, c) => sum + (c.end - c.start), 0);
  saveJob(job);

  appendLog(job, "generating title, description, and chapters with Claude");
  const pkg = await packageEpisode(transcript, job.sourceDurationSeconds ?? 0, (line) =>
    appendLog(job!, line.trim())
  );
  job = loadJob(id)!;
  job.package = pkg;
  job.phase = "ready_for_review";
  saveJob(job);
  appendLog(job, "ready for review, nothing has been cut or published yet");
}

/** Human-approved step: actually apply the (possibly edited) cut list. Never runs automatically. */
export async function applyMediaJobCuts(
  id: string,
  cuts: Array<{ start: number; end: number; reason: string }>
) {
  const job = loadJob(id);
  if (!job) throw new Error("job not found");
  if (job.phase !== "ready_for_review") {
    throw new Error(`job is in phase ${job.phase}, expected ready_for_review`);
  }

  job.phase = "applying_cuts";
  saveJob(job);
  appendLog(job, `applying ${cuts.length} approved cut(s)`);

  const base = path.basename(job.sourcePath).replace(/\.[^.]+$/, "");
  const outDir = path.dirname(job.sourcePath);
  const cutsForRun = path.join(outDir, `${base}.approved-cuts.json`);
  writeFileSync(cutsForRun, JSON.stringify(cuts, null, 2), "utf-8");

  const ext = job.sourcePath.match(/\.(mp4|mov)$/i) ? "mp4" : "wav";
  const editedPath = path.join(outDir, `${base}.edited.${ext}`);

  await run(
    PYTHON,
    ["cut.py", job.sourcePath, cutsForRun, "--out", editedPath],
    (line) => appendLog(job!, line.trim())
  );

  const finalJob = loadJob(id)!;
  finalJob.editedPath = editedPath;
  finalJob.phase = "done";
  saveJob(finalJob);
  appendLog(finalJob, `done: ${editedPath}`);
  return finalJob;
}

const PACKAGE_SYSTEM_PROMPT =
  "You package podcast episodes. Given a timestamped transcript, return strict JSON only, no prose, no markdown fences: " +
  '{"title": string, "description": string, "chapters": [{"time": "H:MM:SS or MM:SS", "label": string}]}. ' +
  "Chapters mark real topic shifts, not every pause. First chapter starts at 0:00. Titles are plain and specific, no clickbait, no em dashes.";

/**
 * Runs the packaging step through the local `claude` CLI (Adam's own Claude
 * Code subscription), not a metered ANTHROPIC_API_KEY. Same auth this CLI
 * session already has. No tool access: this step is pure text in, text out.
 */
async function packageEpisode(
  transcript: { segments: Array<{ start: number; text: string }>; duration: number },
  durationSeconds: number,
  onLine?: (line: string) => void
): Promise<FulcrumMediaJob["package"]> {
  const fullText = transcript.segments.map((s) => `[${fmt(s.start)}] ${s.text}`).join("\n");
  const truncated = fullText.length > 40000 ? fullText.slice(0, 40000) + "\n...[truncated]" : fullText;
  const prompt = `Duration: ${fmt(durationSeconds)}\n\nTranscript:\n${truncated}`;

  const raw = await runClaude(prompt, PACKAGE_SYSTEM_PROMPT, onLine);
  try {
    return JSON.parse(raw);
  } catch {
    return {
      title: "Untitled episode",
      description: "claude CLI's response was not valid JSON, review manually. Raw: " + raw.slice(0, 500),
      chapters: [{ time: "0:00", label: "Start" }],
    };
  }
}

/**
 * Runs a scoped, tool-free, non-interactive claude CLI call and returns its
 * result text. The system prompt goes through a temp file, not a raw argv
 * value: on Windows, spawn's shell:true joins args into one command string
 * without safely quoting them, and a JSON-shaped prompt full of {, }, ", :
 * gets mangled by that join, which silently breaks the instruction instead
 * of erroring, the CLI just falls back to its normal conversational voice.
 * A file path has none of those characters, so this sidesteps the problem
 * instead of trying to out-escape it.
 */
function runClaude(prompt: string, systemPrompt: string, onLine?: (line: string) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const promptFile = path.join(os.tmpdir(), `fulcrum-media-system-${randomUUID()}.txt`);
    writeFileSync(promptFile, systemPrompt, "utf-8");
    const cleanup = () => {
      try {
        rmSync(promptFile, { force: true });
      } catch {
        // best effort, tmpdir gets cleaned eventually regardless
      }
    };

    const child = spawn(
      "claude",
      [
        "-p",
        "--output-format",
        "json",
        "--system-prompt-file",
        promptFile,
        "--disallowedTools",
        "Bash",
        "Edit",
        "Write",
        "Read",
        "WebFetch",
        "WebSearch",
        "--permission-mode",
        "dontAsk",
      ],
      { shell: true }
    );

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => {
      stderr += d.toString();
      onLine?.(d.toString());
    });
    child.on("error", (err) => {
      cleanup();
      reject(err);
    });
    child.on("close", (code) => {
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

/** Pulls the actual words at and around a proposed cut, so a reviewer sees what's being removed, not just its category. */
function cutContext(
  transcript: { segments: Array<{ words: Array<{ word: string; start: number; end: number }> }> },
  start: number,
  end: number,
  padSeconds = 2
): string {
  const allWords = transcript.segments.flatMap((s) => s.words);
  const before = allWords.filter((w) => w.end <= start && w.end > start - padSeconds).map((w) => w.word);
  const cut = allWords.filter((w) => w.start >= start && w.end <= end + 0.05).map((w) => w.word);
  const after = allWords.filter((w) => w.start >= end && w.start < end + padSeconds).map((w) => w.word);
  return `${before.join(" ")} [[${cut.join(" ")}]] ${after.join(" ")}`.trim();
}

function fmt(seconds: number): string {
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}
