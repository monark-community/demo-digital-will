# WillChain site plan

WillChain is an independent product incubated by Monark (`monark-branded: false`). It has its own name, identity and voice; Monark appears only as the "Built with Monark" footer credit. This document is the source of truth for the rebuild and is kept in step with what ships.

Sources read: the Lovable site and its `main` branch source, the authoritative project page (https://www.monark.io/en/project/digital-will), the Monark brand guidelines (sections 9, 11 and 12 only, since the site is independent), `repos-and-websites.md`, and, for product understanding only, the separate `monark-community/digital-will` implementation (its `USER_GUIDE.md` and contract interfaces), which confirms the mechanics described below.

---

## 1. Product brief

**Target user.** People who hold crypto in self-custody (a hardware wallet, a browser wallet) and have realised that if something happened to them tomorrow, their family would inherit a locked box. Typically 30 to 65, financially literate, not necessarily technical, with a partner, children or parents who would not know what a seed phrase is. Secondary users: the **guardians** they trust (a sibling, a close friend, a notary) and the **estate administrator** who settles the estate afterwards.

**Core job to be done.** "Make sure my crypto reaches the people I choose when I die, without giving anyone the power to take it while I'm alive, and without leaving my family a technical puzzle."

**Domain concepts** (from the project page and the reference implementation):

| Concept | Meaning in WillChain |
|-|-|
| Will (testament contract) | A smart contract owned by one wallet (the **owner**, called Primary Member in the project page). It holds the assets the owner funds it with. |
| Guardians | The trusted people (Secondary Members) who must accept their role, and who later confirm the owner's passing. Each has a **weight** (vote power). |
| Protection window | A delay with a **minimum** and **maximum**, chosen by the owner. It starts at the first confirmation. Each confirmation shortens it in proportion to the confirming guardian's weight: `wait = max − (max − min) × confirmedWeight / totalWeight`. When every guardian has confirmed, the wait is exactly the minimum. Confirmations speed execution up; they can never stop it. |
| Proof of life (veto) | During the window, the owner can sign a single transaction to cancel the declaration. A 3-day cooldown follows during which no one can declare again. |
| Execution | Once the window has elapsed, any guardian can execute. The contract takes a **snapshot** of the assets (the estate record), **swaps** everything to a stablecoin (tUSDC in the demo), **locks** it in the testament contract and **releases** it to the beneficiaries' wallets, or, where chosen, to the owner's pre-linked estate bank account through a fiat off-ramp with compliance checks (a later phase in the project page; simulated here). |
| Beneficiaries | The people and causes that receive the estate, each with a share. |
| Estate record | The snapshot, swap results and releases, with transaction hashes, that an estate administrator can hand to a notary. |
| Lifecycle | Draft → Deployed (Inactive until all guardians accept, then Active) → Declared (window running) → Executable → Executed; or Vetoed (back to Active) or Canceled. |

**What the Lovable version got wrong or left out.**

- It sold "inactivity timers" and "document storage" but never showed the central mechanism from the project page: guardians confirming, a protection window that shortens with each confirmation, and the owner's proof-of-life veto. The thing that makes the product trustworthy was invisible.
- Nothing could be completed: the dashboard was static mock numbers, the "Create will" and "Assets" links led nowhere, and sign-in was an email/password form with a role dropdown, which contradicts wallet-based identity.
- There was no guardian experience at all, even though guardians are the ones who act.
- Unverifiable statistics ("$3.8B+ lost annually", "100% secure") and a generic slate-to-emerald gradient with frosted cards made it feel like every other crypto template.
- No execution story: what happens to volatile assets, what the family receives, and what the estate administrator gets were never answered.
- English only, no dark mode, no accessibility work, a "🚧" banner as the only disclaimer.

## 2. Value proposition

> **For people who keep their own crypto, WillChain is an on-chain will that passes your assets to the people you name once guardians you trust confirm your passing, with a protection window only you can veto, so nothing is lost and nothing moves early, without handing your keys to anyone.**

Supporting benefits (outcomes, not features):

1. **Your family inherits what you meant them to have, not a locked wallet.** The assets reach the named beneficiaries in a stable currency, in the shares you chose.
2. **No one can move your crypto while you're alive.** A hasty or false declaration only starts a window of days or weeks; one signature from you stops it.
3. **The people left behind get answers, not a puzzle.** An estate record lists what was held, what it became and where it went, ready for the notary.

## 3. Hero

- **Headline (EN):** Your keys shouldn't die with you. (6 words)
- **Headline (FR):** Vos clés ne devraient pas partir avec vous.
- **Subheadline (EN, 23 words):** Guardians you trust confirm your passing. A window gives you time to object. Only then does your crypto reach the people you named.
- **Subheadline (FR):** Des gardiens de confiance confirment votre décès. Une fenêtre vous laisse le temps de vous y opposer. Ensuite seulement, vos cryptos rejoignent vos proches.
- No eyebrow and no disclaimer under the hero (restraint rules: the Demo chip in the header and the footer notice cover it).
- **Primary CTA:** "Try the demo" / « Essayer la démo » → `/[locale]/app`
- **Secondary CTA:** "How the window works" / « Comprendre la fenêtre » → `/[locale]/how-it-works`
- **Hero visual:** product UI built in code, not a photo: a paper-like **will document** ("Will of 0x5A1e…c3D9") with its guardians listed and the **protection-window rule** beneath. On load, guardians confirm one by one; each stamp slides the execution marker left along the ruler, from "max 30 days" toward "min 7 days". It explains the product's core mechanism in five seconds and is the first signature moment. It is static (final state) with `prefers-reduced-motion`.

## 4. Page map

All routes live under `/en/…` and `/fr/…`; `/` redirects to the visitor's preferred language (fallback English).

| Route | Purpose | Sections, in order |
|-|-|-|
| `/` (home) | Make the case in one scroll and send people into the demo. | Hero with the animated will document, then five sections: 1. "A seed phrase in a drawer is not a plan": three failure modes. 2. "How a will moves": four-step band. 3. Who it's for: owner, guardians, estate administrator, with photos. 4. FAQ (5 questions; the only FAQ on the site). 5. Closing CTA. (A sixth "What the demo proves" section was cut in the restraint pass.) |
| `/how-it-works` | The trust argument. The protection window is the product; it needs space and an interactive explanation that the home page can't give. | 1. Intro. 2. The four roles. 3. Lifecycle diagram with the veto and cancel branches. 4. **Window calculator**: set min/max and toggle guardian confirmations, see the execution date move. 5. What happens at execution (snapshot, swap, lock, release). 6. The rules that protect you. 7. CTA. |
| `/app` | The demo. Connect gate, then the dashboard: your wills, wills you guard, notifications. | Connect gate → dashboard (alerts, your wills, wills you guard, activity). |
| `/app/new` | Will composer. | Name, guardians and weights, protection window, beneficiaries and shares, assets to fund, payout destination, review and deploy. |
| `/app/will/[id]` | One will, seen as owner or as guardian. | Status header, protection window panel, guardians, assets, beneficiaries, estate record (after execution), activity. |
| `/credits` | Photo credits (required by the asset rules), linked from the footer. | Photographers, licence note, other credits. |
| `/pricing` | **Internal strategy review only**: never linked, not in the sitemap, `noindex, nofollow`. | Model, tiers, reasoning. |
| 404 | Localised not-found with a way back. | Message, links home and to the demo. |

No `/use-cases` or `/developers` page: the audience is individuals and families, and the "who it's for" section covers the use cases in three cards.

**Header (the only top bar on marketing pages):** wordmark (→ home), "How it works", "Demo"; right side: a small brass "Demo" chip, EN/FR switch, theme toggle, "Try the demo" button. Mobile: wordmark, demo button, menu sheet with the links, Demo chip, EN/FR and theme.
**App strip (only under `/app`):** one compact strip with the "Demo · simulated data" badge, "Demo controls" and the wallet control.
**Footer:** wordmark and one-line pitch; links: How it works, Demo, Credits, Project page (monark.io), Source (GitHub); "Demo · simulated data"; "Built with Monark". The testnet / not-financial-advice line appears only in the wallet prompt of transactions that move value (deploy with funds, execute); the deploy prompt also carries the "not legal advice" note.

## 5. Feature highlights

| Feature | User benefit | Where on the site | Proven by flow |
|-|-|-|-|
| Weighted guardians | No single person decides; people you trust more count more. | Hero document (weights), how-it-works calculator, composer. | 2 (compose and deploy), 3 (guard) |
| The protection window | Time to object that shrinks as more guardians agree. | Hero visual, how-it-works calculator, will page. | 3 (confirm a passing) |
| Proof of life | One signature stops a false declaration. | Home steps and FAQ, dashboard alert, will page. | 4 (veto) |
| Stable, locked estate | Heirs receive a stable amount, not a volatile basket. | Home steps, how-it-works execution section, will page. | 5 (execute) |
| Estate record | The administrator gets a complete, verifiable record. | Home "who it's for", will page after execution. | 5 (execute) |

## 6. Key flows

Every transaction goes through the simulated wallet: **prompt** (sign or reject) → **pending** (hash shown, 1.2 to 2.4 s block time, or 3 to 6 s with "slow network") → **confirmed** or **failed** (rejected in the wallet, or reverted by the network when "Fail the next transaction" is on). A failed step can always be retried in place. Time-based rules use a demo clock the visitor can advance from the demo controls.

1. **Sign in with a wallet.** Gate → "Connect demo wallet" → wallet prompt asks to sign a sign-in message → confirmed: dashboard / rejected: inline "You declined the sign-in request" with a retry. Pending: button shows "Waiting for signature…".
2. **Write and deploy a will.** `/app/new` → pick a starting point or start blank → name → add guardians (from contacts, with weights) → set the protection window (min/max days, with the live rule preview) → beneficiaries with shares (must total 100%) → assets to fund from the wallet (can't exceed balance) → payout destination → Deploy → prompt → pending → confirmed: redirect to the new will, status **Inactive**; guardians then accept one by one over a few seconds (notifications), and the will turns **Active**. Failed: inline error with "Try again", the draft is kept. Validation errors are shown inline before any prompt.
3. **Guard someone's will.** Dashboard "Wills you guard": accept Robert Gagnon's invitation (tx) → validated. Open Hélène Côté's will, where two of three guardians have already confirmed → "Confirm passing" → prompt → pending → confirmed: your stamp lands and the execution marker slides left past today; the will becomes **Executable**. Decline an invitation is also available.
4. **Prove you're alive.** The dashboard opens on an alert: Nadia confirmed your passing yesterday. On your will, press and hold "I'm alive" (1.5 s, keyboard: hold Space/Enter) → prompt → pending → confirmed: the declaration is struck through, the window collapses, the will is **Active** again, and a 3-day cooldown starts. Demo controls can simulate another declaration, which is refused during the cooldown ("Declarations are paused until…") and allowed after advancing time.
5. **Execute and read the estate record.** On an executable will → "Execute will" → prompt → pending → the four steps play in sequence: snapshot (block and balances), swap to tUSDC (per-asset rows), lock, release to each beneficiary (or, for a bank payout, compliance check then transfer to the estate account). Confirmed: the **estate record** appears (printable). Failed: reverted before any step completes; nothing moved; "Try again".

## 7. Content

Tone: calm, plain, adult. We are talking about death and money, so no hype, no exclamation marks, no emoji, no fear marketing, no invented statistics. Short sentences, second person. French is written natively (Québec-friendly, standard French), keeping "wallet"/« portefeuille », "on-chain" and "WillChain" as is.

All strings live in `src/i18n/dictionaries/{en,fr}.ts`; below is the copy by section.

### Home

**Hero** — see section 3.

**Problem** — EN heading "A seed phrase in a drawer is not a plan." / FR « Une phrase secrète dans un tiroir, ce n'est pas un plan. »

| EN | FR |
|-|-|
| **Too private.** If only you know where the keys are, they leave with you. The coins stay on-chain, untouched, forever. | **Trop secret.** Si vous seul savez où sont les clés, elles partent avec vous. Les fonds restent bloqués sur la chaîne. |
| **Too exposed.** Give the phrase to someone "just in case" and they can empty the wallet tomorrow, with or without meaning to. | **Trop exposé.** Confiez la phrase à quelqu'un « au cas où », et il peut vider le portefeuille demain, volontairement ou non. |
| **Too slow.** On an exchange, heirs face months of paperwork, and a notary still can't sign a transaction. | **Trop lent.** Sur une plateforme, vos proches affrontent des mois de démarches. Et un notaire ne signe pas de transaction. |

**How a will moves** — EN "How a will moves" / FR « Le parcours d'un testament »; link "The full mechanism" / « Le mécanisme en détail ».

| # | EN | FR |
|-|-|-|
| 1 | **Write it.** Choose guardians, a protection window, beneficiaries and the assets the will holds. You keep full control. | **Rédigez-le.** Choisissez vos gardiens, une fenêtre de protection, vos bénéficiaires et les actifs que le testament détient. Vous gardez la main. |
| 2 | **Guardians accept.** Each one signs to take on the role. Until they all have, the will stays inactive. | **Les gardiens acceptent.** Chacun signe pour assumer son rôle. Tant que ce n'est pas fait, le testament reste inactif. |
| 3 | **The window opens.** A guardian confirms your passing and a countdown starts. Each confirmation shortens it; one signature from you stops it. | **La fenêtre s'ouvre.** Un gardien confirme votre décès : le compte à rebours démarre. Chaque confirmation le raccourcit ; votre signature l'arrête. |
| 4 | **The estate is settled.** Assets are recorded, converted to a stablecoin, locked, then released to the people you named. | **La succession est réglée.** Les actifs sont inventoriés, convertis en stablecoin, verrouillés, puis versés aux personnes que vous avez nommées. |

**Who it's for** — EN "Three people, one plan" / FR « Trois personnes, un seul plan ».

- Owners — EN "**For the one who holds the keys.** Decide who inherits, who confirms and how long they must wait. Change anything while you're alive." / FR « **Pour celui qui détient les clés.** Décidez qui hérite, qui confirme et combien de temps il faut attendre. Modifiez tout, de votre vivant. »
- Guardians — EN "**For the people you trust.** A clear role with no access to the funds: accept, and one day, confirm. Nothing more." / FR « **Pour vos proches de confiance.** Un rôle clair, sans accès aux fonds : accepter, puis un jour, confirmer. Rien de plus. »
- Administrators — EN "**For whoever settles the estate.** A dated record of every asset, conversion and payment, ready for the notary." / FR « **Pour qui règle la succession.** Un relevé daté de chaque actif, conversion et versement, prêt pour le notaire. »

**FAQ** — EN "Questions people ask" / FR « Les questions qu'on nous pose ».

1. EN "Can a guardian take my crypto?" — "No. Guardians only sign to accept their role and, later, to confirm. The funds can only go to the beneficiaries you named, and only after the window." / FR « Un gardien peut-il prendre mes cryptos ? » — « Non. Les gardiens signent seulement pour accepter leur rôle puis, plus tard, pour confirmer. Les fonds ne peuvent aller qu'aux bénéficiaires que vous avez nommés, et seulement après la fenêtre. »
2. EN "What if a guardian confirms by mistake, or on purpose?" — "The first confirmation only opens the window. You sign a proof of life, the declaration is cancelled and nobody can declare again for three days." / FR « Et si un gardien confirme par erreur, ou exprès ? » — « La première confirmation ne fait qu'ouvrir la fenêtre. Vous signez une preuve de vie, la déclaration est annulée et personne ne peut en refaire une pendant trois jours. »
3. EN "What if a guardian dies or disappears?" — "Confirmations speed things up but are never required. Without them, the will simply waits for the maximum window." / FR « Et si un gardien décède ou disparaît ? » — « Les confirmations accélèrent les choses mais ne sont jamais obligatoires. Sans elles, le testament attend simplement la durée maximale. »
4. EN "Does it replace a notarial or legal will?" — "No. It settles the crypto you put in it and produces a record for your notary. Keep a legal will for everything else." / FR « Est-ce que ça remplace un testament notarié ? » — « Non. Il règle les cryptos que vous y placez et produit un relevé pour votre notaire. Gardez un testament légal pour tout le reste. »
5. EN "Is this demo real?" — "No. It runs on simulated testnet data in your browser. No wallet, funds or personal data are used." / FR « Cette démo est-elle réelle ? » — « Non. Elle fonctionne avec des données de testnet simulées, dans votre navigateur. Aucun portefeuille, aucuns fonds ni aucune donnée personnelle ne sont utilisés. »

**Closing CTA** — EN "Write a will in three minutes. Then try to break it." / FR « Rédigez un testament en trois minutes. Puis essayez de le prendre en défaut. »; button "Try the demo" / « Essayer la démo ».

### How it works

- Title EN "How WillChain works" / FR « Comment fonctionne WillChain ». Lead EN "Four roles, one rule: confirmations can speed things up, but only you can stop them." / FR « Quatre rôles, une règle : les confirmations peuvent accélérer les choses, mais vous seul pouvez les arrêter. »
- Roles: Owner / Titulaire, Guardians / Gardiens, Beneficiaries / Bénéficiaires, Estate administrator / Liquidateur (with one-sentence descriptions in the dictionaries).
- Lifecycle heading EN "The life of a will" / FR « La vie d'un testament ».
- Calculator heading EN "Play with the window" / FR « Jouez avec la fenêtre »; body EN "Set your window, then confirm as each guardian. Watch the date move." / FR « Réglez votre fenêtre, puis confirmez à la place de chaque gardien. Regardez la date bouger. »; formula caption EN "Wait = maximum − (maximum − minimum) × confirmed weight ÷ total weight" / FR « Attente = maximum − (maximum − minimum) × poids confirmé ÷ poids total ».
- Execution heading EN "What happens at execution" / FR « Ce qui se passe à l'exécution » with four steps: Snapshot / Inventaire, Conversion / Conversion, Lock / Verrouillage, Release / Versement.
- Rules heading EN "The rules that protect you" / FR « Les règles qui vous protègent »: guardians can't block, only you can; a veto pauses declarations for 3 days; nothing moves before the minimum; after the window the will is final.

### App

Key UI strings (full list in the dictionaries): "Connect demo wallet" / « Connecter le portefeuille de démo », "Your wills" / « Vos testaments », "Wills you guard" / « Testaments dont vous êtes gardien », "Write a will" / « Rédiger un testament », "Deploy will" / « Déployer le testament », "Confirm passing" / « Confirmer le décès », "Hold to prove you're alive" / « Maintenez pour prouver que vous êtes en vie », "Execute will" / « Exécuter le testament ».

**Empty states:**
- No wills: EN "You haven't written a will yet. It takes about three minutes, and you can change everything later." / FR « Vous n'avez pas encore de testament. Cela prend environ trois minutes, et vous pourrez tout modifier ensuite. »
- Not a guardian: EN "Nobody has asked you to be a guardian yet. When they do, their will appears here." / FR « Personne ne vous a encore désigné comme gardien. Quand ce sera le cas, le testament apparaîtra ici. »
- No activity: EN "Nothing has happened yet. Every signature and confirmation will be listed here." / FR « Rien ne s'est encore passé. Chaque signature et confirmation apparaîtra ici. »
- Unknown will: EN "This will doesn't exist in this demo. It may have been reset." / FR « Ce testament n'existe pas dans cette démo. Elle a peut-être été réinitialisée. »

**Error states:**
- Rejected: EN "You declined the request in your wallet. Nothing was sent." / FR « Vous avez refusé la demande dans votre portefeuille. Rien n'a été envoyé. »
- Reverted: EN "The network rejected the transaction. Nothing changed; you can try again." / FR « Le réseau a rejeté la transaction. Rien n'a changé ; vous pouvez réessayer. »
- Storage unavailable: EN "Your browser is blocking storage, so the demo won't remember changes after you leave." / FR « Votre navigateur bloque le stockage : la démo ne conservera pas vos changements après votre départ. »
- Cooldown: EN "Declarations are paused until {date} after a proof of life." / FR « Les déclarations sont suspendues jusqu'au {date} après une preuve de vie. »
- Page error: EN "Something went wrong on this page." / FR « Un problème est survenu sur cette page. »
- 404: EN "This page isn't in the will." / FR « Cette page ne figure pas au testament. »

### Disclaimers

- Footer on every page, and the badge in the `/app` strip: "Demo · simulated data" / « Démo · données simulées ». A "Demo" / « Démo » chip sits in the header.
- Once per transaction that moves value, inside its wallet prompt (deploy with funds, execute): "Testnet demo · not financial advice · no real funds" / « Démo sur testnet · pas un conseil financier · aucuns fonds réels ». The deploy prompt adds: "Not legal advice. A WillChain will doesn't replace a legal will." / « Pas un conseil juridique. Un testament WillChain ne remplace pas un testament légal. »
- Footer credit: "Built with Monark" / « Propulsé par Monark ».

### Restraint pass (what shipped)

Applied after the owner's "too loaded" feedback: no hero eyebrow or hero disclaimer; home cut to five sections (the "What the demo proves" list is gone) and a 5-question FAQ (dropped "Can I change my will?"); no lead paragraphs above the dashboard or the composer; composer field help sits behind an info toggle next to each heading; the will page's window rule sits behind "How is this calculated?" with a link to `/how-it-works`; the status explanation under each will title, the execute hint, the sign-in note and the network badge strip were removed; disclaimers moved to the footer, header chip and wallet prompts only.

## 8. Aesthetics

### Concept: archival, unhurried, witnessed, final

A will is one of the few documents people expect to outlive them. The audience is making a sober decision about family and money, and what earns trust here is the feel of a notary's office rather than a trading app: good paper, a steady hand, ink, a seal, and time. WillChain looks like a well-kept archive that happens to run on-chain. It is warm and quiet rather than techy, uses a serif for its voice, shows time explicitly (rulers, dates, countdowns), and marks decisive moments with a seal.

### Palette

Paper and ink, a **ledger green** primary (the cloth of old account books and bankers' lamps) and two supporting inks used sparingly: **brass** for waiting states, **sealing wax** for seals and executed records. Destructive stays a distinct red.

| Role | Light | Dark |
|-|-|-|
| `background` | `#F5F1E8` paper | `#161512` night archive |
| `foreground` | `#1F1D1A` ink | `#ECE6D9` |
| `card` | `#FBF9F4` | `#1E1C18` |
| `primary` | `#2F4A3C` ledger green | `#A9C9B2` sage |
| `primary-foreground` | `#F7F3EA` | `#14211A` |
| `muted` | `#EAE4D7` | `#28251F` |
| `muted-foreground` | `#5C554A` | `#ABA291` |
| `accent` | `#E6DCC4` vellum | `#302B22` |
| `accent-foreground` | `#1F1D1A` | `#ECE6D9` |
| `border` | `#D3C9B5` | `#3A352C` |
| `ring` | `#2F4A3C` | `#A9C9B2` |
| `destructive` | `#A3302A` | `#E77C70` |
| `brass` (custom) | `#7F5A14` | `#D9B46A` |
| `wax` (custom) | `#7A2E2A` | `#D98A7F` |
| `chart-1` | `#2F4A3C` | `#A9C9B2` |
| `chart-2` | `#9A6F22` | `#D9B46A` |
| `chart-3` | `#7A2E2A` | `#D98A7F` |
| `chart-4` | `#4F6B7A` | `#93B2C2` |
| `chart-5` | `#857B68` | `#B8AE9A` |

WCAG AA checks (computed with the WCAG 2.1 formula):

| Pair | Light | Dark |
|-|-|-|
| foreground / background | 14.92 | 14.68 |
| foreground / card | 15.98 | 13.68 |
| primary-foreground / primary | 8.76 | 9.26 |
| muted-foreground / background | 6.53 | 7.22 |
| muted-foreground / muted | 5.81 | 6.04 |
| muted-foreground / card | 6.99 | 6.73 |
| accent-foreground / accent | 12.33 | 11.30 |
| primary (as text/links) / background | 8.60 | 10.16 |
| destructive-foreground / destructive | 6.62 | 6.72 |
| destructive (as text) / background | 6.18 | 6.53 |
| brass (as text) / background | 5.52 | 9.29 |
| wax (as text) / background | 8.27 | 6.86 |
| ring / background (non-text, needs 3:1) | 8.60 | 10.16 |
| chart-1…5 / card (graphics, needs 3:1) | 9.22 · 4.27 · 8.86 · 5.37 · 3.97 | 9.47 · 8.66 · 6.39 · 7.60 · 7.74 |

Borders (1.46 / 1.50) are decorative hairlines; every control boundary that carries meaning also has a label or a stronger 3:1 outline (inputs use `foreground` at 35% opacity).

### Type

- **Newsreader** (display serif, `next/font/google`, variable, opsz) for headings, the wordmark, large numbers and the will document. It reads like a printed legal or editorial page and has real optical sizes. Weights 400, 500, 600; italic 400 for asides.
- **Public Sans** (UI sans) for body and controls: neutral, civic, very legible at small sizes, and not a default web-app face. Weights 400, 500, 600, 700.
- Addresses and hashes use the system monospace stack (no third family).
- Scale (rem): 0.75 / 0.875 / 1 / 1.125 / 1.375 / 1.75 / 2.25 / 3 / 3.75 (hero on desktop). Headings tight (1.05 to 1.2 line height, −0.01em tracking), body 1.6.

### Logo

A **seal mark**: a circle with a scalloped, wax-seal edge, holding a serif **W** whose middle strokes cross like a chain link. Wordmark: "WillChain" in Newsreader 600 next to it. Built as inline SVG (`src/components/brand/logo.tsx`), using `currentColor` so it follows the theme; favicon `src/app/icon.svg` is the seal in ledger green on paper.

### Shape

- Radius **4px** (`--radius: 0.25rem`) on controls and cards: paper and index cards, not pills. Badges are square-cornered labels, except seals, which are round.
- Hairline borders; sections separated by a **double rule** (two 1px lines 3px apart), borrowed from legal documents.
- Depth: flat. Only the will document itself has a soft paper shadow. No glass, no gradients.
- Motion: slow and deliberate, 240 to 600 ms, `cubic-bezier(0.2, 0.7, 0.2, 1)`; stamps "press" in (scale 1.08 → 1, 180 ms). Everything respects `prefers-reduced-motion`.

### Imagery

Photography of **hands, paper and kitchen tables**: real, unposed domestic moments in warm natural light, muted colour, a little grain. People are shown doing ordinary things together (a grandparent and a grandchild, a desk with papers, hands holding letters), never "sad funeral" imagery and never crypto clichés. Photos appear only in the "who it's for" section; everything else is the product itself or line diagrams drawn in code (1.5px strokes in ink, ledger green and brass on paper).

### Signature moments

1. **The shrinking window.** A ruler from "first confirmation" to "maximum". Each guardian stamp slides the execution marker left by its weight, and when it crosses "today" the will turns executable. It's in the hero, the calculator and every declared will.
2. **Hold to prove you're alive.** A press-and-hold button (1.5 s) whose fill advances like ink; on release the declaration is struck through and the window folds away. Deliberate on purpose: the one action that stops a will should feel weighty and impossible to trigger by accident.
3. **The seal.** At execution the four steps tick through (snapshot, convert, lock, release) and the estate record is sealed with the wax mark, dated and hashed.

### What we deliberately avoid, and why

- Purple or blue "AI" gradients, frosted glass, neon, glowing coins, 3D blobs: they signal speculation, the opposite of what someone arranging their estate wants.
- The Lovable version's slate-to-emerald gradient and bright emerald: we use a dark, desaturated ledger green on paper instead.
- Default shadcn look (zinc, 8px+ radius, pill buttons, shadows on every card): replaced by paper tones, a 4px radius, hairlines and a serif voice.
- Monark orange and the Monark logo (except the footer credit).
- Funeral clichés (black borders, candles, lilies) and fear statistics.

## 9. Assets

| Asset | Purpose | Placement |
|-|-|-|
| `owner.jpg`: a grandmother and granddaughter at the breakfast table (Vitaly Gariev) | "For the one who holds the keys": family is why you plan | Home, who it's for, card 1 |
| `guardians.jpg`: two people's hands around mugs at a table (Priscilla Du Preez) | "For the people you trust" | Home, who it's for, card 2 |
| `administrator.jpg`: a fountain pen on a stack of papers (Andres Vera) | "For whoever settles the estate" | Home, who it's for, card 3 |

Unsplash, free licence only, downloaded to `public/images/`, served with `next/image`, listed in `docs/assets.md` and credited on `/credits`.

Built in code: seal logo and favicon, animated will document (hero), window ruler, lifecycle diagram, execution step diagram, estate record, Open Graph image (`next/og`, per locale). Icons: Lucide.

## 10. Pricing strategy

WillChain is an independent consumer product, so it needs a real model. Estate services typically charge a percentage of the estate; charging a percentage of what someone leaves their family feels wrong for this audience and would make WillChain expensive precisely for the people with the most at stake. The model is **flat, predictable and never a cut of the estate**:

| Tier | Price | For | Includes |
|-|-|-|-|
| **Keep** | Free | Getting started | 1 will, up to 3 guardians, on-chain beneficiaries, estate record. The owner pays network fees. |
| **Legacy** | CA$59 / year (or CA$6 / month) | Most owners | Unlimited wills and guardians, email and SMS reminders to guardians, yearly "still here?" check-ins, printable notarial summary, estate bank account payout (fiat off-ramp). |
| **Practice** | CA$249 / month | Notaries and estate lawyers | Act as guardian for many clients, client dashboard, co-branded estate records, priority support. |

Off-ramp conversion fees from partners are passed through at cost and shown before execution. Reasoning: the free tier keeps the core promise (nothing is lost) available to everyone; the yearly plan pays for the off-chain work (notifications, reminders, compliance) that actually costs money; notaries are both a paying channel and a trust signal.

`/pricing` exists for internal review only: never linked, excluded from `sitemap.xml`, `robots: { index: false, follow: false }`. No prices appear anywhere else.

## 11. Out of scope

- Real wallets, chains, contracts, swaps, KYC/AML or bank transfers: everything is simulated in the browser.
- Editing a deployed will (changing guardians, weights, window or funds after deployment), funding top-ups and withdrawals, and cancelling a will. They're described, not built.
- Inactivity-based triggers (the Lovable idea); the project page centres on guardian confirmations, so we do too.
- Document storage on IPFS, social recovery, account creation and email notifications.
- Multiple owner wallets, contact management, legal validity in any jurisdiction.

## 12. Decisions made while working unattended

- **Product source of truth.** The project page's "Primary Member / Secondary Members / protection delay / proof of life / snapshot / stablecoin lock / fiat off-ramp" model drives everything; the separate `monark-community/digital-will` implementation confirmed the exact window formula, the 3-day veto cooldown and the lifecycle. Beneficiaries with shares are kept because the project page says the contract defines "beneficiaries and asset allocations".
- **Payout.** Execution releases either to beneficiaries' wallets in tUSDC (seeded wills) or to a pre-linked estate bank account with a simulated compliance check (selectable in the composer), matching the project page's later off-ramp phases.
- **One persona.** The visitor is Camille Tremblay: owner of one will (with a live declaration to veto) and guardian on two others (one invitation, one nearly executable), so every flow is reachable in a single session without role switching.
- **Demo clock.** Windows are measured in days, so the demo controls can advance a clock (+1 / +7 days) to show cooldowns ending and windows elapsing.
- **Tokens.** The Monark testnet token set (tETH, tWBTC, tUSDC, tDAI, tLINK) and its reference prices are reused for consistency with the other demos; amounts in USD are shown as "US$".
- **Toasts** sit bottom-right on desktop and along the bottom on phones: every action's status is shown inline next to its button at the top of the page, so toasts only announce background events (guardians accepting, windows elapsing) and never cover the element they report on.
- **No `/use-cases` or `/developers` page**, and no brand page; `/credits` exists because the photo licence rules ask for credits.
- **Unsplash search** was done through the site's public search pages; downloads used the free `/download` endpoint to guarantee no Unsplash+ image.
