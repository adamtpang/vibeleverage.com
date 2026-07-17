import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";

import { ANCHORS } from "@/lib/anchors";
import {
  bindingConstraint,
  LEVER_BY_KEY,
  LEVERS,
  leverageIndex,
  parseScoreSlug,
  profile,
} from "@/lib/levers";
import { Button } from "@/components/ui/button";
import { FulcrumGlyph } from "@/components/lever-mark";
import { cn } from "@/lib/utils";

interface Props {
  params: { scores: string };
}

export function generateMetadata({ params }: Props): Metadata {
  const scores = parseScoreSlug(params.scores);
  if (!scores) return { title: "Leverage card" };

  const index = leverageIndex(scores);
  const prof = profile(scores);
  const constraint = LEVER_BY_KEY[bindingConstraint(scores)];
  const title = `Leverage index ${index}/100 · ${prof.label}`;
  const description = `Code ${scores.code}, media ${scores.media}, capital ${scores.capital}, labor ${scores.labor}. Binding constraint: ${constraint.name}. Get your own number at archimedes.life.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function CardPage({ params }: Props) {
  const scores = parseScoreSlug(params.scores);
  if (!scores) notFound();

  const index = leverageIndex(scores);
  const prof = profile(scores);
  const constraintKey = bindingConstraint(scores);
  const constraint = LEVER_BY_KEY[constraintKey];

  const board = [
    ...ANCHORS.map((a) => ({
      name: a.name,
      index: leverageIndex(a.scores),
      isYou: false,
    })),
    { name: "This card", index, isYou: true },
  ].sort((a, b) => b.index - a.index);
  const rank = board.findIndex((r) => r.isYou) + 1;

  return (
    <main className="relative mx-auto flex min-h-[100svh] max-w-3xl flex-col justify-center px-6 py-20 sm:px-8">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-[0.04]" />
        <div className="absolute left-1/2 top-[-18rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-lever/[0.08] blur-[140px]" />
      </div>

      <p className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.26em] text-muted-foreground">
        <FulcrumGlyph className="text-lever" />
        The leverage diagnosis
      </p>

      <div className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-3">
        <p className="font-mono text-[clamp(4rem,16vw,8rem)] font-bold leading-[0.85] tracking-tight text-lever">
          {index}
          <span className="text-3xl text-muted-foreground">/100</span>
        </p>
        <div className="pb-2">
          <p className="text-2xl font-semibold tracking-tight">{prof.label}</p>
          <p className="text-sm text-muted-foreground">
            Ranked #{rank} of {board.length} against the most leveraged humans alive
          </p>
        </div>
      </div>

      <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
        {prof.blurb}
      </p>

      <div className="mt-10 flex flex-col gap-5 rounded-xl border border-border bg-background p-7 sm:p-9">
        {LEVERS.map((lever) => {
          const value = scores[lever.key];
          const isConstraint = constraintKey === lever.key;
          return (
            <div key={lever.key}>
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2.5">
                  <span
                    className={cn(
                      "text-base font-semibold tracking-tight",
                      isConstraint && "text-lever"
                    )}
                  >
                    {lever.name}
                  </span>
                  {isConstraint && (
                    <span className="label rounded bg-lever/15 px-1.5 py-0.5 text-[0.55rem] text-lever">
                      binding
                    </span>
                  )}
                </div>
                <span className="font-mono text-sm tabular-nums">{value}</span>
              </div>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-lever"
                  style={{ width: `${Math.max(1.5, value)}%` }}
                />
              </div>
            </div>
          );
        })}

        <div className="mt-2 border-t border-border pt-5">
          <p className="label text-[0.6rem] text-muted-foreground">Binding constraint</p>
          <p className="mt-1.5 text-xl font-semibold tracking-tight text-lever">
            {constraint.name}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {constraint.constraintRx}
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Button asChild className="h-12 gap-2 px-6 text-base font-semibold">
          <a href="/#diagnostic">
            Get your own number
            <ArrowRight className="h-4 w-4" />
          </a>
        </Button>
        <p className="text-sm text-muted-foreground">
          Four levers, two minutes, free.
        </p>
      </div>

      <p className="mt-14 font-mono text-xs text-muted-foreground">
        <a href="/" className="underline-offset-4 hover:underline">
          archimedes.life
        </a>{" "}
        · find the lever, move the world
      </p>
    </main>
  );
}
