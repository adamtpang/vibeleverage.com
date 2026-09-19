"use client";

import * as React from "react";
import { ArrowRight, Check, Copy, RotateCcw, Share2 } from "lucide-react";

import {
  DIAGNOSTIC_QUESTIONS,
  buildImprovementPrompt,
  type LeverScorecard,
} from "@/lib/leverage-diagnostic";
import {
  LEVERS,
  LEVER_BY_KEY,
  profile,
  scoreSlug,
  type LeverKey,
} from "@/lib/levers";
import { useLeverage } from "@/components/leverage-store";
import { readStoredValue, STORAGE_KEYS } from "@/lib/storage-keys";
import { cn } from "@/lib/utils";

const PROJECT_STORAGE_KEY = STORAGE_KEYS.project;

function scoreTone(score: number) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 40) return "text-lever";
  return "text-foreground";
}

export function Diagnostic() {
  const {
    answers,
    setAnswer,
    resetDiagnosis,
    diagnosis,
    scores,
    constraint,
    index,
  } = useLeverage();
  const [activeLever, setActiveLever] = React.useState<LeverKey>("code");
  const [projectName, setProjectName] = React.useState("vibeleverage.com");
  const [projectLoaded, setProjectLoaded] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [shared, setShared] = React.useState(false);

  React.useEffect(() => {
    try {
      const saved = readStoredValue("project");
      if (saved) {
        setProjectName(saved === "archimedes.life" ? "vibeleverage.com" : saved);
      }
    } catch {
      /* storage unavailable */
    } finally {
      setProjectLoaded(true);
    }
  }, []);

  React.useEffect(() => {
    if (!projectLoaded) return;
    try {
      localStorage.setItem(PROJECT_STORAGE_KEY, projectName);
    } catch {
      /* storage unavailable */
    }
  }, [projectLoaded, projectName]);

  const activeQuestions = DIAGNOSTIC_QUESTIONS.filter(
    (question) => question.lever === activeLever
  );
  const constraintLever = LEVER_BY_KEY[constraint];
  const prof = profile(scores);
  const prompt = React.useMemo(
    () => buildImprovementPrompt(diagnosis, projectName.trim() || "the relevant project"),
    [diagnosis, projectName]
  );
  const constraintFindings = diagnosis.findings
    .filter((finding) => finding.lever === constraint)
    .slice(0, 2);
  const prioritizedFinding = constraintFindings[0];

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* the preview below remains available */
    }
  }

  async function shareCard() {
    const url = `${window.location.origin}/card/${scoreSlug(scores)}`;
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      window.setTimeout(() => setShared(false), 2000);
    } catch {
      window.open(url, "_blank", "noopener");
    }
  }

  function nextLever() {
    const current = LEVERS.findIndex((lever) => lever.key === activeLever);
    const next = LEVERS[(current + 1) % LEVERS.length];
    setActiveLever(next.key);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid overflow-hidden rounded-lg border border-border lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col bg-background p-5 sm:p-8">
          <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="label text-[0.6rem] text-muted-foreground">
                Evidence audit
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground">
                Select factual ranges. Unknown evidence cannot produce a high score.
              </p>
            </div>
            <button
              type="button"
              onClick={resetDiagnosis}
              className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-md border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-lever/50 hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>

          <div
            className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4"
            role="tablist"
            aria-label="Leverage categories"
          >
            {diagnosis.scorecards.map((scorecard) => (
              <LeverTab
                key={scorecard.lever}
                scorecard={scorecard}
                selected={scorecard.lever === activeLever}
                onSelect={() => setActiveLever(scorecard.lever)}
              />
            ))}
          </div>

          <div className="mt-7 flex flex-col">
            {activeQuestions.map((question, questionIndex) => (
              <label
                key={question.id}
                className={cn(
                  "block py-5",
                  questionIndex > 0 && "border-t border-border"
                )}
              >
                <span className="flex items-baseline justify-between gap-4">
                  <span className="text-sm font-semibold text-foreground">
                    {question.title}
                  </span>
                  <span className="font-mono text-[0.62rem] text-muted-foreground">
                    weight {question.weight}
                  </span>
                </span>
                <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
                  {question.prompt}
                </span>
                <select
                  value={answers[question.id] ?? ""}
                  onChange={(event) => setAnswer(question.id, event.target.value)}
                  className="mt-3 h-11 w-full rounded-md border border-input bg-secondary/30 px-3 text-sm text-foreground outline-none transition-colors focus:border-lever focus:ring-1 focus:ring-lever"
                >
                  <option value="">Select the current factual range</option>
                  {question.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={nextLever}
            className="mt-2 inline-flex h-11 items-center justify-center gap-2 self-start rounded-md border border-lever/40 px-4 text-sm font-semibold text-lever transition-colors hover:bg-lever/10"
          >
            Next lever
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-6 border-t border-border bg-secondary/10 p-5 sm:p-8 lg:border-l lg:border-t-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label text-[0.6rem] text-muted-foreground">Profile</p>
              <p className="mt-1 text-xl font-semibold tracking-tight">
                {diagnosis.complete ? prof.label : "Audit incomplete"}
              </p>
            </div>
            <div className="text-right">
              <p className="label text-[0.6rem] text-muted-foreground">Index</p>
              <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-lever">
                {diagnosis.complete ? index : "--"}
                <span className="text-sm text-muted-foreground">/100</span>
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
              <span>Evidence confidence</span>
              <span className="font-mono tabular-nums">
                {diagnosis.answered}/{diagnosis.total} checks
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-lever transition-[width] duration-300"
                style={{ width: `${diagnosis.confidence}%` }}
              />
            </div>
          </div>

          <div className="divide-y divide-border border-y border-border">
            {diagnosis.scorecards.map((scorecard) => (
              <div
                key={scorecard.lever}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{scorecard.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {scorecard.answered}/{scorecard.total} checks answered
                  </p>
                </div>
                <p
                  className={cn(
                    "font-mono text-lg font-semibold tabular-nums",
                    scorecard.confidence === 100 && scoreTone(scorecard.score)
                  )}
                >
                  {scorecard.confidence === 100 ? scorecard.score : "--"}
                </p>
              </div>
            ))}
          </div>

          <div>
            <p className="label text-[0.6rem] text-muted-foreground">
              {diagnosis.complete ? "Strategic constraint" : "Provisional direction"}
            </p>
            <div className="mt-1.5 flex flex-wrap items-baseline gap-3">
              <span className="text-2xl font-semibold tracking-tight text-lever">
                {constraintLever.name}
              </span>
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
                permissionless first
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              {diagnosis.complete
                ? constraintLever.constraintRx
                : "Finish the unanswered checks before treating this as a verified constraint."}
            </p>
          </div>

          <div className="mt-auto">
            <p className="label mb-3 text-[0.6rem] text-muted-foreground">
              Highest-impact evidence gaps
            </p>
            <div className="space-y-4">
              {constraintFindings.map((finding) => (
                <div key={finding.id}>
                  <p className="text-sm font-medium text-foreground">
                    {finding.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Evidence: {finding.evidence}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Next receipt: {finding.acceptance}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs leading-relaxed text-subtle-foreground">
            Capital and labor remain visible, but Code and Media stay strategic
            until both reach repeatable traction. AI agents count as Code, not Labor.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background p-5 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="label text-[0.6rem] text-muted-foreground">
              Implementation-ready cure
            </p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight">
              Generate the next improvement cycle
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The prompt carries your evidence, the binding constraint, guardrails,
              acceptance tests, and the diagnose to cure to rescan stopping rule.
            </p>
          </div>
          <div className="w-full max-w-sm">
            <label className="text-xs text-muted-foreground" htmlFor="project-name">
              Relevant project or repository
            </label>
            <input
              id="project-name"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-input bg-secondary/30 px-3 text-sm text-foreground outline-none transition-colors focus:border-lever focus:ring-1 focus:ring-lever"
              placeholder="vibeleverage.com"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={copyPrompt}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-lever px-5 text-sm font-semibold text-background transition-colors hover:bg-lever/90"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" strokeWidth={3} />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy improvement prompt
              </>
            )}
          </button>
          <button
            type="button"
            onClick={shareCard}
            disabled={!diagnosis.complete}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border px-5 text-sm font-medium text-muted-foreground transition-colors hover:border-lever/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            {shared ? (
              <>
                <Check className="h-4 w-4" strokeWidth={3} />
                Link copied
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                Share verified card
              </>
            )}
          </button>
        </div>

        {!diagnosis.complete && (
          <p className="mt-3 text-xs text-muted-foreground">
            Complete all {diagnosis.total} checks before sharing or recording a receipt.
            The improvement prompt can still help close missing evidence.
          </p>
        )}

        <details className="mt-6">
          <summary className="cursor-pointer select-none font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground">
            Preview prompt
          </summary>
          <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-secondary/30 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
            {prompt}
          </pre>
        </details>

        {diagnosis.complete && prioritizedFinding && (
          <div className="mt-8 grid gap-5 border-t border-border pt-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="label text-[0.6rem] text-muted-foreground">
                First cure receipt
              </p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight">
                {prioritizedFinding.title}
              </h3>
            </div>
            <div>
              <p className="text-sm leading-relaxed text-foreground">
                {prioritizedFinding.recommendation}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Done when: {prioritizedFinding.acceptance}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LeverTab({
  scorecard,
  selected,
  onSelect,
}: {
  scorecard: LeverScorecard;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        "flex h-12 items-center justify-between gap-2 rounded-md border px-3 text-left transition-colors",
        selected
          ? "border-lever/60 bg-lever/10 text-foreground"
          : "border-border text-muted-foreground hover:border-lever/40 hover:text-foreground"
      )}
    >
      <span className="text-xs font-semibold">{scorecard.label}</span>
      <span className="font-mono text-xs tabular-nums">
        {scorecard.answered}/{scorecard.total}
      </span>
    </button>
  );
}
