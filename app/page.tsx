import { ArrowDown, ArrowRight } from "lucide-react";

import { VibeCoach } from "@/components/vibe-coach";
import { CureProtocol } from "@/components/cure-protocol";
import { Diagnostic } from "@/components/diagnostic";
import { EmailCapture } from "@/components/email-capture";
import { LeverageBenchmarks } from "@/components/leverage-benchmarks";
import { LeverageProvider } from "@/components/leverage-store";
import { LeverageTracker } from "@/components/leverage-tracker";
import { LeverMark, VibeGlyph } from "@/components/lever-mark";
import { Button } from "@/components/ui/button";
import { LEVERS } from "@/lib/levers";

const ARC = [
  {
    step: "01",
    title: "Diagnose",
    body: "Audit sixteen factual checks across the four levers. You leave with an evidence-weighted index, confidence level, and the single strategic constraint named.",
  },
  {
    step: "02",
    title: "Cure",
    body: "Get the cure protocol for that constraint: the strategic read plus a sequenced set of concrete moves, the first one doable in the next hour. A prescription you run, not advice you nod at.",
  },
  {
    step: "03",
    title: "Compound",
    body: "Work the plays, collect the receipt, and rerun the same audit. Scores move only when users, audience, revenue, or delegated output actually move.",
  },
];

const CURE_SECTION = {
  label: "The cure",
  title: "Every lever has a protocol, and the clinic hands you the one for your constraint.",
  body: "Vibe Code, Vibe Media, Vibe Capital, and Vibe Labor each come with a cure protocol: the strategic read on why that lever is stuck, then the ranked moves that pull it, most actionable first. No frameworks, no course. The next real action for the exact lever holding you back.",
};

const MAXX_SECTION = {
  label: "Leverage-maxxing",
  title: "One diagnosis is a claim. Receipts turn it into a slope.",
  body: "The tracker preserves each completed evidence audit. Run the protocol, change a real metric, record the receipt, and compare the same checks until the binding constraint moves.",
};

function SectionLabel({
  index,
  children,
}: {
  index: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
      <span className="text-lever">{index}</span>
      <span className="h-px w-8 bg-border" />
      <span>{children}</span>
    </div>
  );
}

export default function Page() {
  return (
    <main className="relative overflow-x-clip">
      {/* atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid opacity-[0.04]" />
      </div>

      {/* ───────────────────────── hero ───────────────────────── */}
      <section className="mx-auto flex min-h-[88svh] max-w-5xl flex-col justify-center px-6 pb-14 pt-20 sm:px-8 sm:pb-20 sm:pt-28">
        <p
          className="reveal mb-6 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.26em] text-muted-foreground sm:mb-8"
          style={{ animationDelay: "0ms" }}
        >
          <VibeGlyph className="text-lever" />
          The leverage maxxing system
        </p>

        <h1
          className="reveal-rise font-sans text-[clamp(3rem,13vw,8rem)] font-bold leading-[0.84] tracking-normal"
          style={{ animationDelay: "80ms" }}
        >
          <span className="block">vibe</span>
          <span className="block text-lever">leverage</span>
        </h1>

        <p
          className="reveal-rise mt-7 max-w-2xl text-balance text-2xl font-medium leading-[1.15] sm:mt-9 sm:text-3xl"
          style={{ animationDelay: "170ms" }}
        >
          Diagnose your leverage. Cure the weakest lane. Maxx what compounds.
        </p>

        <p
          className="reveal mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          style={{ animationDelay: "250ms" }}
        >
          Score Vibe Code, Vibe Media, Vibe Capital, and Vibe Labor from real
          evidence. Then work one constraint until users, audience, revenue, or
          delegated output moves.
        </p>

        <div
          className="reveal mt-7 flex flex-wrap items-center gap-3 sm:mt-10"
          style={{ animationDelay: "330ms" }}
        >
          <Button asChild className="h-12 gap-2 px-6 text-base font-semibold">
            <a href="#diagnostic">
              Diagnose my leverage
              <ArrowDown className="h-4 w-4" />
            </a>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="h-12 px-5 text-base text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
          >
            <a
              href="https://buy.stripe.com/9B64gz7Z00Oh5kc9WFaMU0E"
              target="_blank"
              rel="noopener noreferrer"
            >
              Founding license · $49
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </a>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="h-12 px-5 text-base text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
          >
            <a href="#levers">See the four levers</a>
          </Button>
        </div>

        <div
          id="cure-log"
          className="reveal mt-7 w-full max-w-xl scroll-mt-6 sm:mt-8"
          style={{ animationDelay: "410ms" }}
        >
          <p className="mb-2.5 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
            One practical leverage cure each week
          </p>
          <EmailCapture
            buttonLabel="Join the cure log"
            helperText="Consent to receive one practical leverage email each week. No spam."
            source="hero-cure-log"
            subject="vibeleverage.com cure log signup"
            successMessage="You're on the cure log. The first field note will arrive by email."
          />
        </div>
      </section>

      {/* ──────────────────── epigraph + the motif ──────────────────── */}
      <section className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-6 py-12 sm:px-8 sm:py-16">
        <div className="w-full max-w-md">
          <LeverMark />
        </div>
        <blockquote className="max-w-xl text-balance text-center text-lg font-medium leading-snug sm:text-xl">
          &ldquo;Give me a lever long enough and a place to stand, and I will
          move the world.&rdquo;
          <cite className="mt-3 block font-mono text-xs not-italic uppercase tracking-[0.22em] text-muted-foreground">
            Archimedes
          </cite>
        </blockquote>
      </section>

      {/* ───────────────────── the four levers ───────────────────── */}
      <section id="levers" className="mx-auto max-w-5xl px-6 py-24 sm:px-8 sm:py-32">
        <div className="flex flex-col gap-5">
          <SectionLabel index="I">The four levers</SectionLabel>
          <h2 className="max-w-2xl text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Four lanes of leverage. Pull the weakest one first.
          </h2>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:mt-16 sm:grid-cols-2">
          {LEVERS.map((lever) => (
            <article
              key={lever.key}
              className="group relative flex flex-col gap-5 bg-background p-7 transition-colors duration-300 hover:bg-secondary/40 sm:p-9"
            >
              <span className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-lever transition-transform duration-500 ease-out group-hover:scale-x-100" />
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground transition-colors duration-300 group-hover:text-lever">
                  {lever.id}
                </span>
                <VibeGlyph className="text-border transition-colors duration-300 group-hover:text-lever" />
              </div>

              <div>
                <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {lever.name}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-subtle-foreground">
                  {lever.what}
                </p>
              </div>

              <div className="mt-auto space-y-5 pt-2">
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
                  <span className="label mb-1.5 block text-[0.65rem] text-lever/80">
                    Under-leveraged when
                  </span>
                  {lever.symptom}
                </p>
                <p className="text-sm leading-relaxed text-foreground sm:text-[0.95rem]">
                  <span className="label mb-1.5 block text-[0.65rem] text-muted-foreground">
                    Cured by
                  </span>
                  {lever.cure}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ───────────────────── the loop ───────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-8 sm:px-8">
        <ol className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
          {ARC.map((step) => (
            <li key={step.step} className="flex flex-col gap-4 bg-background p-7 sm:p-9">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-3xl font-semibold text-lever">
                  {step.step}
                </span>
                <span className="text-lg font-semibold tracking-tight">
                  {step.title}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Diagnose, Cure, Compound share one leverage store */}
      <LeverageProvider>
        {/* ───────────────────── II · diagnose ───────────────────── */}
        <section
          id="diagnostic"
          className="mx-auto max-w-5xl px-6 py-24 sm:px-8 sm:py-32"
        >
          <div className="flex flex-col gap-5">
            <SectionLabel index="II">Diagnose</SectionLabel>
            <h2 className="max-w-2xl text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Audit your four levers. Find the one gating the rest.
            </h2>
            <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
              Every point needs a factual range. Vibe Code and Vibe Media come
              first because they are permissionless. Diagnose the weaker one,
              then pour your effort there until the evidence changes.
            </p>
          </div>

          <div className="mt-12 sm:mt-16">
            <Diagnostic />
          </div>

          <p className="mt-6 text-xs leading-relaxed text-subtle-foreground">
            Brand, network, and distribution are multipliers, not a fifth lever.
            They lower the cost of pulling all four.
          </p>
        </section>

        {/* ───────────────────── III · cure ───────────────────── */}
        <section
          id="cure"
          className="mx-auto max-w-5xl px-6 py-24 sm:px-8 sm:py-32"
        >
          <div className="flex flex-col gap-5">
            <SectionLabel index="III">{CURE_SECTION.label}</SectionLabel>
            <h2 className="max-w-3xl text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {CURE_SECTION.title}
            </h2>
            <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
              {CURE_SECTION.body}
            </p>
          </div>

          <div className="mt-12 sm:mt-16">
            <CureProtocol />
          </div>
        </section>

        {/* ───────────────────── IV · compound ───────────────────── */}
        <section
          id="compound"
          className="mx-auto max-w-5xl px-6 py-24 sm:px-8 sm:py-32"
        >
          <div className="flex flex-col gap-5">
            <SectionLabel index="IV">{MAXX_SECTION.label}</SectionLabel>
            <h2 className="max-w-3xl text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {MAXX_SECTION.title}
            </h2>
            <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
              {MAXX_SECTION.body}
            </p>
          </div>

          <div className="mt-12 sm:mt-16">
            <LeverageTracker />
          </div>
        </section>

        {/* ───────────────────── V · the ceiling ───────────────────── */}
        <section
          id="ceiling"
          className="mx-auto max-w-5xl px-6 py-24 sm:px-8 sm:py-32"
        >
          <div className="flex flex-col gap-5">
            <SectionLabel index="V">The ceiling</SectionLabel>
            <h2 className="max-w-3xl text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              How you stack against the most leveraged humans alive.
            </h2>
            <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
              Same four levers, same scale. The index rewards strength across all
              four, so wealth alone does not determine the ranking.
            </p>
          </div>

          <div className="mt-12 sm:mt-16">
            <LeverageBenchmarks />
          </div>
        </section>
      </LeverageProvider>

      {/* ───────────────────── VI · talk to Vibe Coach ───────────────────── */}
      <section id="chat" className="mx-auto max-w-5xl px-6 py-24 sm:px-8 sm:py-32">
        <div className="flex flex-col gap-5">
          <SectionLabel index="VI">Talk to Vibe Coach</SectionLabel>
          <h2 className="max-w-2xl text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Coach the constraint in real time.
          </h2>
          <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
            Vibe Coach reads your current scores and helps you attack your binding
            constraint. Ask for a plan, a first step, or a gut check.
          </p>
        </div>

        <div className="mt-12 sm:mt-16">
          <VibeCoach />
        </div>
      </section>

      {/* ───────────────────── the clinic / capture ───────────────────── */}
      <section
        id="clinic"
        className="mx-auto max-w-5xl px-6 py-24 sm:px-8 sm:py-32"
      >
        <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
          <SectionLabel index="VII">The clinic</SectionLabel>
          <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Follow the cure in public.
          </h2>
          <p className="text-pretty text-base leading-relaxed text-muted-foreground">
            One practical dispatch each week: the constraint, the action, the
            receipt, and the score change. Watch Vibe Leverage turn diagnosis into
            compounding evidence.
          </p>
          <div className="mt-2 w-full max-w-md text-left">
            <EmailCapture
              buttonLabel="Join the cure log"
              helperText="Consent to receive one practical leverage email each week. No spam."
              source="clinic-cure-log"
              subject="vibeleverage.com cure log signup"
              successMessage="You're on the cure log. The first field note will arrive by email."
            />
          </div>
        </div>
      </section>

      {/* ───────────────────── footer ───────────────────── */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-2.5">
            <VibeGlyph className="text-lever" />
            <span className="font-mono text-sm tracking-wide">vibeleverage.com</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Find the lever. Move the world.
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            © 2026 ·{" "}
            <a
              href="https://adampang.com"
              className="underline-offset-4 hover:underline"
            >
              built by Adam Pangelinan
            </a>{" "}
            ·{" "}
            <a href="/privacy" className="underline-offset-4 hover:underline">
              privacy
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
