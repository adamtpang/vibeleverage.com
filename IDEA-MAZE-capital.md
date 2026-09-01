# Idea maze: capital leverage

One sentence: mapping the real branches for Vibe Capital before any build, given Adam is in a reserves-protecting position, not a reserves-building one.

## Entry point
Does the agent ever hold custody of money or execute a transaction on its own, or does it only draft and recommend for a human to press the actual send/execute button.

## Branches

### Branch: ledger / bookkeeping automation, draft-then-approve
- **What it is:** auto-code GL entries, chase receipts, flag anomalies, nothing posts without human sign-off. Ramp Accounting Agent, Puzzle, Digits, Basis.
- **Status:** 🏙️ Crowded but viable
- **Evidence:** Digits alone processed $850B in activity across firms in 2026, still framed as "alongside accountants." Universal draft-then-approve gate at the ledger-posting step across every named player.
- **Distance from other branches:** the safest and most crowded branch, closest in spirit to Vibe Capital's intended design.

### Branch: rules-based robo-advisory inside a pre-consented strategy
- **What it is:** tax-loss harvesting and rebalancing that runs automatically, but only inside a strategy the client already opted into. Wealthfront ($94.1B AUM), Betterment.
- **Status:** 🏙️ Crowded but viable
- **Evidence:** real automation, real scale, but the "autonomy" is scoped to rules agreed in advance, not new agent-initiated decisions.
- **Distance from other branches:** a middle pattern between draft-only and fully autonomous, worth naming as its own category rather than folding into either extreme.

### Branch: bounded-permission agent wallets
- **What it is:** agent holds a wallet with pre-set spend/permission limits, funds move without a per-transaction click but inside a bound the human set in advance. MetaMask Agent Wallet, Coinbase AgentKit, Privy's delegated-signer model.
- **Status:** 🌱 Open, emerging
- **Evidence:** MetaMask's version released summer 2026, Coinbase's AgentKit February 2026, genuinely new infrastructure, not yet a saturated space. Privy explicitly offers this as the safer alternative to agent-controlled wallets.
- **Distance from other branches:** the branch closest to Vibe Capital's likely eventual shape if it ever needs to touch crypto-native rails, still gated, just gated in advance instead of per-transaction.

### Branch: fully autonomous custody trading
- **What it is:** the agent holds funds and executes trades continuously with no per-trade approval. Polystrat, built on Olas, live on Polymarket.
- **Status:** 🪦 Dead end, for Adam specifically
- **Evidence:** 4,200+ autonomous trades in its first month, real capital, zero per-trade gate. Not dead as a product, it's live and trading, but it's the exact failure mode this workspace's own "protect the cash that exists" standing rule rules out for a founder in a reserves-protecting position.
- **Distance from other branches:** the opposite end of the spectrum from ledger automation, the one branch to name explicitly as a pattern to avoid, not approach asymptotically.

### Branch: draft-only pricing / invoicing research assistant
- **What it is:** an agent that researches market comps, drafts an invoice or a price recommendation, never touches money movement at all. No product found that's exactly this shape as a standalone tool, it's currently bundled inside larger AP/invoicing suites rather than sold on its own.
- **Status:** 🌱 Open, unclaimed as a standalone tool
- **Evidence:** the AP-automation research this session found exception-resolution logic bundled into full suites (Ramp, Zamp, Tipalti-class tools), but nothing narrowly scoped to just draft-and-research with zero execution surface.
- **Distance from other branches:** a stricter subset of "ledger automation," draft-only with no ledger-posting step at all, not even an approved one.

## The live path
Draft-only, never custody, matching both the market consensus (every serious accounting-agent player gates at posting) and Adam's own standing "protect cash" rule. Per the workspace's manual-before-automation rule, the honest next step is one real manual pass first, draft one actual invoice or one actual price recommendation by hand, before building any agent around that motion. Bounded-permission wallets are worth watching as the space matures, not worth building toward yet.

Verification notes (2026-08-14): sourced via live search this session across Ramp, Puzzle, Digits, Wealthfront, Betterment, MetaMask, Coinbase, Privy, and Polystrat/Olas.
