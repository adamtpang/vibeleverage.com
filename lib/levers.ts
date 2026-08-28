import { ANCHORS } from "./anchors";
import curesJson from "./cures.json";

export type LeverKey = "code" | "media" | "capital" | "labor";

export interface Lever {
  key: LeverKey;
  id: string;
  name: string;
  /** What the lever is, in one line. */
  what: string;
  /** Under-leveraged when... */
  symptom: string;
  /** Cured by... */
  cure: string;
  /** The strategic read when this lever is the binding constraint. */
  constraintRx: string;
  /** Concrete next actions, most actionable first. */
  moves: string[];
}

export const LEVERS: Lever[] = [
  {
    key: "code",
    id: "01",
    name: "Code",
    what: "Output that runs without you. AI fluency folds in here.",
    symptom:
      "You still do by hand what a script would do ten thousand times, for free, while you sleep.",
    cure: "Software that keeps working the day you stop showing up.",
    constraintRx:
      "You are leaving the cheapest leverage on the table. One built tool can replace a thousand manual hours. Make code the next thing you ship.",
    moves: [
      "Ship one automation that does a recurring task without you.",
      "Turn your most-repeated workflow into a tool other people can run.",
      "Use AI to build in a weekend what used to take a quarter.",
    ],
  },
  {
    key: "media",
    id: "02",
    name: "Media",
    what: "Content that keeps being consumed after you publish.",
    symptom: "Your best thinking reaches the same room it reached last year.",
    cure: "Publish once, be heard at the scale of the whole internet.",
    constraintRx:
      "Nothing compounds until people can find you. Media gates your brand, your distribution, and every warm inbound. Put your output in public.",
    moves: [
      "Publish in public on a schedule you can actually keep.",
      "Start the owned email list. It is media infrastructure you control.",
      "Ship the thing you have been gating and move media off zero.",
    ],
  },
  {
    key: "capital",
    id: "03",
    name: "Capital",
    what: "Money that buys output. Equity, MRR, investment.",
    symptom: "Every dollar dies the moment you stop trading hours to earn it.",
    cure: "Money that compounds while you sleep, not only while you work.",
    constraintRx:
      "You are converting effort into cash and stopping there. Route some of it into ownership so money starts buying output for you.",
    moves: [
      "Trade for equity or ownership, not only for hours.",
      "Stand up one source of recurring revenue.",
      "Put earnings to work so they buy output on your behalf.",
    ],
  },
  {
    key: "labor",
    id: "04",
    name: "Labor",
    what: "Other people's effort. The oldest, weakest, least scalable lever.",
    symptom: "You are the bottleneck on every task only you know how to do.",
    cure: "A team that turns one pair of hands into many.",
    constraintRx:
      "You are the entire org chart. Hand off the work only you do so your own hours stop being the ceiling.",
    moves: [
      "Delegate the task that only you currently do.",
      "Document one process so someone else can run it.",
      "Hire or partner for the lever you are weakest in.",
    ],
  },
];

export const LEVER_BY_KEY: Record<LeverKey, Lever> = LEVERS.reduce(
  (acc, lever) => {
    acc[lever.key] = lever;
    return acc;
  },
  {} as Record<LeverKey, Lever>
);

export type Scores = Record<LeverKey, number>;

// Tie-break priority when levers are equally low: media unlocks the most
// (brand, distribution, inbound); labor the least. So among equal-lowest
// levers, attack the one nearer the front of this list first.
const PRIORITY: LeverKey[] = ["media", "code", "capital", "labor"];
const PERMISSIONLESS: LeverKey[] = ["media", "code"];
const PERMISSIONLESS_FLOOR = 60;

/**
 * Code and media come first because a person can pull them without permission.
 * Capital follows after both permissionless levers have repeatable traction,
 * then Labor follows after Capital. Within Code and Media, lowest score wins
 * and ties break by PRIORITY.
 */
export function bindingConstraint(scores: Scores): LeverKey {
  if (PERMISSIONLESS.every((key) => scores[key] >= PERMISSIONLESS_FLOOR)) {
    return scores.capital < PERMISSIONLESS_FLOOR ? "capital" : "labor";
  }
  let best: LeverKey = PRIORITY[0];
  let bestScore = Infinity;
  for (const key of PRIORITY) {
    if (!PERMISSIONLESS.includes(key)) continue;
    if (scores[key] < bestScore) {
      bestScore = scores[key];
      best = key;
    }
  }
  return best;
}

/**
 * Geometric mean of the four levers. Rewards maxing multiple levers at once;
 * one dead lever drags the whole system down. Most leveraged is not the same
 * as highest single stat.
 */
export function leverageIndex(scores: Scores): number {
  const product = PRIORITY.reduce((p, key) => p * Math.max(1, scores[key]), 1);
  return Math.round(Math.pow(product, 1 / 4));
}

export function profile(scores: Scores): { label: string; blurb: string } {
  const vals = [scores.code, scores.media, scores.capital, scores.labor];
  const max = Math.max(...vals);
  const high = vals.filter((v) => v >= 60).length;
  const low = vals.filter((v) => v <= 20).length;

  if (high === 4) {
    return {
      label: "Compounding machine",
      blurb:
        "Rare air. All four levers turning at once. Protect it and keep every one of them spinning.",
    };
  }
  if (max >= 65 && high === 1 && low >= 2) {
    return {
      label: "Glass cannon",
      blurb:
        "High single-target output, almost no compounding surface. One stat carries you while the rest sit dead.",
    };
  }
  if (
    scores.code >= 30 &&
    scores.media <= 20 &&
    scores.capital <= 20 &&
    scores.labor <= 20
  ) {
    return {
      label: "Private builder",
      blurb:
        "You can make things, but adoption, distribution, ownership, and delegated output are still thin. Turn one build into a repeatable public loop.",
    };
  }
  if (max <= 30) {
    return {
      label: "Trading time",
      blurb:
        "Every output still costs you hours. Nothing compounds yet. Pick one lever and pull it hard.",
    };
  }
  if (scores.code >= 60 && scores.media >= 60) {
    return {
      label: "Permissionless operator",
      blurb:
        "Code and media are both live. You can produce and be heard without anyone's permission. Now add ownership.",
    };
  }
  if (scores.capital >= 65) {
    return {
      label: "Owner",
      blurb: "Capital is doing real work. Make sure code and media keep feeding it.",
    };
  }
  return {
    label: "Generalist",
    blurb:
      "No lever maxed, none dead. Your job is to find the one gating the rest and attack it.",
  };
}

/**
 * Build a ready-to-paste prompt that turns a leverage diagnosis into a plan.
 * Works in Claude Code (scaffolds files) or claude.ai (markdown). Sets Claude
 * up to act as Archimedes, a leverage coach focused on the binding constraint.
 */
export function buildClaudePrompt(scores: Scores): string {
  const key = bindingConstraint(scores);
  const lever = LEVER_BY_KEY[key];
  const cure = CURES[key];
  const prof = profile(scores);
  const index = leverageIndex(scores);
  const playLines = cure.plays
    .map((p, i) => `${i + 1}. [${p.horizon}] ${p.action} (proof: ${p.proof})`)
    .join("\n");

  return `You are Archimedes, a leverage coach. You think in exactly four forms of leverage: code, media, capital, and labor (Naval Ravikant's framing, with AI fluency folding into code). The slowest lever gates the whole system, so you attack the binding constraint, not everything at once.

Here is my current leverage diagnosis, each scored 0 to 100:

- Code:    ${scores.code}
- Media:   ${scores.media}
- Capital: ${scores.capital}
- Labor:   ${scores.labor}

Profile: ${prof.label}. ${prof.blurb}
Leverage index: ${index}/100 (geometric mean of the four levers).
Binding constraint: ${lever.name}. This is the lever gating everything else.

${cure.thesis}

The cure protocol for ${lever.name}:
First move (next 60 minutes): ${cure.firstMove}
Leading indicator to watch: ${cure.leadingIndicator}
The plays:
${playLines}

Your task: turn this protocol into a plan I will actually run over the next 90 days. Rules:
1. Attack ${lever.name} only. Do not spread effort across all four levers.
2. Adapt the plays to my situation (below): keep what fits, cut what does not, and make every step specific and named.
3. Structure the plan as:
   - This week: the first 3 actions, starting with the first move above.
   - 30 / 60 / 90 day milestones, each with a measurable target for my ${lever.name} score and for the leading indicator.
   - The single highest-leverage thing to ship first, and why.
4. End with the one move I should make in the next 60 minutes.

If you are running in Claude Code with file access, scaffold a "leverage-plan" folder with README.md (the plan) and CHECKLIST.md (the 7-day sprint). Otherwise, output the plan as markdown. After the plan, offer to go deeper on any step.

About me (I will fill this in): [your situation, skills, audience, current projects, and constraints].`;
}

/** localStorage key the diagnostic and the chat both read scores from. */
export const SCORES_STORAGE_KEY = "archimedes:scores:v1";

export function isScores(value: unknown): value is Scores {
  if (!value || typeof value !== "object") return false;
  const s = value as Record<string, unknown>;
  return (["code", "media", "capital", "labor"] as const).every(
    (key) => typeof s[key] === "number"
  );
}

/** System prompt for the Archimedes chat agent, grounded in the person's diagnosis. */
export function buildSystemPrompt(scores: Scores | null): string {
  const base = `You are Archimedes, a sharp and warm leverage coach. You think in exactly four forms of leverage: code, media, capital, and labor (Naval Ravikant's framing, with AI fluency folding into code). The slowest lever gates the whole system, so you push the person's binding constraint rather than spreading effort across all four.

Coaching style: concrete and named, never abstract. Prescribe the next real action, not a framework or a course. Keep replies short, a few sentences or a tight list. Ask at most one sharp question, and only when the answer would change your advice. Do not use em dashes or en dashes in your writing.`;

  if (!scores) {
    return `${base}

You do not have their lever scores yet. Invite them to run the diagnostic on the page, then coach from what they tell you.`;
  }

  const key = bindingConstraint(scores);
  const lever = LEVER_BY_KEY[key];
  const cure = CURES[key];
  const prof = profile(scores);
  const index = leverageIndex(scores);
  const playLines = cure.plays.map((p) => `- [${p.horizon}] ${p.action}`).join("\n");

  return `${base}

Their current diagnosis (0 to 100 each): Code ${scores.code}, Media ${scores.media}, Capital ${scores.capital}, Labor ${scores.labor}. Profile: ${prof.label}. Leverage index: ${index} out of 100. Their binding constraint is ${lever.name}: ${lever.constraintRx}

You have their cure protocol for ${lever.name}. First move: ${cure.firstMove} Leading indicator: ${cure.leadingIndicator} The plays:
${playLines}

Coach them through this protocol. Reference the specific plays, help them adapt the first move to their situation, and bias every answer toward raising ${lever.name} unless they steer you elsewhere.

Reference anchors on the same 0 to 100 scale, with leverage index in parens: ${ANCHORS.map(
    (anchor) => `${anchor.name} ${leverageIndex(anchor.scores)} (${anchor.tag.toLowerCase()})`
  ).join(", ")}. Their index is ${index}, so use the anchors for comparison and motivation when helpful, and remind them that most leveraged is not richest.`;
}

// ─────────────────────────── the cures ───────────────────────────

export const HORIZONS = ["This week", "30 days", "60 days", "90 days"] as const;
export type Horizon = (typeof HORIZONS)[number];

export interface CurePlay {
  horizon: Horizon;
  action: string;
  proof: string;
}

export interface CureProtocol {
  name: string;
  thesis: string;
  firstMove: string;
  leadingIndicator: string;
  plays: CurePlay[];
  failureModes: string[];
}

export const CURES = curesJson as unknown as Record<LeverKey, CureProtocol>;

export function playId(leverKey: LeverKey, index: number): string {
  return `${leverKey}:${index}`;
}

// ─────────────────────── shareable cards ───────────────────────

/** Scores as a URL segment: "35-12-4-5" in code, media, capital, labor order. */
export function scoreSlug(scores: Scores): string {
  return `${scores.code}-${scores.media}-${scores.capital}-${scores.labor}`;
}

export function parseScoreSlug(slug: string): Scores | null {
  const parts = slug.split("-");
  if (parts.length !== 4) return null;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isFinite(n) || n < 0 || n > 100)) return null;
  return {
    code: Math.round(nums[0]),
    media: Math.round(nums[1]),
    capital: Math.round(nums[2]),
    labor: Math.round(nums[3]),
  };
}

export interface NextPlay extends CurePlay {
  id: string;
  leverKey: LeverKey;
  leverName: string;
  index: number;
}

/** The single next play to work: the earliest-horizon uncompleted play of the binding constraint. */
export function nextPlay(scores: Scores, completed: Set<string>): NextPlay | null {
  const leverKey = bindingConstraint(scores);
  const cure = CURES[leverKey];
  const ranked = cure.plays
    .map((play, index) => ({
      ...play,
      id: playId(leverKey, index),
      leverKey,
      leverName: cure.name,
      index,
    }))
    .sort((a, b) => HORIZONS.indexOf(a.horizon) - HORIZONS.indexOf(b.horizon));
  return ranked.find((play) => !completed.has(play.id)) ?? null;
}

// ─────────────────────── the maxxing tracker ───────────────────────

export const COMPLETED_PLAYS_KEY = "archimedes:plays:v1";
export const HISTORY_KEY = "archimedes:history:v1";

export interface Snapshot {
  t: number;
  rubricVersion?: string;
  runId?: string;
  scores: Scores;
  index: number;
  confidence?: number;
  evidenceCount?: number;
  constraint?: LeverKey;
  answers?: Record<string, string>;
}
