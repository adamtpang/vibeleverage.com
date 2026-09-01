# Brand: vibeleverage.com

_Status: documented (extracted from the existing, already-shipped system, not freshly designed)_

This project already has a deliberate visual identity, built into `app/globals.css` and `tailwind.config.ts` and used consistently on the homepage (`app/page.tsx`). This file exists so `frontend-design-guidelines` and future design work treat it as source of truth instead of re-deriving or drifting from it.

## Palette: "warm-ink + gold", dark only

One accent, everything else desaturated warm neutrals. No light mode (`color-scheme: dark` is hardcoded).

| Token | HSL | Role |
|---|---|---|
| `--background` | `30 11% 4%` | page background, near-black warm ink |
| `--foreground` | `40 24% 92%` | primary text, warm off-white |
| `--card` | `30 9% 6%` | card surfaces, barely lighter than background |
| `--muted-foreground` | `36 8% 56%` | secondary text |
| `--border` | `36 9% 15%` | hairlines |
| `--lever` | `38 94% 58%` | **the one accent**, warm gold/amber. Every highlight, active state, and hover reveal uses this and nothing else. |
| `--lever-dim` | `36 50% 34%` | muted variant of the accent (unfilled slider track, etc.) |
| `--destructive` | `4 70% 56%` | errors only |

Rule: **one accent color**. Never introduce a second hue for emphasis: no blue links, no green success states. Success/positive still reads through `--lever`; only true errors get `--destructive`.

## Typography

- Sans: Geist (`--font-geist-sans`), used for all body/heading text.
- Mono: Geist Mono (`--font-geist-mono`), used for labels, numbers, and the `.label` utility (`font-mono uppercase tracking-[0.22em]`).
- Display type is large and heavy: the hero stacks `vibe` over `leverage` at a stable clamp size with `font-bold`. Section headings stay compact inside their sections.
- Body copy uses `text-balance`/`text-pretty` utilities and `leading-relaxed`.

## Signature motifs (reuse these, don't reinvent)

- **`VibeGlyph`** (`components/lever-mark.tsx`): a small solid triangle in `currentColor`, used as a marker next to eyebrow labels and section glyphs site-wide.
- **`.label`** (`globals.css`): the small mono uppercase tracked sub-label class (e.g. "Under-leveraged when"). Use this instead of ad hoc `text-xs uppercase tracking-[0.2em]` one-offs.
- **`.reveal`**: the standard entrance animation (`opacity 0 → 1`, `translateY(14px) → 0`, `0.7s`), staggered with inline `animationDelay` in ~80ms steps down a page. Respects `prefers-reduced-motion` automatically (handled globally in `globals.css`, no per-component work needed).
- **Card grid pattern**: `grid gap-px overflow-hidden rounded-xl border border-border bg-border` wrapping individual `bg-background` cells, each with a hover-reveal top accent line: `absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-lever transition-transform duration-500 ease-out group-hover:scale-x-100` on a `group` parent.
- **`.bg-grid`**: a faint engineering-grid background texture, used at very low opacity (`opacity-[0.04]` on the homepage) behind full-bleed sections for atmosphere, radial-masked so it fades at the edges.
- **Numbered `SectionLabel`**: roman-numeral-or-index + `--lever`-colored index + a short horizontal rule + mono tracked label, marking each major homepage section (`I` Diagnose, `II` Cure, etc.).

## Voice

Direct, declarative, no hedging, no em dashes anywhere in the codebase (a standing rule, not a style suggestion). Headlines state a claim ("You don't have an effort problem. You have a leverage problem."), body copy explains the mechanism in one or two plain sentences.

## Where this applies

The homepage and `/vibe/*` work surfaces share this system. The work surfaces stay denser and more utilitarian because they are repeated-action tools, not marketing sections.
