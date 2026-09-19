"use client";

import { ANCHORS } from "@/lib/anchors";
import { useLeverage } from "@/components/leverage-store";
import { LEVERS, leverageIndex, type Scores } from "@/lib/levers";
import { cn } from "@/lib/utils";

interface BoardRow {
  key: string;
  name: string;
  tag: string;
  note?: string;
  scores: Scores;
  index: number;
  isYou?: boolean;
}

function MiniBars({ scores, isYou }: { scores: Scores; isYou?: boolean }) {
  return (
    <div className="flex h-9 shrink-0 items-end gap-1" aria-hidden>
      {LEVERS.map((lever) => {
        const value = scores[lever.key];
        return (
          <span
            key={lever.key}
            title={`${lever.name} ${value}`}
            className={cn(
              "w-1.5 rounded-sm",
              isYou ? "bg-lever" : "bg-muted-foreground/40"
            )}
            style={{ height: `${Math.max(3, value * 0.36)}px` }}
          />
        );
      })}
    </div>
  );
}

export function LeverageBenchmarks() {
  const { scores, index } = useLeverage();

  const rows: BoardRow[] = [
    ...ANCHORS.map((anchor) => ({
      ...anchor,
      index: leverageIndex(anchor.scores),
    })),
    {
      key: "you",
      name: "You",
      tag: "Live from your diagnosis above",
      scores,
      index,
      isYou: true,
    },
  ].sort((a, b) => b.index - a.index);

  const rank = rows.findIndex((row) => row.isYou) + 1;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border px-6 py-4 sm:px-8">
        <p className="label text-[0.62rem] text-muted-foreground">The board</p>
        <p className="font-mono text-sm tabular-nums">
          You rank <span className="text-lever">#{rank}</span> of {rows.length}.
          The gap is the roadmap.
        </p>
      </div>

      <ol>
        {rows.map((row, i) => (
          <li
            key={row.key}
            className={cn(
              "flex items-center gap-4 border-b border-border px-6 py-4 last:border-b-0 sm:gap-6 sm:px-8",
              row.isYou && "bg-lever/[0.07]"
            )}
          >
            <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm font-semibold tracking-tight sm:text-base",
                  row.isYou && "text-lever"
                )}
              >
                {row.name}
              </p>
              <p className="text-xs text-muted-foreground">{row.tag}</p>
              {row.note && (
                <p className="mt-1 hidden text-xs leading-relaxed text-subtle-foreground md:block">
                  {row.note}
                </p>
              )}
            </div>
            <MiniBars scores={row.scores} isYou={row.isYou} />
            <span
              className={cn(
                "w-12 shrink-0 text-right font-mono text-lg font-semibold tabular-nums",
                row.isYou ? "text-lever" : "text-foreground"
              )}
            >
              {row.index}
            </span>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-1.5 border-t border-border px-6 py-4 text-xs leading-relaxed text-subtle-foreground sm:px-8">
        <p>
          Bars left to right: code, media, capital, labor. Anchor scores are
          editorial estimates on the same 0 to 100 scale, where 100 is the
          frontier use of that lever by any living person. Not audits.
        </p>
        <p>
          Every doubling of a lever multiplies your index by about 1.19, and the
          cheapest doublings live at the bottom of your character sheet. That is
          why you attack the constraint.
        </p>
      </div>
    </div>
  );
}
