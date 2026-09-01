# vibeleverage.com

Diagnose and maxx **Vibe Code, Vibe Media, Vibe Capital, and Vibe Labor**.
Audit factual evidence, find the binding constraint, run one cure, and rescan
only after users, audience, revenue, or delegated output moves.

> "Give me a lever long enough and a place to stand, and I will move the world."
> Archimedes

The public product is a dark, high-contrast Next.js experience with one accent.
It has no database or auth. The diagnostic stays in localStorage, the Vibe Coach
streams through one Anthropic route, and the `/vibe/*` agent tools are local-first.

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

## Diagnostic engine

The versioned rubric in [`lib/leverage-diagnostic.ts`](lib/leverage-diagnostic.ts)
scores 16 evidence checks across the four levers. Unknown evidence reduces
confidence instead of earning points. Completed audits generate a prompt that
attacks one binding check and records comparable before and after receipts in
the browser.

Run `npm test` to verify the rubric, strategic sequencing, prompt guardrails,
and frontier scoring behavior.

## Email capture

The forms in [`components/email-capture.tsx`](components/email-capture.tsx)
post consenting signups through FormSubmit. The first live submission may
require a one-time activation from the destination inbox. Move to a proper
email service provider before operating a recurring or larger list.

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

## Vibe agents

`/vibe/code`, `/vibe/media`, `/vibe/capital`, and `/vibe/labor` are local-first
execution surfaces backed by `lib/vibe`. Their APIs shell out to local tools and
are not expected to execute successfully in Vercel's serverless filesystem.

## Former domain

`archimedes.life` is the former name. Requests pass through `/migrate` once so
browser-local diagnostic evidence can move to `vibeleverage.com`, then continue
to the same path. Saved Anthropic keys are intentionally never transferred.

## Deploy

Hosted on [Vercel](https://vercel.com). Pushes to the default branch deploy
automatically; `vercel --prod` ships from the CLI. The chat route is the only
public serverless feature; the local Vibe agents also expose API routes.
