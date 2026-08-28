# archimedes.life

The leverage diagnosis. Find and cure the four levers you're under-using:
**code, media, capital, labor**. Audit factual evidence, find the binding
constraint, and get one measurable improvement cycle.

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

## Chat with Archimedes (AI agent)

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
