import {
  CURES,
  LEVER_BY_KEY,
  LEVERS,
  bindingConstraint,
  leverageIndex,
  type LeverKey,
  type Scores,
} from "@/lib/levers";

export const LEVERAGE_RUBRIC_VERSION = "2026-08-28.v1";

export type CheckStatus = "pass" | "partial" | "fail" | "na" | "unknown";

export interface EvidenceOption {
  id: string;
  label: string;
  score: number;
}

export interface EvidenceQuestion {
  id: string;
  lever: LeverKey;
  title: string;
  prompt: string;
  weight: number;
  recommendation: string;
  options: EvidenceOption[];
}

export type DiagnosticAnswers = Record<string, string>;

export interface EvidenceCheck {
  id: string;
  lever: LeverKey;
  title: string;
  status: CheckStatus;
  score: number | null;
  weight: number;
  evidence: string;
  recommendation: string;
  acceptance: string;
}

export interface LeverScorecard {
  lever: LeverKey;
  label: string;
  score: number;
  reportedScore: number;
  confidence: number;
  answered: number;
  total: number;
  checks: EvidenceCheck[];
}

export interface LeverageFinding extends EvidenceCheck {
  impact: number;
}

export interface LeverageDiagnosis {
  version: 2;
  rubricVersion: string;
  runId: string;
  createdAt: string;
  scores: Scores;
  index: number;
  constraint: LeverKey;
  confidence: number;
  answered: number;
  total: number;
  complete: boolean;
  scorecards: LeverScorecard[];
  checks: EvidenceCheck[];
  findings: LeverageFinding[];
  limitations: string[];
}

const SCORE_BANDS = [0, 20, 40, 60, 80, 100] as const;

function bands(labels: [string, string, string, string, string, string]): EvidenceOption[] {
  return labels.map((label, index) => ({
    id: String(SCORE_BANDS[index]),
    label,
    score: SCORE_BANDS[index],
  }));
}

export const DIAGNOSTIC_QUESTIONS: EvidenceQuestion[] = [
  {
    id: "code-users",
    lever: "code",
    title: "External adoption",
    prompt: "How many people use software you own in a typical month?",
    weight: 3,
    recommendation:
      "Make one software outcome usable by people who are not you, instrument monthly active users, and grow the next verified band.",
    options: bands([
      "Nobody uses software I own",
      "Only I use it",
      "2 to 99 monthly users",
      "100 to 9,999 monthly users",
      "10,000 to 9.9 million monthly users",
      "10 million or more monthly users",
    ]),
  },
  {
    id: "code-output",
    lever: "code",
    title: "Autonomous output",
    prompt: "How much useful work does your software produce without you each week?",
    weight: 2,
    recommendation:
      "Put the highest-frequency manual workflow on a trigger and measure the human hours or transactions it replaces.",
    options: bands([
      "Nothing runs without me",
      "I have scripts, but I launch every run",
      "Triggered automations replace less than 5 hours each week",
      "Reliable services replace 5 to 100 hours each week",
      "Self-serve systems produce more than 100 human-hours each week",
      "World-scale infrastructure produces millions of human-hours each week",
    ]),
  },
  {
    id: "code-resilience",
    lever: "code",
    title: "Independence",
    prompt: "How long does the software keep delivering correctly without your intervention?",
    weight: 2,
    recommendation:
      "Add monitoring, recovery, documentation, and maintainers until the system survives a longer absence from you.",
    options: bands([
      "There is no deployed system",
      "It completes one run, then needs me again",
      "It runs for a week but needs regular intervention",
      "It runs for at least 30 days without intervention",
      "Other maintainers can operate and improve it without me",
      "The ecosystem can continue if I disappear permanently",
    ]),
  },
  {
    id: "code-revenue",
    lever: "code",
    title: "Economic output",
    prompt: "How much monthly revenue is directly attributable to software you own?",
    weight: 1,
    recommendation:
      "Attach a real price or revenue event to the software with the strongest repeated usage.",
    options: bands([
      "No deployed software and no revenue",
      "Deployed software, but no attributable revenue",
      "Less than $1,000 per month",
      "$1,000 to $99,999 per month",
      "$100,000 to $9.9 million per month",
      "$10 million or more per month",
    ]),
  },
  {
    id: "media-owned",
    lever: "media",
    title: "Owned audience",
    prompt: "How many people can you reach directly through an email, RSS, or subscriber list you control?",
    weight: 3,
    recommendation:
      "Create one owned subscriber destination and make every useful public artifact point to it.",
    options: bands([
      "No owned subscribers",
      "1 to 99 owned subscribers",
      "100 to 999 owned subscribers",
      "1,000 to 99,999 owned subscribers",
      "100,000 to 9.9 million owned subscribers",
      "10 million or more owned subscribers",
    ]),
  },
  {
    id: "media-consumption",
    lever: "media",
    title: "Consumption",
    prompt: "How many measured views, listens, or reads does your work receive in a typical month?",
    weight: 2,
    recommendation:
      "Publish one useful flagship artifact, distribute it through one primary channel, and measure total consumption.",
    options: bands([
      "No measured consumption",
      "Fewer than 1,000 monthly views, listens, or reads",
      "1,000 to 99,999 monthly views, listens, or reads",
      "100,000 to 9.9 million monthly views, listens, or reads",
      "10 million to 999 million monthly views, listens, or reads",
      "1 billion or more monthly views, listens, or reads",
    ]),
  },
  {
    id: "media-cadence",
    lever: "media",
    title: "Publishing system",
    prompt: "What publishing cadence have you actually sustained?",
    weight: 2,
    recommendation:
      "Choose one format and publish on the same weekly cadence until the process no longer depends on inspiration.",
    options: bands([
      "I do not publish",
      "I publish sporadically",
      "At least weekly for 8 consecutive weeks",
      "At least weekly for 12 consecutive months",
      "A team or system publishes across multiple formats every day",
      "A global media system has compounded daily for years",
    ]),
  },
  {
    id: "media-inbound",
    lever: "media",
    title: "Evergreen inbound",
    prompt: "How many useful unsolicited opportunities does old content create each month?",
    weight: 1,
    recommendation:
      "Add a specific call to action and attribution to evergreen work, then track subscribers, users, and buyers it creates.",
    options: bands([
      "No measurable inbound from old content",
      "About 1 useful inbound event per month",
      "2 to 10 useful inbound events per month",
      "11 to 100 useful inbound events per month",
      "101 to 9,999 useful inbound events per month",
      "10,000 or more useful inbound events per month",
    ]),
  },
  {
    id: "capital-deployable",
    lever: "capital",
    title: "Deployable capital",
    prompt: "How much capital can you deploy without endangering basic living expenses?",
    weight: 2,
    recommendation:
      "Protect a cash buffer, then build a separate pool that can buy productive assets or ownership.",
    options: bands([
      "No safe deployable capital",
      "Less than $1,000",
      "$1,000 to $99,999",
      "$100,000 to $9.9 million",
      "$10 million to $9.9 billion",
      "$10 billion or more",
    ]),
  },
  {
    id: "capital-cashflow",
    lever: "capital",
    title: "Owned cash flow",
    prompt: "What share of your living expenses is covered by recurring income from assets or ownership?",
    weight: 3,
    recommendation:
      "Convert one-off earnings into recurring ownership income and measure the percentage of expenses it covers.",
    options: bands([
      "0 percent",
      "Less than 10 percent",
      "10 to 99 percent",
      "100 to 999 percent",
      "10 to 999 times living expenses",
      "1,000 times living expenses or more",
    ]),
  },
  {
    id: "capital-track-record",
    lever: "capital",
    title: "Allocation record",
    prompt: "How much audited history shows that your capital allocation compounds?",
    weight: 2,
    recommendation:
      "Write an allocation policy and keep a dated record of every decision, return, loss, and lesson.",
    options: bands([
      "No allocation record",
      "Saving only, with no measured return record",
      "A positive documented record shorter than 1 year",
      "A documented record across at least 3 years",
      "An institutional record across multiple market cycles",
      "A category-defining record sustained across decades",
    ]),
  },
  {
    id: "capital-control",
    lever: "capital",
    title: "Capital under control",
    prompt: "How much third-party capital can you responsibly allocate?",
    weight: 1,
    recommendation:
      "Earn trust through small, documented allocations before seeking control of larger pools.",
    options: bands([
      "No third-party capital",
      "Only informal access to friends or family capital",
      "Less than $100,000",
      "$100,000 to $99.9 million",
      "$100 million to $99.9 billion",
      "$100 billion or more",
    ]),
  },
  {
    id: "labor-contributors",
    lever: "labor",
    title: "Recurring contributors",
    prompt: "How many people regularly produce useful output inside a system you lead?",
    weight: 3,
    recommendation:
      "Delegate one repeated, documented outcome to one accountable person before adding more people.",
    options: bands([
      "0 people",
      "1 person",
      "2 to 9 people",
      "10 to 999 people",
      "1,000 to 99,999 people",
      "100,000 people or more",
    ]),
  },
  {
    id: "labor-independence",
    lever: "labor",
    title: "Operating independence",
    prompt: "How long does coordinated human output continue without your daily involvement?",
    weight: 2,
    recommendation:
      "Define outcomes, decision rights, and a review cadence so delegated work survives a longer absence.",
    options: bands([
      "All human output stops without me",
      "Delegated tasks still need daily direction",
      "A documented process runs for one week without me",
      "A manager or owner runs the system for at least one month",
      "The organization runs for a quarter without my involvement",
      "The institution can outlive my leadership",
    ]),
  },
  {
    id: "labor-systems",
    lever: "labor",
    title: "Operating system",
    prompt: "How much of the work is documented and owned by someone besides you?",
    weight: 2,
    recommendation:
      "Document the highest-frequency workflow, assign one owner, and test whether they can run it without questions.",
    options: bands([
      "Nothing is documented or delegated",
      "One checklist exists",
      "Several recurring workflows are documented",
      "Owners maintain the core operating procedures",
      "Multiple management layers run a shared operating system",
      "A global institution evolves its operating system without me",
    ]),
  },
  {
    id: "labor-output",
    lever: "labor",
    title: "Human output multiplier",
    prompt: "How many useful human work-hours happen each week without consuming your own hours?",
    weight: 1,
    recommendation:
      "Measure delegated hours that produce accepted outcomes, not headcount or meetings.",
    options: bands([
      "0 hours",
      "Fewer than 10 hours",
      "10 to 99 hours",
      "100 to 9,999 hours",
      "10,000 to 999,999 hours",
      "1 million hours or more",
    ]),
  },
];

export const QUESTION_BY_ID = Object.fromEntries(
  DIAGNOSTIC_QUESTIONS.map((question) => [question.id, question])
) as Record<string, EvidenceQuestion>;

function statusFor(score: number): CheckStatus {
  if (score >= 80) return "pass";
  if (score >= 40) return "partial";
  return "fail";
}

function evaluateQuestion(question: EvidenceQuestion, answerId?: string): EvidenceCheck {
  const selected = question.options.find((option) => option.id === answerId);
  if (!selected) {
    return {
      id: question.id,
      lever: question.lever,
      title: question.title,
      status: "unknown",
      score: null,
      weight: question.weight,
      evidence: "No factual range selected.",
      recommendation: question.recommendation,
      acceptance: "Select the current factual range and retain the source used to verify it.",
    };
  }

  const next = question.options.find((option) => option.score > selected.score);
  return {
    id: question.id,
    lever: question.lever,
    title: question.title,
    status: statusFor(selected.score),
    score: selected.score,
    weight: question.weight,
    evidence: selected.label,
    recommendation: question.recommendation,
    acceptance: next
      ? `A dated source verifies: ${next.label}.`
      : `A dated source continues to verify the frontier band: ${selected.label}.`,
  };
}

function evidenceFingerprint(answers: DiagnosticAnswers): string {
  const normalized = DIAGNOSTIC_QUESTIONS.map(
    (question) => `${question.id}:${answers[question.id] ?? "unknown"}`
  ).join("|");
  let hash = 0x811c9dc5;

  for (let index = 0; index < normalized.length; index += 1) {
    hash ^= normalized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function diagnoseLeverage(
  answers: DiagnosticAnswers,
  recordedAt?: string
): LeverageDiagnosis {
  const checks = DIAGNOSTIC_QUESTIONS.map((question) =>
    evaluateQuestion(question, answers[question.id])
  );

  const scorecards = LEVERS.map((lever): LeverScorecard => {
    const leverChecks = checks.filter((check) => check.lever === lever.key);
    const answeredChecks = leverChecks.filter(
      (check): check is EvidenceCheck & { score: number } => check.score !== null
    );
    const totalWeight = leverChecks.reduce((sum, check) => sum + check.weight, 0);
    const answeredWeight = answeredChecks.reduce((sum, check) => sum + check.weight, 0);
    const confidence = totalWeight ? Math.round((answeredWeight / totalWeight) * 100) : 0;
    const reportedScore = answeredWeight
      ? Math.round(
          answeredChecks.reduce((sum, check) => sum + check.score * check.weight, 0) /
            answeredWeight
        )
      : 0;

    return {
      lever: lever.key,
      label: lever.name,
      score: reportedScore,
      reportedScore,
      confidence,
      answered: answeredChecks.length,
      total: leverChecks.length,
      checks: leverChecks,
    };
  });

  const scores = Object.fromEntries(
    scorecards.map((scorecard) => [scorecard.lever, scorecard.score])
  ) as Scores;
  const constraint = bindingConstraint(scores);
  const answered = checks.filter((check) => check.score !== null).length;
  const confidence = Math.round((answered / checks.length) * 100);
  const findings = checks
    .filter((check) => check.status !== "pass")
    .map((check): LeverageFinding => ({
      ...check,
      impact: check.weight * (100 - (check.score ?? 0)),
    }))
    .sort((a, b) => {
      const aConstraint = a.lever === constraint ? 1 : 0;
      const bConstraint = b.lever === constraint ? 1 : 0;
      return bConstraint - aConstraint || b.impact - a.impact || a.title.localeCompare(b.title);
    });

  return {
    version: 2,
    rubricVersion: LEVERAGE_RUBRIC_VERSION,
    runId: recordedAt
      ? `leverage-${recordedAt}`
      : `leverage-${LEVERAGE_RUBRIC_VERSION}-${evidenceFingerprint(answers)}`,
    createdAt: recordedAt ?? "unrecorded",
    scores,
    index: leverageIndex(scores),
    constraint,
    confidence,
    answered,
    total: checks.length,
    complete: answered === checks.length,
    scorecards,
    checks,
    findings,
    limitations: [
      "This audit uses factual ranges supplied by the person. It does not independently verify private analytics, revenue, assets, or team output.",
      "Social followers are rented distribution. Owned audience means a list or subscriber relationship the person can reach directly.",
      "AI agents count as code, not labor. Labor means recurring output from people.",
      "A score changes only when the underlying evidence changes. Editing an answer without new evidence is not progress.",
    ],
  };
}

export function buildImprovementPrompt(
  diagnosis: LeverageDiagnosis,
  projectName = "the project most directly responsible for the binding constraint"
): string {
  const constraint = LEVER_BY_KEY[diagnosis.constraint];
  const cure = CURES[diagnosis.constraint];
  const scorecardLines = diagnosis.scorecards
    .map(
      (scorecard) =>
        `- ${scorecard.label}: ${scorecard.score}/100, ${scorecard.confidence}% confidence (${scorecard.answered}/${scorecard.total} checks answered)`
    )
    .join("\n");
  const work = diagnosis.findings
    .filter((finding) => finding.lever === diagnosis.constraint)
    .slice(0, 1)
    .map(
      (finding, index) => `${index + 1}. ${finding.title}
   Evidence: ${finding.evidence}
   Change: ${finding.recommendation}
   Done when: ${finding.acceptance}`
    )
    .join("\n\n");

  return `You are the implementation agent for a real leverage improvement cycle.

PERSON
The owner of ${projectName}

MEASURED BASELINE
Run: ${diagnosis.runId}
Rubric: ${diagnosis.rubricVersion}
Leverage index: ${diagnosis.index}/100
Evidence confidence: ${diagnosis.confidence}% (${diagnosis.answered}/${diagnosis.total} checks answered)
${scorecardLines}

BINDING CONSTRAINT
${constraint.name}: ${constraint.constraintRx}

PROJECT
${projectName}

OBJECTIVE
${diagnosis.complete ? `Raise ${constraint.name} through real-world evidence. Use the project to make the next measurable outcome easier, then collect the receipt and rerun the same diagnostic.` : `Complete the missing evidence first. Do not treat the provisional score or constraint as verified until all ${diagnosis.total} checks are answered.`} Do not spread effort across all four levers.

CURE
${cure.thesis}
First move: ${cure.firstMove}
Leading indicator: ${cure.leadingIndicator}

PRIORITIZED WORK
${work || "Complete the missing evidence checks before selecting implementation work."}

WORKING RULES
1. Read the actual project and its instructions before editing.
2. Reproduce the stated baseline from real files, public metrics, or owner-supplied evidence.
3. Make the smallest change that can move the binding constraint's leading indicator.
4. Do not raise a score because code shipped. Raise it only after the acceptance condition is verified by changed real-world evidence.
5. Do not fabricate users, subscribers, revenue, assets, contributors, dates, testimonials, or analytics.
6. AI agents count as Code. They do not count as human Labor.
7. Never publish, message another person, move money, hire, deploy, commit, or push without the owner's explicit authorization for that action.
8. Preserve existing work and add focused tests for scoring or shared behavior changes.

ITERATION LOOP
1. Diagnose from the current evidence.
2. Implement the highest-impact applicable cure in ${projectName}.
3. Run tests and verify the project behavior.
4. Collect the dated user, audience, revenue, or delegation receipt required by the acceptance condition.
5. Rerun the same audit and record the before and after scores.
6. Repeat against the new binding constraint.

STOPPING RULE
Stop only when every applicable check is supported by evidence at the 100 band. If the next score requires elapsed time, external users, audience growth, revenue, capital, or human output, report the exact owner action and wait for that evidence. Never simulate progress by editing the rubric or self-rating upward.

VERIFICATION
- Report changed files and commands run.
- Report the before and after evidence, not only the score.
- List unverified claims and owner-only actions separately.
- Do not claim 100/100 unless every 100-band acceptance condition has a dated receipt.`;
}
