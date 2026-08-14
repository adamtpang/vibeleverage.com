# Idea maze: media leverage

One sentence: mapping the real branches for Fulcrum Media, the AI agent for the media lever, before extending it past what's already proven this season.

## Entry point
Do you produce content yourself with AI assistance and publish under your own review, or deploy an agent that decides and publishes on its own, and does it use your real identity or a synthetic persona.

## Branches

### Branch: editing-assist tools
- **What it is:** transcribe, cut, caption, score segments, human still presses publish. Descript (Underlord agent, now with an API), Riverside.fm (Magic Clips, Magic Episode).
- **Status:** 🏙️ Crowded but viable
- **Evidence:** mature, funded, real usage, $15-30/mo (Descript) to $24-79/mo (Riverside). Mechanistically close to Fulcrum Media's own transcribe-propose-package loop.
- **Distance from other branches:** closest branch to what's already built, differs mainly in hosted vs. local/free.

### Branch: autonomous clip-and-schedule
- **What it is:** the agent finds, cuts, reframes, and auto-posts without a human touching each piece. Opus Clip's "Agent Opus" (launched Aug 2025).
- **Status:** 🌱 Open, but reliability-flagged
- **Evidence:** reviews report 20-40% of its output still gets discarded or reworked by a human, and TikTok auto-post specifically has documented silent failures. Open because it half-works, not because it's solved.
- **Distance from other branches:** one step past editing-assist, the step that trades review-quality for automation and currently loses some quality doing it.

### Branch: AI-influencer / synthetic persona
- **What it is:** generate a persistent photorealistic persona and run it as a content brand. AI Fluencer Studio, MakeInfluencer AI, TheInfluencer.ai, and others, several explicitly built for OnlyFans-style monetization.
- **Status:** 🏙️ Crowded
- **Evidence:** dozens of near-identical tools, real usage, but it's a different business than "Adam's own leverage," it's selling a fake person, not amplifying a real one.
- **Distance from other branches:** a fundamentally different bet, identity-as-product instead of content-as-leverage.

### Branch: pre-warmed account farming
- **What it is:** buy already-"warmed" social accounts to post through, sidestepping platform trust-building. Fastlane sells these at $80/mo/account.
- **Status:** 🪦 Dead end
- **Evidence:** almost certainly ToS-violating on the platform side, account-farming has a long history of mass bans across TikTok/Instagram once detected. Root cause: the leverage is fake, borrowed trust a platform can revoke in one sweep.
- **Distance from other branches:** looks adjacent to "AI-influencer" but is actually a distribution-fraud branch, not a content branch.

### Branch: AI ghostwriting agent
- **What it is:** ingest existing content as a knowledge base, draft in your voice, human approves, publish via the platform's own API. Oiti (LinkedIn) is the clearest example.
- **Status:** 🌱 Open, less crowded than video
- **Evidence:** concrete mechanism, real product, but the category has far fewer serious players than the video-editing space, an underexplored branch for a text/newsletter angle.
- **Distance from other branches:** parallel to editing-assist but for writing instead of video, largely unclaimed.

### Branch: own local pipeline, strict per-cut human approval
- **What it is:** what's already built this season, Whisper + ffmpeg locally, Claude packages titles/chapters, every cut approved individually via a card UI, human always presses send.
- **Status:** 🌱 Open / live path
- **Evidence:** proven this season on 5 real episodes. Stricter than every crowded competitor's publish gate, and structurally the opposite of the Fastlane/farming dead end.
- **Distance from other branches:** the branch already being walked; extending it toward the ghostwriting branch (text/newsletter) is the nearest unclaimed adjacent move.

## The live path
Keep the local pipeline as the core, it's proven and stricter than the market. The one adjacent branch worth a manual pass before any build: AI ghostwriting for a text channel, since it's genuinely less crowded than anything on the video side and reuses the same transcript data already being generated per episode.

Verification notes (2026-08-14): sourced via live search this session across Descript, Riverside, Opus Clip, Fastlane, and Oiti. Fastlane's account-farming offering confirmed directly from its own product pages.
