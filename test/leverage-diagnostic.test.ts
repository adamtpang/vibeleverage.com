import assert from "node:assert/strict";
import test from "node:test";

import {
  DIAGNOSTIC_QUESTIONS,
  buildImprovementPrompt,
  diagnoseLeverage,
  type DiagnosticAnswers,
} from "../lib/leverage-diagnostic";
import { bindingConstraint } from "../lib/levers";

function allAnswers(optionId: string): DiagnosticAnswers {
  return Object.fromEntries(
    DIAGNOSTIC_QUESTIONS.map((question) => [question.id, optionId])
  );
}

test("a complete zero-evidence baseline scores every lever at zero", () => {
  const diagnosis = diagnoseLeverage(allAnswers("0"), "2026-08-28T00:00:00.000Z");

  assert.equal(diagnosis.complete, true);
  assert.equal(diagnosis.confidence, 100);
  assert.deepEqual(diagnosis.scores, {
    code: 0,
    media: 0,
    capital: 0,
    labor: 0,
  });
  assert.equal(diagnosis.constraint, "media");
});

test("unknown evidence reduces coverage without changing an answered score", () => {
  const diagnosis = diagnoseLeverage({ "code-users": "100" });
  const code = diagnosis.scorecards.find((scorecard) => scorecard.lever === "code");

  assert.equal(code?.reportedScore, 100);
  assert.ok((code?.confidence ?? 100) < 100);
  assert.equal(diagnosis.complete, false);
  assert.equal(diagnosis.answered, 1);
});

test("identical evidence produces a stable run id during server and client render", () => {
  const answers = allAnswers("20");
  const serverDiagnosis = diagnoseLeverage(answers);
  const clientDiagnosis = diagnoseLeverage({ ...answers });

  assert.equal(serverDiagnosis.runId, clientDiagnosis.runId);
  assert.match(serverDiagnosis.runId, /^leverage-2026-08-28\.v1-[a-f0-9]{8}$/);
  assert.equal(serverDiagnosis.createdAt, "unrecorded");
});

test("permissionless levers are sequenced before capital and labor", () => {
  assert.equal(
    bindingConstraint({ code: 35, media: 20, capital: 10, labor: 0 }),
    "media"
  );
  assert.equal(
    bindingConstraint({ code: 65, media: 60, capital: 10, labor: 0 }),
    "capital"
  );
  assert.equal(
    bindingConstraint({ code: 65, media: 60, capital: 60, labor: 0 }),
    "labor"
  );
});

test("the improvement prompt attacks one check and carries receipt guardrails", () => {
  const diagnosis = diagnoseLeverage(allAnswers("0"), "2026-08-28T00:00:00.000Z");
  const prompt = buildImprovementPrompt(diagnosis, "vibeleverage.com");
  const work = prompt.split("PRIORITIZED WORK\n")[1].split("\n\nWORKING RULES")[0];

  assert.match(prompt, /Run: leverage-2026-08-28/);
  assert.match(prompt, /Rubric: 2026-08-28\.v1/);
  assert.match(prompt, /Do not fabricate users, subscribers, revenue/);
  assert.match(prompt, /same audit/);
  assert.equal((work.match(/^\d+\./gm) ?? []).length, 1);
});

test("frontier answers require complete coverage before a verified 100", () => {
  const diagnosis = diagnoseLeverage(allAnswers("100"));

  assert.equal(diagnosis.complete, true);
  assert.equal(diagnosis.confidence, 100);
  assert.deepEqual(diagnosis.scores, {
    code: 100,
    media: 100,
    capital: 100,
    labor: 100,
  });
  assert.equal(diagnosis.findings.length, 0);
});
