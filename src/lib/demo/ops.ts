"use client"

import { currentBlock } from "./chain"
import { randomAddress, randomHash, randomId, slugId } from "./ids"
import { YOU } from "./seed"
import { demoNow, getDemo, update, updateWill } from "./store"
import { SLIPPAGE, TOKENS } from "./tokens"
import type { ActivityEntry, Beneficiary, EstateRecord, Guardian, Holding, Payout, ReleaseLine, SwapLine, Will } from "./types"
import { DAY, inCooldown, VETO_COOLDOWN_DAYS } from "./window"

/**
 * State transitions of the simulated testament contract. Each op runs only
 * after its transaction is confirmed (see useTx), so a failed or rejected
 * transaction never changes anything.
 */

function entry(kind: ActivityEntry["kind"], actor: string, extra: Partial<ActivityEntry> = {}): ActivityEntry {
  return { id: randomId("a"), at: demoNow(), kind, actor, ...extra }
}

export function signIn() {
  update((s) => ({ ...s, wallet: { ...s.wallet, status: "connected" } }))
}

export function signOut() {
  update((s) => ({ ...s, wallet: { ...s.wallet, status: "disconnected" } }))
}

export function advanceClock(ms: number) {
  update((s) => ({ ...s, clockOffset: s.clockOffset + ms }))
}

export interface WillDraft {
  name: string
  guardians: { id: string; weight: number }[]
  window: { minDays: number; maxDays: number }
  beneficiaries: { person: Omit<Beneficiary, "share">; share: number }[]
  holdings: Holding[]
  payout: Payout
}

/** Create the will on deploy. Guardians are invited and accept on their own over a few seconds. */
export function deployWill(draft: WillDraft, hash: string): string {
  const demo = getDemo()
  if (!demo) return ""
  const now = demoNow()
  const id = slugId(draft.name)
  const guardians: Guardian[] = draft.guardians.flatMap((g) => {
    const person = demo.contacts.find((c) => c.id === g.id)
    return person ? [{ ...person, weight: g.weight, state: "pending" as const }] : []
  })
  const will: Will = {
    id,
    name: draft.name.trim(),
    owner: YOU,
    role: "owner",
    contract: randomAddress(),
    deployedAt: now,
    guardians,
    beneficiaries: draft.beneficiaries.map((b) => ({ ...b.person, share: b.share })),
    holdings: draft.holdings.filter((h) => h.amount > 0),
    window: draft.window,
    status: "inactive",
    declaration: null,
    cooldownUntil: null,
    payout: draft.payout,
    bankLabel: draft.payout === "bank" ? "Banque Nationale ···· 0937" : undefined,
    record: null,
    autoAccept: true,
    activity: [
      entry("deployed", YOU.name, { hash }),
      ...guardians.map((g) => entry("invited", YOU.name, { target: g.name })),
    ],
  }
  update((s) => ({
    ...s,
    balances: s.balances.map((b) => {
      const used = will.holdings.find((h) => h.symbol === b.symbol)?.amount ?? 0
      return { ...b, amount: Math.max(0, +(b.amount - used).toFixed(6)) }
    }),
    wills: [will, ...s.wills],
  }))
  return id
}

/** A simulated guardian (someone else) accepts. Returns true when the will became active. */
export function guardianAccepts(willId: string, guardianId: string): boolean {
  let activated = false
  updateWill(willId, (w) => {
    const guardians = w.guardians.map((g) => (g.id === guardianId && g.state === "pending" ? { ...g, state: "accepted" as const } : g))
    const g = w.guardians.find((x) => x.id === guardianId)
    const allIn = guardians.every((x) => x.state !== "pending")
    activated = allIn && w.status === "inactive"
    return {
      ...w,
      guardians,
      status: activated ? "active" : w.status,
      autoAccept: allIn ? false : w.autoAccept,
      activity: g ? [...w.activity, entry("accepted", g.name)] : w.activity,
    }
  })
  return activated
}

export function acceptRole(willId: string, hash: string) {
  updateWill(willId, (w) => {
    const guardians = w.guardians.map((g) => (g.isYou ? { ...g, state: "accepted" as const } : g))
    const allIn = guardians.every((g) => g.state !== "pending")
    return {
      ...w,
      guardians,
      status: allIn && w.status === "inactive" ? "active" : w.status,
      activity: [...w.activity, entry("accepted", YOU.name, { hash })],
    }
  })
}

export function declineRole(willId: string, hash: string) {
  updateWill(willId, (w) => ({
    ...w,
    guardians: w.guardians.map((g) => (g.isYou ? { ...g, state: "declined" as const } : g)),
    activity: [...w.activity, entry("declined", YOU.name, { hash })],
  }))
}

function declare(w: Will, guardianId: string, actor: string, hash?: string): Will {
  const now = demoNow()
  return {
    ...w,
    guardians: w.guardians.map((g) => (g.id === guardianId ? { ...g, state: "confirmed" as const, confirmedAt: now } : g)),
    status: "declared",
    declaration: w.declaration ?? { firstAt: now },
    activity: [...w.activity, entry("confirmed", actor, hash ? { hash } : {})],
  }
}

/** The visitor, as a guardian, confirms the owner's passing. */
export function confirmPassing(willId: string, hash: string) {
  updateWill(willId, (w) => declare(w, YOU.id, YOU.name, hash))
}

export type SimulatedDeclaration =
  | { ok: true; willName: string; guardianName: string; willId: string }
  | { ok: false; reason: "cooldown"; until: number }
  | { ok: false; reason: "none" }

/** Demo control: a guardian of one of your wills confirms your passing. */
export function simulateDeclaration(): SimulatedDeclaration {
  const demo = getDemo()
  if (!demo) return { ok: false, reason: "none" }
  const now = demoNow()
  const mine = demo.wills.filter((w) => w.role === "owner" && (w.status === "active" || w.status === "declared"))
  const target = mine.find((w) => w.guardians.some((g) => g.state === "accepted") && !inCooldown(w, now))
  if (!target) {
    const cooling = mine.find((w) => inCooldown(w, now))
    if (cooling?.cooldownUntil) return { ok: false, reason: "cooldown", until: cooling.cooldownUntil }
    return { ok: false, reason: "none" }
  }
  const guardian = target.guardians.find((g) => g.state === "accepted")
  if (!guardian) return { ok: false, reason: "none" }
  updateWill(target.id, (w) => declare(w, guardian.id, guardian.name, randomHash()))
  return { ok: true, willName: target.name, guardianName: guardian.name, willId: target.id }
}

/** Owner's proof of life: cancels the declaration and pauses new ones for 3 days. */
export function proveAlive(willId: string, hash: string): number {
  const until = demoNow() + VETO_COOLDOWN_DAYS * DAY
  updateWill(willId, (w) => ({
    ...w,
    guardians: w.guardians.map((g) => (g.state === "confirmed" ? { ...g, state: "accepted" as const, confirmedAt: undefined } : g)),
    status: "active",
    declaration: null,
    cooldownUntil: until,
    activity: [...w.activity, entry("vetoed", w.owner.name, { hash })],
  }))
  return until
}

/** Build the estate record: snapshot, conversion to tUSDC, lock, release. */
export function buildRecord(w: Will, executedBy: string): EstateRecord {
  const now = demoNow()
  const swaps: SwapLine[] = w.holdings.map((h) => {
    const price = TOKENS[h.symbol].price
    const received = +(h.amount * price * (1 - SLIPPAGE[h.symbol])).toFixed(2)
    return { symbol: h.symbol, amount: h.amount, price, received, hash: h.symbol === "tUSDC" ? "" : randomHash() }
  })
  const total = +swaps.reduce((s, x) => s + x.received, 0).toFixed(2)
  let paid = 0
  const releases: ReleaseLine[] = w.beneficiaries.map((b, i) => {
    const last = i === w.beneficiaries.length - 1
    const amount = last ? +(total - paid).toFixed(2) : Math.floor(total * b.share) / 100
    paid += amount
    return { name: b.name, address: b.address, share: b.share, amount, hash: w.payout === "wallets" ? randomHash() : "" }
  })
  return {
    executedAt: now,
    block: currentBlock(now),
    executedBy,
    swaps,
    total,
    lockHash: randomHash(),
    payout: w.payout,
    releases,
    bankReference: w.payout === "bank" ? `WC-${String(Math.floor(100000 + Math.random() * 899999))}-CA` : undefined,
  }
}

export function executeWill(willId: string, hash: string) {
  updateWill(willId, (w) => ({
    ...w,
    status: "executed",
    record: buildRecord(w, YOU.name),
    activity: [...w.activity, entry("executed", YOU.name, { hash })],
  }))
}
