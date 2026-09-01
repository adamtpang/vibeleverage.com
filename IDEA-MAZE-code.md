# Idea maze: code leverage

One sentence: mapping the real branches for using code as personal leverage, given the explicit decision this session not to build a Vibe Code agent, since Claude Code already covers that lever.

## Entry point
Are you building the software by hand, directing an AI agent to build it, or avoiding code entirely, and is code the product itself or the leverage underneath a non-code business.

## Branches

### Branch: full custom SaaS from scratch
- **What it is:** hand-coded product, traditional founder-engineer path.
- **Status:** 🏙️ Crowded but viable
- **Evidence:** the default path of most funded startups, still works, just high effort and no structural edge over anyone else doing the same thing.
- **Distance from other branches:** the baseline every other branch is a variant or shortcut of.

### Branch: AI-agent-directed build
- **What it is:** instruct Claude Code / Cursor-class tools to write and ship the software, human directs and reviews.
- **Status:** 🌱 Open (already claimed by Adam)
- **Evidence:** this is Adam's actual current mode of production, this whole session included. Claude Code leads SWE-bench Verified (~78.4%) and adoption (~41%) over the nearest agentic competitor.
- **Distance from other branches:** same output as "full custom SaaS," radically different effort curve.

### Branch: no-code / low-code
- **What it is:** Bubble, Webflow, Glide-class visual builders, zero hand-written code.
- **Status:** 🏙️ Crowded but viable
- **Evidence:** mature category, real businesses run on it, but hits a ceiling fast on anything with real logic, and doesn't compound the way a real codebase does.
- **Distance from other branches:** genuinely different bet, trades flexibility for speed at the low end.

### Branch: thin GPT-wrapper products
- **What it is:** a product whose entire value is "prompt plus thin UI" over a foundation model API.
- **Status:** 🪦 Dead end
- **Evidence:** the 2023-2024 wave of single-feature AI wrapper startups (résumé writers, email drafters, note summarizers) were repeatedly killed the moment OpenAI or Anthropic shipped the same feature natively. Root cause: no moat, the foundation model absorbs the feature for free.
- **Distance from other branches:** looks like "AI-agent-directed build" but isn't, no proprietary logic or data underneath.

### Branch: fork-and-customize from an open-source template
- **What it is:** start from a maintained, permissively-licensed starter and strip to fit, per the workspace's own standing rule.
- **Status:** 🌱 Open, low effort
- **Evidence:** inherits accessibility/SEO/test scaffolding for free, the exact rationale already codified in this workspace's CLAUDE.md.
- **Distance from other branches:** a modifier on the other build branches, not a separate destination, applies to whichever branch is chosen.

### Branch: dev agency / build-for-others
- **What it is:** sell coding services or bespoke builds to clients.
- **Status:** 🏙️ Crowded
- **Evidence:** ancient, saturated market, and it's labor leverage wearing a code costume, income caps at hours sold.
- **Distance from other branches:** actually belongs closer to the labor maze than the code maze.

### Branch: autonomous coding agent as a standalone product
- **What it is:** build and sell your own Devin-style autonomous coding agent.
- **Status:** 🪦 Dead end (for Adam specifically)
- **Evidence:** Devin trails Claude Code on both benchmark (60.8% vs 78.4% SWE-bench Verified) and adoption (~8% vs ~41%, April 2026), and it's a subscription Adam already has an equal-or-better version of. This is the branch explicitly retired this session.
- **Distance from other branches:** the mirror image of "AI-agent-directed build," building the tool instead of using it.

## The live path
AI-agent-directed build, on top of a fork-and-customize starting point when a new repo is needed. It's already proven, already the fastest branch available, and the standalone-agent branch was checked and correctly ruled out, no reason to walk back into it.

Verification notes (2026-08-14): Devin vs Claude Code benchmark and adoption figures and the GPT-wrapper dead-end pattern sourced via live search this session (see chat, Vibe labor/media/capital research agents). No new evidence contradicts the code-agent retirement decision.
