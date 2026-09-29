# WillChain

**An on-chain will for the crypto you hold yourself.** Guardians you trust confirm your passing, a protection window gives you time to object with a single signature, and only then is your estate snapshotted, converted to a stablecoin, locked and released to the people you named, with an estate record for the notary.

This repository is the product's demo site: a marketing site plus a fully interactive, **simulated** app. No real chain, wallet, funds or backend are involved.

- Project page: https://www.monark.io/en/project/digital-will
- Target host: https://willchain.monark.io
- WillChain is an independent product incubated by [Monark](https://www.monark.io).

## Run it locally

Requires Node 22 and pnpm 10.

```sh
pnpm install
pnpm dev          # http://localhost:3145
```

Other scripts:

```sh
pnpm lint         # ESLint (next/core-web-vitals + TypeScript)
pnpm typecheck    # next typegen && tsc --noEmit
pnpm build        # production build (every page prerenders)
pnpm start        # serve the build on port 3145
pnpm screenshots  # Playwright captures into docs/screenshots (needs pnpm start running)
```

No environment variables are needed. `NEXT_PUBLIC_SITE_URL` optionally overrides the canonical URL (defaults to `https://willchain.monark.io`).

## What you can do in the demo

1. **Sign in with a wallet**: sign (or reject) a sign-in message.
2. **Write and deploy a will**: guardians with weights, a min/max protection window, beneficiaries and shares, assets and payout; watch the guardians accept.
3. **Guard someone's will**: accept an invitation, then confirm a passing and watch the window shrink until the will is executable.
4. **Prove you're alive**: press and hold to veto a declaration; new declarations are paused for three days.
5. **Execute and read the estate record**: snapshot, conversion to tUSDC, lock, release, then a sealed, printable record.

"Demo controls" in the app let you advance the demo clock, fail the next transaction, slow the network, simulate a guardian declaration and reset everything.

## How the simulation works

Everything lives in `src/lib/demo/`, a small typed layer the UI talks to through hooks and operations, so it can be swapped for wagmi/viem and real contracts without touching components:

| File | Role |
|-|-|
| `types.ts` | The model: wills, weighted guardians, beneficiaries, holdings, the estate record. |
| `window.ts` | The protection-window rule: `wait = max − (max − min) × confirmedWeight / totalWeight`, executable status, 3-day veto cooldown. |
| `store.ts` | External store persisted to `localStorage` (every access in try/catch), plus the wallet-prompt promise. |
| `chain.ts` | `useTx()`: wallet prompt → pending with a hash for a realistic block time → confirmed or reverted. |
| `ops.ts` | State transitions applied only after confirmation: deploy, accept, decline, confirm, prove alive, execute. |
| `seed.ts` | Believable example data (three wills, contacts, balances) in the visitor's language. |
| `tokens.ts` | Testnet tokens (tETH, tWBTC, tUSDC, tDAI, tLINK) and reference prices. |

Other guardians are simulated too: after you deploy, invited guardians accept a few seconds apart.

## Project structure

```
src/
  app/[locale]/        routes: home, how-it-works, app (dashboard, new, will/[id]), credits, pricing, 404
  app/                 sitemap, robots, favicon
  components/brand     seal mark and wordmark
  components/site      header, footer, locale switch, theme toggle, mobile menu
  components/home      animated hero will document
  components/how       window calculator
  components/will      window ruler, stamps, wax seal
  components/demo      the app: frame, dashboard, composer, will view, wallet prompt, demo controls
  components/ui        Monark UI registry + shadcn components, re-themed
  i18n/                typed EN/FR dictionaries and locale helpers
  lib/demo/            the simulated chain and data layer
  proxy.ts             redirects / to the visitor's language
docs/                  site plan, asset credits, screenshots
```

Design decisions, copy in both languages, the palette with contrast ratios, and the pricing reasoning are in [`docs/site-plan.md`](docs/site-plan.md). Photo credits are in [`docs/assets.md`](docs/assets.md).

## Deploy to Vercel

Import the repository in Vercel and deploy with the framework defaults (Next.js, pnpm, Node 22 from `engines`). No `vercel.json` and no environment variables are required.

## Disclaimer

Testnet demo with simulated data. Not financial or legal advice; a WillChain will does not replace a legal will.
