import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

// Vibe Capital: the one lever that structurally cannot close on its own.
// Every other Vibe agent ends in an action (a cut gets applied, a branch
// gets merged). This one never does. It researches, drafts, and stops.
// Sending an invoice, wiring money, or executing a trade is not a phase
// this job engine has, on purpose, the same line drawn by every mature
// product surveyed for this lever (Ramp, Puzzle, Digits all gate at
// ledger-posting; the one dead-end pattern found, Polystrat/Olas-style
// autonomous custody trading, is exactly what this refuses to become).
//
// Powered by the local `claude` CLI, same as Vibe Media and Code, same
// subscription, not a metered ANTHROPIC_API_KEY. Unlike Media's packaging
// step, this one is allowed exactly one tool: WebSearch, for real market
// comps. No Bash, no Write, no Read, no file access of any kind, it cannot
// touch anything on this machine except the job file this module itself
// manages.

const JOBS_DIR = path.join(process.cwd(), ".vibe", "capital-jobs");
const DRAFTS_DIR = path.join(process.cwd(), ".vibe", "capital-drafts");

export type CapitalJobPhase = "queued" | "researching" | "ready_for_review" | "saved" | "error";

export interface CapitalComp {
  label: string;
  amount: string;
  note: string;
  source?: string;
}

export interface CapitalRecommendation {
  lineItems: Array<{ item: string; qty: string; rate: string; amount: string }>;
  total: string;
  reasoning: string;
}

export interface VibeCapitalJob {
  id: string;
  subject: string;
  context: string;
  phase: CapitalJobPhase;
  createdAt: string;
  updatedAt: string;
  log: string[];
  error?: string;
  comps?: CapitalComp[];
  recommendation?: CapitalRecommendation;
  openDecisions?: string[];
  draftDocument?: string;
  savedPath?: string;
}

function ensureDirs() {
  mkdirSync(JOBS_DIR, { recursive: true });
}

export function jobFile(id: string) {
  return path.join(JOBS_DIR, `${id}.json`);
}

function saveJob(job: VibeCapitalJob) {
  ensureDirs();
  job.updatedAt = new Date().toISOString();
  writeFileSync(jobFile(job.id), JSON.stringify(job, null, 2), "utf-8");
}

export function loadJob(id: string): VibeCapitalJob | null {
  const file = jobFile(id);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf-8"));
}

export function listJobs(): VibeCapitalJob[] {
  ensureDirs();
  return readdirSync(JOBS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(path.join(JOBS_DIR, f), "utf-8")) as VibeCapitalJob)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function appendLog(job: VibeCapitalJob, line: string) {
  job.log.push(`[${new Date().toISOString()}] ${line}`);
  saveJob(job);
}

/** Starts a job and returns immediately. Research continues in the background. */
export function startCapitalJob(subject: string, context: string): VibeCapitalJob {
  const job: VibeCapitalJob = {
    id: randomUUID(),
    subject,
    context,
    phase: "queued",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    log: [],
  };
  saveJob(job);

  void processCapitalJob(job.id).catch((err) => {
    const j = loadJob(job.id);
    if (j) {
      j.phase = "error";
      j.error = err instanceof Error ? err.message : String(err);
      saveJob(j);
    }
  });

  return job;
}

const CAPITAL_SYSTEM_PROMPT = `You are Vibe Capital, a draft-only pricing and invoicing research
assistant. You never send anything, never move money, never execute a trade or payment, and never
claim to have done so. Your only output is a researched recommendation for a human to review, edit,
and act on themselves.

Given a subject (what is being priced) and context (scope of work, results already delivered, any
existing draft numbers), do this:
1. Use WebSearch to find 2 to 5 real, named, current market comparables for pricing something like
   this. Cite a real source for each, no invented figures.
2. Weigh the subject's own delivered results against those comps, don't just average the comps blind.
   Real delivered results are evidence a price should hold or rise, not just a market-rate lookup.
3. Propose a specific priced recommendation: line items, quantities, rates, a total.
4. List every decision that is not a research question, things only the human can decide (payment
   method, equity vs. cash split, personal risk tolerance, relationship context, how hard to push).
   Do not guess these, list them as open, exactly as they are.
5. Write a short, ready-to-review draft document (a price proposal or invoice, in plain markdown)
   the human can edit and send themselves. Any account, wallet, or payment-rail field must stay a
   blank the human fills in, never invent one.

Return strict JSON only, no prose, no markdown fences:
{"comps": [{"label": string, "amount": string, "note": string, "source": string}], "recommendation":
{"lineItems": [{"item": string, "qty": string, "rate": string, "amount": string}], "total": string,
"reasoning": string}, "openDecisions": [string], "draftDocument": string}`;

async function processCapitalJob(id: string) {
  let job = loadJob(id);
  if (!job) return;

  job.phase = "researching";
  appendLog(job, "researching market comps and drafting a priced recommendation");

  const prompt = `Subject: ${job.subject}\n\nContext:\n${job.context}`;
  const raw = await runClaudeCapital(prompt, (line) => appendLog(loadJob(id)!, line.trim()));

  job = loadJob(id)!;
  let parsed: {
    comps?: CapitalComp[];
    recommendation?: CapitalRecommendation;
    openDecisions?: string[];
    draftDocument?: string;
  };
  try {
    parsed = JSON.parse(raw);
  } catch {
    job.phase = "error";
    job.error = "claude CLI's response was not valid JSON, review manually. Raw: " + raw.slice(0, 500);
    saveJob(job);
    return;
  }

  job.comps = parsed.comps ?? [];
  job.recommendation = parsed.recommendation;
  job.openDecisions = parsed.openDecisions ?? [];
  job.draftDocument = parsed.draftDocument ?? "";
  job.phase = "ready_for_review";
  saveJob(job);
  appendLog(job, "ready for review, nothing has been saved or sent yet");
}

/**
 * Human-approved step: writes the (possibly human-edited) draft document to
 * a local file. This is the ceiling of what this agent is allowed to do.
 * There is no send step, anywhere in this module, on purpose.
 */
export async function saveCapitalDraft(id: string, draftDocument: string): Promise<VibeCapitalJob> {
  const job = loadJob(id);
  if (!job) throw new Error("job not found");
  if (job.phase !== "ready_for_review") {
    throw new Error(`job is in phase ${job.phase}, expected ready_for_review`);
  }

  mkdirSync(DRAFTS_DIR, { recursive: true });
  const savedPath = path.join(DRAFTS_DIR, `${id}.md`);
  writeFileSync(savedPath, draftDocument, "utf-8");

  job.draftDocument = draftDocument;
  job.savedPath = savedPath;
  job.phase = "saved";
  saveJob(job);
  appendLog(job, `draft saved to ${savedPath}. Nothing was sent, review it and send it yourself.`);
  return job;
}

/**
 * Same temp-file system-prompt pattern as Vibe Media and Code, for the
 * same reason: shell:true joins argv into one string without safe quoting
 * on Windows, and this system prompt is long enough that a raw argv value
 * risks truncation or mangling. Unlike Media's packaging call, this one
 * grants exactly one tool, WebSearch, and denies everything else by name.
 */
function runClaudeCapital(prompt: string, onLine?: (line: string) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const promptFile = path.join(os.tmpdir(), `vibe-capital-system-${randomUUID()}.txt`);
    writeFileSync(promptFile, CAPITAL_SYSTEM_PROMPT, "utf-8");
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
        "--allowedTools",
        "WebSearch",
        "--disallowedTools",
        "Bash",
        "Edit",
        "Write",
        "Read",
        "Glob",
        "Grep",
        "WebFetch",
        "--permission-mode",
        "bypassPermissions",
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
