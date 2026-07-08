import { ArrowDown } from "lucide-react";

import { ArchimedesChat } from "@/components/archimedes-chat";
import { CureProtocol } from "@/components/cure-protocol";
import { Diagnostic } from "@/components/diagnostic";
import { EmailCapture } from "@/components/email-capture";
import { LeverageBenchmarks } from "@/components/leverage-benchmarks";
import { LeverageProvider } from "@/components/leverage-store";
import { LeverageTracker } from "@/components/leverage-tracker";
import { FulcrumGlyph, LeverMark } from "@/components/lever-mark";
import { Button } from "@/components/ui/button";
import { LEVERS } from "@/lib/levers";

const ARC = [
  {
    step: "01",
    title: "Diagnose",
    body: "Rate your four levers and surface the one gating the rest. You leave with a leverage index, a profile, and the single binding constraint named.",
  },
  {
    step: "02",
    title: "Cure",
    body: "Get the cure protocol for that constraint: the strategic read plus a sequenced set of concrete moves, the first one doable in the next hour. A prescription you run, not advice you nod at.",
  },
  {
    step: "03",
    title: "Compound",
    body: "Work the plays, re-measure, and watch your leverage index climb. Small inputs start moving loads that used to be out of the question.",
  },
];

const CURE_SECTION = {
  label: "The cure",
  title: "Every lever has a protocol, and the clinic hands you the one for your constraint.",
  body: "Code, media, capital, and labor each come with a cure protocol: the strategic read on why that lever is stuck, then the ranked moves that pull it, most actionable first. No frameworks, no course. The next real action for the exact lever holding you back.",
};

const MAXX_SECTION = {
  label: "Leverage-maxxing",
  title: "One diagnosis is a snapshot. The tracker turns it into a slope.",
  body: "The tracker keeps a history of your scores, so every re-measure lands next to the last one and you see the line move. Run the protocols, log the reps, and watch your leverage index (the geometric mean of all four levers) climb until the whole system compounds.",
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
        <div className="absolute left-1/2 top-[-18rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-lever/[0.08] blur-[140px]" />
      </div>

      {/* ───────────────────────── hero ───────────────────────── */}
      <section className="mx-auto flex min-h-[88svh] max-w-5xl flex-col justify-center px-6 pb-20 pt-28 sm:px-8">
        <p
          className="reveal mb-8 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.26em] text-muted-foreground"
          style={{ animationDelay: "0ms" }}
        >
          <FulcrumGlyph className="text-lever" />
          The leverage clinic
        </p>

        <h1
          className="reveal font-sans text-[clamp(2.75rem,14vw,9.5rem)] font-bold leading-[0.82] tracking-[-0.04em]"
          style={{ animationDelay: "80ms" }}
        >
          archimedes
        </h1>

        <p
          className="reveal mt-9 max-w-2xl text-balance text-2xl font-medium leading-[1.15] sm:text-3xl"
          style={{ animationDelay: "170ms" }}
        >
          You don&rsquo;t have an effort problem. You have a{" "}
          <span className="text-lever">leverage</span> problem.
        </p>

        <p
          className="reveal mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          style={{ animationDelay: "250ms" }}
        >
          Diagnose the four levers you&rsquo;re under-using (code, media, capital,
          labor), get the cure for the one holding you back, and compound it until
          the whole system moves.
        </p>

        <div
          className="reveal mt-10 flex flex-wrap items-center gap-3"
          style={{ animationDelay: "330ms" }}
        >
          <Button asChild className="h-12 gap-2 px-6 text-base font-semibold">
            <a href="#diagnostic">
              Run your diagnosis
              <ArrowDown className="h-4 w-4" />
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
            Four ways to multiply a life. Most people pull one.
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
                <FulcrumGlyph className="text-border transition-colors duration-300 group-hover:text-lever" />
              </div>

              <div>
                <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {lever.name}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground/80">
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
              Rate your four levers. Find the one gating the rest.
            </h2>
            <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
              The slowest lever governs the whole system. Do not level everything.
              Diagnose your binding constraint, then pour your effort there.
            </p>
          </div>

          <div className="mt-12 sm:mt-16">
            <Diagnostic />
          </div>

          <p className="mt-6 text-xs leading-relaxed text-muted-foreground/70">
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
              Same four levers, same scale. Notice who tops the board: the index
              rewards maxing all four at once, which is why the richest man on it
              is not the most leveraged.
            </p>
          </div>

          <div className="mt-12 sm:mt-16">
            <LeverageBenchmarks />
          </div>
        </section>
      </LeverageProvider>

      {/* ───────────────────── V · talk to archimedes ───────────────────── */}
      <section id="chat" className="mx-auto max-w-5xl px-6 py-24 sm:px-8 sm:py-32">
        <div className="flex flex-col gap-5">
          <SectionLabel index="VI">Talk to Archimedes</SectionLabel>
          <h2 className="max-w-2xl text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Coach the constraint in real time.
          </h2>
          <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
            Archimedes reads your current scores and helps you attack your binding
            constraint. Ask for a plan, a first step, or a gut check.
          </p>
        </div>

        <div className="mt-12 sm:mt-16">
          <ArchimedesChat />
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
            The guided clinic opens soon.
          </h2>
          <p className="text-pretty text-base leading-relaxed text-muted-foreground">
            You have the diagnosis, the cures, and the tracker. The guided clinic
            adds saved history across your devices, accountability, and a coach
            that checks in. Be first in line.
          </p>
          <div className="mt-2 w-full max-w-md text-left">
            <EmailCapture />
          </div>
        </div>
      </section>

      {/* ───────────────────── footer ───────────────────── */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-2.5">
            <FulcrumGlyph className="text-lever" />
            <span className="font-mono text-sm tracking-wide">archimedes.life</span>
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
