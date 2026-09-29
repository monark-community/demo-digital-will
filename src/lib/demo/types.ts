/**
 * Typed model of the WillChain demo. Mirrors the testament contract:
 * guardians (secondary members) with vote weights, a min/max protection
 * window, a declaration that the owner can veto, and an execution that
 * snapshots, converts, locks and releases the estate.
 */

export type TokenSymbol = "tETH" | "tWBTC" | "tUSDC" | "tDAI" | "tLINK"

export interface Holding {
  symbol: TokenSymbol
  /** Whole-token amount (display precision handled by the UI). */
  amount: number
}

export type Relation =
  | "brother"
  | "sister"
  | "friend"
  | "notary"
  | "partner"
  | "colleague"
  | "daughter"
  | "son"
  | "niece"
  | "nephew"
  | "spouse"
  | "charity"
  | "you"

export interface Person {
  id: string
  name: string
  address: string
  relation: Relation
}

export type GuardianState = "pending" | "accepted" | "declined" | "confirmed"

export interface Guardian extends Person {
  weight: number
  state: GuardianState
  confirmedAt?: number
  /** True when this guardian is the demo visitor. */
  isYou?: boolean
}

export interface Beneficiary extends Person {
  /** Whole percent, all shares total 100. */
  share: number
}

export type StoredWillStatus = "inactive" | "active" | "declared" | "executed"
/** Status shown in the UI: "executable" is derived from the clock. */
export type WillStatus = StoredWillStatus | "executable"

export type Payout = "wallets" | "bank"

export type ActivityKind = "deployed" | "invited" | "accepted" | "declined" | "confirmed" | "vetoed" | "executed"

export interface ActivityEntry {
  id: string
  at: number
  kind: ActivityKind
  actor: string
  target?: string
  hash?: string
}

export interface SwapLine {
  symbol: TokenSymbol
  amount: number
  price: number
  received: number
  hash: string
}

export interface ReleaseLine {
  name: string
  address: string
  share: number
  amount: number
  hash: string
}

export interface EstateRecord {
  executedAt: number
  block: number
  executedBy: string
  swaps: SwapLine[]
  total: number
  lockHash: string
  payout: Payout
  releases: ReleaseLine[]
  bankReference?: string
}

export interface Will {
  id: string
  name: string
  owner: Person
  /** The visitor's relationship to this will. */
  role: "owner" | "guardian"
  contract: string
  deployedAt: number
  guardians: Guardian[]
  beneficiaries: Beneficiary[]
  holdings: Holding[]
  window: { minDays: number; maxDays: number }
  status: StoredWillStatus
  declaration: { firstAt: number } | null
  cooldownUntil: number | null
  payout: Payout
  bankLabel?: string
  record: EstateRecord | null
  activity: ActivityEntry[]
  /** Pending guardians accept on their own after deploy (simulated other people). */
  autoAccept?: boolean
}

export interface WalletState {
  status: "disconnected" | "connecting" | "connected"
  address: string
  name: string
}

export interface DemoSettings {
  failNext: boolean
  slow: boolean
}

export interface DemoState {
  version: 1
  /** Milliseconds added to the real clock by "advance time". */
  clockOffset: number
  wallet: WalletState
  balances: Holding[]
  contacts: Person[]
  wills: Will[]
  settings: DemoSettings
}

/** What the simulated wallet shows before the visitor confirms. */
export interface TxSummary {
  kind: "sign" | "tx"
  title: string
  lines: { label: string; value: string }[]
  /** Shown in the prompt for actions that move value. */
  movesValue?: boolean
}

export type TxPhase = "idle" | "signing" | "pending" | "confirmed" | "failed"

export interface TxState {
  phase: TxPhase
  hash?: string
  error?: "rejected" | "reverted"
}
