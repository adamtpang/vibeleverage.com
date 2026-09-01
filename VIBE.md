# VIBE.md: the four lever agents

Architecture for turning vibeleverage.com from a diagnosis into four agents
that do the curing. Written 2026-08-10, grounded in the real codebase, not
a floating concept.

## The naming

Not "Claude Code / Media / Capital / Labor." Those are Anthropic's own
product names; using them would read as an Anthropic release, not a
vibeleverage.com one. The family name is **Vibe** because each lever should
become a natural operating mode, not a sterile score. Four agents:

- **Vibe Code**
- **Vibe Media**
- **Vibe Capital**
- **Vibe Labor**

## The pattern, and what already exists

`lib/levers.ts` already has the shape for this. Every `Lever` has a
`cure` (one line) and `moves` (concrete next actions, most actionable
first). Today those render as text in `cure-protocol.tsx`. A Vibe
agent is what happens when `moves` stops being a paragraph you read and
starts being a task list an agent executes.

```
Diagnose (exists)  →  Cure Protocol (exists, text-only)  →  Vibe Agent (new, executes)
lib/levers.ts          cure-protocol.tsx                     app/api/vibe/[lever]/route.ts
```

## The real gap: `app/api/chat/route.ts` cannot take actions

Read it. It streams `content_block_delta` text events from a plain
`anthropic.messages.stream()` call, no `tools` array, no `tool_use`
handling. It can talk about your levers. It cannot touch anything. This
is the actual, concrete, first build step before any of the four agents
below can exist: convert that route from a text-completion stream into a
**tool-use agent loop** (Anthropic's Messages API already supports this,
it's the same primitive that makes me, Claude Code, able to act instead
of just answer). Everything below assumes that conversion happens once,
shared by all four agents, not once per agent.

## Shared architecture, all four agents

- One agent loop (`tool_use` + `tool_result`, looped until the model
  stops calling tools), reused across all four, only the **tool array**
  and **system prompt** change per lever.
- Every tool call gets logged to a per-user action log, visible in the
  UI, the same way a Claude Code transcript shows every tool call it
  made. No agent acts invisibly.
- Every irreversible or external action requires an explicit confirm
  step in the UI before the tool actually runs, mirroring the
  Explicit-permission-required category I operate under myself.

## Vibe Code

**Tools:** a sandboxed code execution environment (already exists as a
pattern, e.g. E2B or a Vercel sandbox), git operations against a repo
the user connects, a deploy hook (Vercel API).

**Feedback loop:** run it, read the error, fix it, run it again. Closes
almost all the way to autonomous, this is the proven loop, it is
literally how I work.

**Human-in-loop line:** the user connects the repo and approves the
first deploy. After that, iteration can run with less oversight, since
each step is reversible (git revert, redeploy).

**Concrete first task:** "ship one automation that does a recurring task
without you," directly from `LEVERS[0].moves[0]`. The agent scaffolds
the script, runs it, shows the diff, deploys on approval.

## Vibe Media

**This one is not hypothetical, it already exists as a working
prototype**, `tools/podcast-pipeline` (this session, this repo family):
`transcribe.py` (Whisper), `cut.py` (ffmpeg trim/concat, now handles
video), `autoclean.py` (filler/gap detection). The exact tool boundary
Vibe Media needs is what those three scripts already do, plus
publish-API calls (YouTube, Spotify, X) once a human approves the cut.

**Tools:** local transcription, a cut/trim engine, thumbnail generation,
publish APIs per platform.

**Feedback loop:** views/engagement instead of test-pass/fail. Closes
almost all the way, same shape as Code, the loop just runs slower
(hours to days for a metric to come back instead of seconds).

**Human-in-loop line:** exactly where this session actually drew it,
twice, the hard way. Guest consent before anything ships (a real
person's likeness and words), and an explicit, real-time send
confirmation before anything posts. Both stay permanently manual, not a
v1 limitation, a standing rule.

**Concrete first task:** point it at a raw recording, get back an edited
cut, chapters, thumbnail, title, description, ready for a human to
review and send. This is `podcast-pipeline`'s entire current job,
formalizing it into `app/api/vibe/media/route.ts` is mostly wiring,
not new invention.

## Vibe Capital

**Built (2026-08-14), the draft-only slice of this spec.** `lib/vibe/capital-jobs.ts`
+ `app/vibe/capital`: given a subject and context, the local `claude` CLI runs with
exactly one tool, WebSearch, to find real sourced comps, then drafts a priced
recommendation and a ready-to-review document. The human-approved step writes that
draft to a local file, `.vibe/capital-drafts/<id>.md`. There is no send step and no
money-movement tool anywhere in the module, by design, not a v1 gap. Verified live
against a real case, the Quantus ambassador invoice this same session did by hand
first, per the standing manual-before-automation rule: the agent independently found
comps the manual pass hadn't (ZipRecruiter Web3 rates, a STON.fi event-manager
listing, agency retainer ranges) and converged on the same number. Not yet built: read
access to accounting/invoicing data or the `moneymeta.fun` market-cap math below, this
slice only covers the pricing-research half of the original spec.

**Tools:** read access to accounting/invoicing data, a pricing/market-comp
tool (the same shape as the `price-research` skill), the market-cap math
already in `moneymeta.fun`/`adampang.com`'s `projects.yml`.

**Feedback loop:** structurally cannot close autonomously. This is the
one lever where "run it and see" means real money moving, so the loop
stops one step early by design.

**Human-in-loop line:** everywhere money moves or advice is given. The
agent can draft an invoice, is not allowed to send it uncontested. Can
build the case for a price, cannot execute a trade. Full autonomy up to
the trigger, a human hand stays on the trigger, always. This mirrors
the Prohibited-actions list I operate under myself, not a product
decision to relitigate later.

**Concrete first task:** "every way to make money, ranked S to D," the
`moneymeta.fun` framework, run against the user's own real numbers
instead of a general market, output a drafted invoice or price change
the user reviews and sends themselves.

## Vibe Labor

**Built (2026-08-14), the AI-labor half of this spec.** `lib/vibe/labor-jobs.ts` +
`app/vibe/labor`: a planner call decomposes a recurring task into 3-5 independent
subtasks, a small fleet of local `claude` CLI workers (WebSearch/WebFetch/Read/Glob/Grep,
no mutation tools at all) runs them in parallel, a synthesizer combines the results into
one report. Closes fully autonomous end to end, no send/execute step exists because none
is needed, nothing here moves money or publishes anything. Verified live on a 3-item
lookup task, planner + 3 parallel workers + synthesizer all completed and cross-verified
sources correctly. A first live run on a heavier 4-subtask task exposed a real gap, one
slow worker with no timeout stalled the whole job indefinitely, so every `claude` CLI
call now carries a hard timeout (4 min for tool-using workers, 90s for the planner and
synthesizer) that kills the child process rather than hanging forever. Not yet built:
the human-labor half, job-post and contract drafting that stops at "ready, not sent,"
mirroring how Capital's draft-only invoice step works.

**Tools:** the same multi-agent orchestration primitive used to build
several of this session's own artifacts (parallel subagents, one
judgment directing many hands), plus, for real human labor,
job-post drafting and contract drafting.

**Feedback loop:** AI-labor side closes fully autonomous (spin up
agents, get results, judge quality, iterate). Human-labor side cannot,
same reason as Capital, hiring and paying a real person is not a
reversible test run.

**Human-in-loop line:** AI-agent fleets can run unattended once scoped.
Human hiring stops at "the drafted job post and screening criteria are
ready," the actual hire/fire/pay decision stays the user's.

**Concrete first task:** "turn your most-repeated workflow into a tool
other people can run" (`LEVERS[0].moves[1]`, actually a Code move, but
Labor's real first task is the mirror of it), take a recurring task the
user does by hand, spin up a small agent fleet to do it in parallel, and
report results for review.

## Build order

Media first. It already works, `podcast-pipeline` is the proof, the
remaining work is wiring an existing pipeline into the site's agent
loop, not inventing a new capability. Code second, same reasoning, the
loop is proven, just needs a sandboxed execution environment connected.
Capital and Labor come after the shared tool-use conversion of
`app/api/chat/route.ts` is stable and trusted on the first two, since
both carry the harder human-in-loop line to get right.

## What this is not

Not a promise that any of these four ever run fully unattended on
Capital or Labor. That is a design decision, stated here so it does not
quietly get relitigated three sessions from now. Not a rename of
`app/api/chat/route.ts`, that route becomes the shared agent loop
underneath all four, the diagnosis and chat experience on top of it stay
as they are.
