"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { CURES, LEVERS, playId, type LeverKey } from "@/lib/levers";
import { useLeverage } from "@/components/leverage-store";
import { cn } from "@/lib/utils";

export function CureProtocol() {
  const { constraint, completedPlays, togglePlay } = useLeverage();
  const [selected, setSelected] = React.useState<LeverKey>(constraint);

  // Follow the binding constraint as the diagnosis changes.
  React.useEffect(() => {
    setSelected(constraint);
  }, [constraint]);

  const cure = CURES[selected];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {LEVERS.map((lever) => {
          const isSelected = selected === lever.key;
          const isConstraint = constraint === lever.key;
          return (
            <button
              key={lever.key}
              type="button"
              onClick={() => setSelected(lever.key)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors",
                isSelected
                  ? "border-lever/60 bg-lever/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-lever/40 hover:text-foreground"
              )}
            >
              {lever.name}
              {isConstraint && (
                <span className="label rounded bg-lever/15 px-1.5 py-0.5 text-[0.5rem] text-lever">
                  constraint
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-background p-7 sm:p-9">
        <p className="text-lg font-semibold leading-snug tracking-tight sm:text-xl">
          {cure.thesis}
        </p>

        <div className="mt-7 rounded-lg border border-lever/30 bg-lever/[0.06] p-5">
          <p className="label text-[0.6rem] text-lever">
            First move · next 60 minutes
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            {cure.firstMove}
          </p>
        </div>

        <div className="mt-5">
          <p className="label text-[0.6rem] text-muted-foreground">
            Leading indicator
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {cure.leadingIndicator}
          </p>
        </div>

        <div className="mt-7">
          <p className="label mb-4 text-[0.6rem] text-muted-foreground">
            The protocol · check them off as you ship
          </p>
          <div className="flex flex-col gap-2.5">
            {cure.plays.map((play, i) => {
              const id = playId(selected, i);
              const done = completedPlays.has(id);
              const showHorizon =
                i === 0 || play.horizon !== cure.plays[i - 1].horizon;
              return (
                <React.Fragment key={id}>
                  {showHorizon && (
                    <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-lever/80 first:mt-0">
                      {play.horizon}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => togglePlay(id)}
                    aria-pressed={done}
                    className="flex w-full items-start gap-3 rounded-lg border border-border bg-secondary/20 p-4 text-left transition-colors hover:border-lever/40"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                        done
                          ? "border-lever bg-lever text-background"
                          : "border-muted-foreground/40"
                      )}
                    >
                      {done && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    <span className="flex flex-col gap-1.5">
                      <span
                        className={cn(
                          "text-sm leading-relaxed",
                          done
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        )}
                      >
                        {play.action}
                      </span>
                      <span className="text-xs leading-relaxed text-subtle-foreground">
                        <span className="text-subtle-foreground">Proof: </span>
                        {play.proof}
                      </span>
                    </span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <details className="mt-6 border-t border-border pt-5">
          <summary className="cursor-pointer select-none font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground">
            Common ways this stalls
          </summary>
          <ul className="mt-4 flex flex-col gap-3">
            {cure.failureModes.map((mode) => (
              <li key={mode} className="text-sm leading-relaxed text-muted-foreground">
                {mode}
              </li>
            ))}
          </ul>
        </details>

        {selected === "capital" && (
          <p className="mt-5 text-xs leading-relaxed text-subtle-foreground">
            Not financial advice. Specific products are examples, not
            recommendations. If you carry high-interest debt or have no cash
            buffer, attack income or debt first.
          </p>
        )}
      </div>
    </div>
  );
}
