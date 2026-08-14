import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

// Fulcrum Code: run it, read the error, fix it, run it again, the same
// loop that makes me (Claude Code) able to act instead of just answer.
// Powered by the local `claude` CLI, Adam's own subscription, not a
// metered ANTHROPIC_API_KEY, same pattern as Fulcrum Media.
//
// The "sandbox" here is not a hardware sandbox (no E2B, no Vercel Sandbox,
// that is real future work, not invented and claimed today). The real
// containment is: a fresh git branch, never main; --add-dir scoping the
// agent's file tools to exactly the one repo it was pointed at; and a
// human-approved merge before anything touches the base branch. Nothing
// is ever pushed or deployed by this code, that stays a separate, manual,
// explicit action, same as every "upload to YouTube" step this season.

const JOBS_DIR = path.join(process.cwd(), ".fulcrum", "code-jobs");

export type CodeJobPhase = "queued" | "working" | "ready_for_review" | "merged" | "error";

export interface FulcrumCodeJob {
  id: string;
  repoPath: string;
  task: string;
  branch: string;
  baseBranch: string;
  phase: CodeJobPhase;
  createdAt: string;
  updatedAt: string;
  log: string[];
  error?: string;
  diff?: string;
  commits?: string[];
  filesChanged?: string[];
}

function ensureJobsDir() {
  mkdirSync(JOBS_DIR, { recursive: true });
}
export function jobFile(id: string) {
  return path.join(JOBS_DIR, `${id}.json`);
}
function saveJob(job: FulcrumCodeJob) {
  ensureJobsDir();
  job.updatedAt = new Date().toISOString();
  writeFileSync(jobFile(job.id), JSON.stringify(job, null, 2), "utf-8");
}
export function loadJob(id: string): FulcrumCodeJob | null {
  const file = jobFile(id);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf-8"));
}
export function listJobs(): FulcrumCodeJob[] {
  ensureJobsDir();
  return readdirSync(JOBS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(path.join(JOBS_DIR, f), "utf-8")) as FulcrumCodeJob)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
function appendLog(job: FulcrumCodeJob, line: string) {
  job.log.push(`[${new Date().toISOString()}] ${line}`);
  saveJob(job);
}

/**
 * Runs a git command whose message argument may contain spaces or colons
 * (a commit/merge message) via `-F <tempfile>` instead of `-m "<message>"`.
 * shell:true joins argv into one string without quoting on Windows, so any
 * multi-word arg risks being split apart or, worse, having a colon parsed
 * as a git refspec separator, exactly what broke the first version of this
 * merge call. A file path has none of those characters to mangle.
 */
async function runGitWithMessage(
  gitArgsBeforeMessage: string[],
  message: string,
  cwd: string,
  onLine?: (l: string) => void
): Promise<string> {
  const msgFile = path.join(os.tmpdir(), `fulcrum-code-msg-${randomUUID()}.txt`);
  writeFileSync(msgFile, message, "utf-8");
  try {
    return await run("git", [...gitArgsBeforeMessage, "-F", msgFile], cwd, onLine);
  } finally {
    try {
      rmSync(msgFile, { force: true });
    } catch {
      // best effort
    }
  }
}

function run(cmd: string, args: string[], cwd: string, onLine?: (l: string) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, shell: true });
    let stdout = "";
    let stderrTail = "";
    child.stdout.on("data", (d) => {
      stdout += d.toString();
      onLine?.(d.toString());
    });
    child.stderr.on("data", (d) => {
      const s = d.toString();
      stderrTail = (stderrTail + s).slice(-4000);
      onLine?.(s);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`${cmd} ${args.join(" ")} exited ${code}\n${stderrTail}`));
    });
  });
}

/** Starts a code job and returns immediately. Work continues in the background. */
export function startCodeJob(repoPath: string, task: string): FulcrumCodeJob {
  if (!existsSync(path.join(repoPath, ".git"))) {
    throw new Error(`${repoPath} is not a git repo (no .git found). Fulcrum Code only works inside git.`);
  }

  const job: FulcrumCodeJob = {
    id: randomUUID(),
    repoPath,
    task,
    branch: `fulcrum/code-${randomUUID().slice(0, 8)}`,
    baseBranch: "",
    phase: "queued",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    log: [],
  };
  saveJob(job);

  void processCodeJob(job.id).catch((err) => {
    const j = loadJob(job.id);
    if (j) {
      j.phase = "error";
      j.error = err instanceof Error ? err.message : String(err);
      saveJob(j);
    }
  });

  return job;
}

const CODE_SYSTEM_PROMPT = `You are Fulcrum Code, a scoped coding agent. You have been given one task
in one repository. Do exactly that task, nothing more:
- Do not touch files outside what the task requires.
- Do not push, deploy, or run destructive git commands (reset --hard, force push).
- Commit your work locally with a clear message when the task is complete.
- If the task genuinely cannot be completed, say so clearly in your final message and commit nothing.
- Never invent scope. If the task is ambiguous, make the smallest reasonable interpretation and note the assumption in your commit message.`;

async function processCodeJob(id: string) {
  let job = loadJob(id);
  if (!job) return;

  const status = await run("git", ["status", "--porcelain"], job.repoPath);
  if (status.trim().length > 0) {
    throw new Error(
      `${job.repoPath} has uncommitted changes. Fulcrum Code refuses to start on a dirty tree, commit or stash first.`
    );
  }

  const baseBranch = (
    await run("git", ["rev-parse", "--abbrev-ref", "HEAD"], job.repoPath)
  ).trim();
  job.baseBranch = baseBranch;
  saveJob(job);
  appendLog(job, `base branch: ${baseBranch}`);

  job.phase = "working";
  appendLog(job, `creating branch ${job.branch}`);
  await run("git", ["checkout", "-b", job.branch], job.repoPath);

  appendLog(job, `running claude on task: ${job.task}`);
  await runClaudeCoding(job.repoPath, job.task, (line) => appendLog(job!, line.trim()));

  const afterStatus = await run("git", ["status", "--porcelain"], job.repoPath);
  if (afterStatus.trim().length > 0) {
    appendLog(job, "claude left uncommitted changes, committing them now");
    await run("git", ["add", "-A"], job.repoPath);
    await runGitWithMessage(["commit"], `Fulcrum Code: ${job.task}`, job.repoPath);
  }

  const commitsRaw = await run(
    "git",
    ["log", "--oneline", `${baseBranch}..${job.branch}`],
    job.repoPath
  );
  const diff = await run("git", ["diff", `${baseBranch}...${job.branch}`], job.repoPath);
  const filesRaw = await run(
    "git",
    ["diff", "--name-only", `${baseBranch}...${job.branch}`],
    job.repoPath
  );

  job = loadJob(id)!;
  job.commits = commitsRaw.trim() ? commitsRaw.trim().split("\n") : [];
  job.diff = diff;
  job.filesChanged = filesRaw.trim() ? filesRaw.trim().split("\n") : [];
  job.phase = job.commits.length > 0 ? "ready_for_review" : "error";
  if (job.commits.length === 0) job.error = "No commits were made, claude did not complete the task.";
  saveJob(job);
  appendLog(job, job.commits.length > 0 ? "ready for review, nothing merged to " + baseBranch + " yet" : "no changes made");
}

/** Human-approved step: merge the reviewed branch into the base branch, locally only. Never pushes. */
export async function mergeCodeJob(id: string): Promise<FulcrumCodeJob> {
  const job = loadJob(id);
  if (!job) throw new Error("job not found");
  if (job.phase !== "ready_for_review") {
    throw new Error(`job is in phase ${job.phase}, expected ready_for_review`);
  }

  appendLog(job, `merging ${job.branch} into ${job.baseBranch} (local only, not pushed)`);
  await run("git", ["checkout", job.baseBranch], job.repoPath);
  await runGitWithMessage(
    ["merge", "--no-ff", job.branch],
    `Merge ${job.branch}: ${job.task}`,
    job.repoPath
  );

  const finalJob = loadJob(id)!;
  finalJob.phase = "merged";
  saveJob(finalJob);
  appendLog(
    finalJob,
    `merged locally into ${job.baseBranch}. Push and deploy are separate, manual, explicit steps, not automated here.`
  );
  return finalJob;
}

function runClaudeCoding(cwd: string, task: string, onLine?: (line: string) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const promptFile = path.join(os.tmpdir(), `fulcrum-code-system-${randomUUID()}.txt`);
    writeFileSync(promptFile, CODE_SYSTEM_PROMPT, "utf-8");
    const cleanup = () => {
      try {
        rmSync(promptFile, { force: true });
      } catch {
        // best effort
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
        "--add-dir",
        cwd,
        "--allowedTools",
        "Bash",
        "Edit",
        "Write",
        "Read",
        "Glob",
        "Grep",
        "--disallowedTools",
        "WebFetch",
        "WebSearch",
        "--permission-mode",
        "bypassPermissions",
      ],
      { cwd, shell: true }
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
        if (parsed.result) onLine?.(String(parsed.result).slice(0, 1000));
        resolve();
      } catch {
        reject(new Error(`could not parse claude CLI output: ${stdout.slice(-2000)}`));
      }
    });

    child.stdin.write(task);
    child.stdin.end();
  });
}
