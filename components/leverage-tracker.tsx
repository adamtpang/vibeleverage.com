"use client";

import * as React from "react";
import { Check, Plus } from "lucide-react";

import { CURES, nextPlay } from "@/lib/levers";
import { useLeverage } from "@/components/leverage-store";
import { FulcrumGlyph } from "@/components/lever-mark";

function Sparkline({ values }: { values: number[] }) {
  const n = values.length;
  const w = 100;
  const h = 34;
  const pad = 3;
  const points = values.map((v, i) => {
    const x = n > 1 ? (i / (n - 1)) * (w - pad * 2) + pad : w / 2;
    const clamped = Math.max(0, Math.min(100, v));
    const y = h - pad - (clamped / 100) * (h - pad * 2);
    return { x, y };
  });
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="h-14 w-full"
      fill="none"
      aria-hidden
    >
      <polyline
        points={points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ")}
        className="stroke-lever"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="1.6"
          className="fill-lever"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

export function LeverageTracker() {
  const {
    scores,
    index,
    diagnosis,
    history,
    logSnapshot,
    completedPlays,
    togglePlay,
    constraint,
  } = useLeverage();

  const comparableHistory = history.filter(
    (snapshot) => snapshot.rubricVersion === diagnosis.rubricVersion
  );
  const first = comparableHistory[0];
  const delta = first ? index - first.index : 0;
  const daysActive = new Set(
    comparableHistory.map((s) => {
      const d = new Date(s.t);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  ).size;

  const np = diagnosis.complete ? nextPlay(scores, completedPlays) : null;
  const constraintName = CURES[constraint].name;
  const values = comparableHistory.map((s) => s.index);

  const metrics = [
    { label: "Index", value: diagnosis.complete ? `${index}` : "--" },
    { label: "Change", value: `${delta >= 0 ? "+" : ""}${delta}` },
    { label: "Receipts", value: `${comparableHistory.length}` },
    { label: "Days active", value: `${daysActive}` },
  ];

  return (
    <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-[1.1fr_1fr]">
      {/* trend + log */}
      <div className="flex flex-col gap-6 bg-background p-7 sm:p-9">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="label text-[0.6rem] text-muted-foreground">
              Leverage index
            </p>
            <p className="mt-1 font-mono text-4xl font-semibold tabular-nums text-lever">
              {diagnosis.complete ? index : "--"}
              <span className="text-lg text-muted-foreground">/100</span>
            </p>
          </div>
          {comparableHistory.length > 0 && (
            <p className="font-mono text-sm tabular-nums text-muted-foreground">
              {delta >= 0 ? "+" : ""}
              {delta} since first check-in
            </p>
          )}
        </div>

        {values.length >= 2 ? (
          <Sparkline values={values} />
        ) : (
          <div className="flex h-14 items-center rounded-lg border border-dashed border-border px-4 text-xs text-muted-foreground/70">
            Log two or more check-ins to draw your trend line.
          </div>
        )}

        <div className="grid grid-cols-4 gap-px overflow-hidden rounded-lg border border-border bg-border">
          {metrics.map((m) => (
            <div key={m.label} className="bg-background p-3 text-center">
              <p className="font-mono text-lg font-semibold tabular-nums">
                {m.value}
              </p>
              <p className="label mt-0.5 text-[0.5rem] text-muted-foreground">
                {m.label}
              </p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={logSnapshot}
          disabled={!diagnosis.complete}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-lever px-5 text-sm font-semibold text-background transition-colors hover:bg-lever/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Record evidence receipt
        </button>
        <p className="text-xs leading-relaxed text-muted-foreground/70">
          {diagnosis.complete
            ? "Each receipt preserves the evidence bands and scores from that run. Re-audit only after the underlying facts change. Saved to this browser only."
            : `Complete all ${diagnosis.total} evidence checks before recording a receipt. ${diagnosis.answered} are answered now.`}
        </p>
      </div>

      {/* next play */}
      <div className="flex flex-col gap-4 bg-background p-7 sm:p-9">
        <p className="label text-[0.6rem] text-muted-foreground">Your next play</p>
        {!diagnosis.complete ? (
          <div className="flex flex-1 flex-col justify-center gap-3">
            <FulcrumGlyph className="text-lever" />
            <p className="text-sm leading-relaxed text-foreground">
              Complete the evidence audit before starting a cure cycle. A tracker
              without a verified baseline only records self-confidence.
            </p>
          </div>
        ) : np ? (
          <>
            <div className="flex items-baseline gap-3">
              <span className="text-lg font-semibold tracking-tight text-lever">
                {np.leverName}
              </span>
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                {np.horizon}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-foreground">{np.action}</p>
            <p className="text-xs leading-relaxed text-muted-foreground/80">
              <span className="text-muted-foreground/60">Proof: </span>
              {np.proof}
            </p>
            <button
              type="button"
              onClick={() => togglePlay(np.id)}
              className="mt-auto inline-flex h-11 items-center justify-center gap-2 self-start rounded-md border border-lever/40 px-5 text-sm font-semibold text-lever transition-colors hover:bg-lever/10"
            >
              <Check className="h-4 w-4" strokeWidth={2.5} />
              Mark done
            </button>
          </>
        ) : (
          <div className="flex flex-1 flex-col justify-center gap-3">
            <FulcrumGlyph className="text-lever" />
            <p className="text-sm leading-relaxed text-foreground">
              You have cleared every play for {constraintName}. Re-rate your
              levers above. When {constraintName} is no longer your lowest, your
              binding constraint has moved, and that is the win.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
