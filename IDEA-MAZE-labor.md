# Idea maze: labor leverage

One sentence: mapping the real branches for Fulcrum Labor, including the option that the highest-leverage version of this isn't a product at all.

## Entry point
Is the labor being leveraged real humans you hire and manage, or AI agents standing in for a labor role, and does the automation ever touch the actual hire/fire decision.

## Branches

### Branch: multi-agent orchestration infrastructure
- **What it is:** the plumbing layer for running fleets of agents. LangGraph (largest production footprint in 2026), CrewAI (role-based, easiest to prototype), Microsoft AutoGen (conversational, research-heavy).
- **Status:** 🏙️ Crowded infra layer
- **Evidence:** all three are mature, funded, widely adopted. Not a product to compete with, this is what any Fulcrum Labor build would sit on top of, not next to.
- **Distance from other branches:** foundational layer underneath every other branch on this maze, not a destination itself.

### Branch: "AI employee" full-function platforms
- **What it is:** sell a complete autonomous digital worker for a specific job function. Lindy.ai ($54M raised, 5,000+ customers), 11x.ai ("Alice," $75M+ raised), Artisan AI ("Ava," notable for an explicit autonomy dial with escalation rules and an audit trail).
- **Status:** 🏙️ Crowded but viable
- **Evidence:** real funding, real customers, this is the category Manus AI broke out of before its ~$2-3B Meta acquisition in December 2025. A Fulcrum Labor built as "another AI SDR/employee" would be entering an already-funded, already-competitive field with no structural edge.
- **Distance from other branches:** the natural-sounding destination that turns out to be the most contested one.

### Branch: AI-assisted human hiring tools
- **What it is:** draft job posts, screen and rank candidates, auto-schedule interviews, real people still get hired. Greenhouse, Paradox, Findem, Bullhorn.
- **Status:** 🏙️ Crowded, low differentiation
- **Evidence:** mature ATS-adjacent market, the 2026 shift toward "agentic sourcing" is incremental, not a new open space.
- **Distance from other branches:** the traditional-labor half of this lever, distinct from the AI-agent-as-labor half above.

### Branch: autonomous hire/fire decisioning
- **What it is:** letting the automation make the actual employment decision, not just draft toward it.
- **Status:** 🪦 Dead end, legally
- **Evidence:** 2026 reporting confirms real employers fully automating this (one documented case: 847 hires, zero human input), now colliding with Colorado's AI Act (effective June 30, 2026, up to $20K/violation) and similar state rules requiring disclosure and human review. A live case of AI-driven layoffs is currently in litigation.
- **Distance from other branches:** looks like a natural extension of "AI-assisted hiring" but crosses the one line every other branch in this maze respects.

### Branch: personal agent fleet as labor
- **What it is:** using AI agents as your own directed team to do your work, not sold to anyone, just leverage you hold personally. Exactly what happened in this session, three parallel research agents dispatched on one message.
- **Status:** 🌱 Open / live path, but not as a product
- **Evidence:** this is leverage Adam already has and is already using, through Claude Code's own Agent and Workflow tooling. It's underpriced as "leverage" because it doesn't feel like a product, but it's the one branch on this entire maze with zero competitors, because it isn't for sale.
- **Distance from other branches:** structurally different from every other branch, it's not a market to enter, it's a capability to use more.

## The live path
Not a new SaaS product. The "AI employee" branch is already funded and crowded (Lindy, 11x, Manus-scale exits), and building into it adds a new front with no edge, directly against the workspace's own "concentration over spread" rule. The actual open branch is using the personal agent fleet harder and more deliberately, the same move already made on this research task, applied to more of the backlog instead of built into a product nobody asked Fulcrum Labor to be.

Verification notes (2026-08-14): sourced via live search this session across LangGraph, CrewAI, AutoGen, Lindy, 11x, Artisan, Manus, and 2026 AI-employment-law reporting (Colorado AI Act, documented autonomous-hiring and AI-layoff cases).
