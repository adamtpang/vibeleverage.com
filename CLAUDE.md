# CLAUDE.md - vibeleverage.com

Context for Claude Code, Codex, and humans working in this folder.

## What this is

This handoff was generated on 2026-07-07 so every top-level Codex project under
`C:\Users\adamp\OneDrive\Aether` has both `CLAUDE.md` and `AGENTS.md`.

No richer Claude handoff was found here during the workspace sync. Treat this file
as a starting point, then inspect the actual code and docs before making changes.

## Detected project facts

- Workspace folder: `vibeleverage.com`
- Git repository: yes
- `package.json`: yes
- Detected stack: Next.js, React, Tailwind, TypeScript, package "vibeleverage.com"
- Existing context-like files: README.md, readme.md
- Notable top-level files: .env.example, .eslintrc.json, .gitignore, components.json, next-env.d.ts, next.config.mjs, package-lock.json, package.json, postcss.config.mjs, README.md, tailwind.config.ts, tsconfig.json

## How to keep this useful

- If you learn the product purpose, stack, run commands, deployment target, or open
  tasks, update this file.
- Keep `AGENTS.md` synchronized with this file so Codex sessions have the same
  context inline.
- Prefer concrete project facts over generic instructions.

## Current product state

- The product brand and canonical domain are Vibe Leverage and
  `https://vibeleverage.com`.
- The homepage contains an evidence-based 16-check leverage audit covering
  Vibe Code, Vibe Media, Vibe Capital, and Vibe Labor.
- The rubric is versioned in `lib/leverage-diagnostic.ts`. Unknown checks reduce
  confidence, all four scores stay independent, and a verified 100 requires
  complete frontier evidence.
- Strategic sequencing is permissionless first: raise Code and Media to
  repeatable traction, then Capital, then Labor.
- A completed audit generates one project-specific cure prompt with an exact
  acceptance receipt. Comparable audit receipts are kept in localStorage.
- The email capture posts consenting signups through FormSubmit. A proper email
  service provider is still needed before operating a recurring or larger list.
- The current personal baseline is stored only in the gitignored `.vibeleverage`
  directory. Do not publish private diagnosis artifacts.
- Validation commands are `npm test`, `npx tsc --noEmit`, and `npm run build`.
- Local UI verification uses Helium Harness against `http://localhost:3010`.
- The former `archimedes.life` host migrates non-secret browser evidence through
  `/migrate` and then redirects to the canonical domain. Never remove the legacy
  storage keys or former-host migration without an explicit data-retirement plan.
- The execution surfaces and local job code live under `app/vibe`, `app/api/vibe`,
  `components/vibe`, and `lib/vibe`.

## Imported existing context

Source: `README.md`

```markdown
# vibeleverage.com

The leverage diagnosis. Find and cure the four levers you're under-using:
**code, media, capital, labor**. Rate yourself on each, find your binding
constraint, and get the one move to attack it.

> "Give me a lever long enough and a place to stand, and I will move the world."
> Archimedes

A single static page. Dark, high-contrast, one accent. No database, no auth, no
API routes.

## Stack

- [Next.js 14](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) primitives (`Button`, `Input`)
- [Geist](https://vercel.com/font) Sans + Mono (self-hosted)

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Email capture (TODO before launch)

The hero form in [`components/email-capture.tsx`](components/email-capture.tsx)
validates and acknowledges in the browser but does **not** persist anywhere yet.
Wire it up by setting `FORMSPREE_ENDPOINT` to a real endpoint (e.g. a
[Formspree](https://formspree.io) form ID). Search the file for `TODO(launch)`.

## Vibe Coach

The `/#chat` section streams from Claude Sonnet 4.6 via a serverless route at
[`app/api/chat/route.ts`](app/api/chat/route.ts). It needs an Anthropic API key,
**server-side only** (never shipped to the browser):

- Local: copy `.env.example` to `.env.local` and set `ANTHROPIC_API_KEY`.
- Production (Vercel): add `ANTHROPIC_API_KEY` in Project Settings → Environment
  Variables (or `vercel env add ANTHROPIC_API_KEY production`), then redeploy.

Until the server key is set, the chat offers a bring-your-own-key fallback:
visitors can paste their own Anthropic key, which stays in their browser
(localStorage) and is sent only with their own messages. The server key takes
precedence as soon as it exists. The route applies a light in-memory rate
limit; swap in Vercel KV or Upstash for real enforcement.

## Deploy

Hosted on [Vercel](https://vercel.com). Pushes to the default branch deploy
automatically; `vercel --prod` ships from the CLI. The chat route is the only
non-static part; everything else is prerendered.
```
