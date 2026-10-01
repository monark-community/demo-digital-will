"use client"

import { useSyncExternalStore } from "react"

import { createSeed, type SeedCopy } from "./seed"
import type { DemoSettings, DemoState, TxSummary, WalletState, Will } from "./types"

/**
 * The demo's single source of truth: a tiny external store persisted to
 * localStorage (every access in try/catch). Swapping to a real chain means
 * replacing this module, chain.ts and ops.ts; the UI only uses hooks and ops.
 */

const STORAGE_KEY = "willchain-demo-v1"

let state: DemoState | null = null
let storageOk = true
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

function persist() {
  if (!state) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    storageOk = true
  } catch {
    storageOk = false
  }
}

function load(): DemoState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DemoState
    if (parsed?.version !== 1 || !Array.isArray(parsed.wills)) return null
    // A reload never resumes a half-finished sign-in.
    if (parsed.wallet.status === "connecting") parsed.wallet.status = "disconnected"
    return parsed
  } catch {
    storageOk = false
    return null
  }
}

/** Load saved state, or seed the examples in the visitor's language. Idempotent. */
export function initDemo(copy: SeedCopy) {
  if (state) return
  state = load() ?? createSeed(copy)
  persist()
  emit()
}

export function resetDemo(copy: SeedCopy) {
  const connected = state?.wallet.status === "connected"
  state = createSeed(copy)
  if (connected) state.wallet.status = "connected"
  persist()
  emit()
}

export function update(fn: (s: DemoState) => DemoState) {
  if (!state) return
  state = fn(state)
  persist()
  emit()
}

export function updateWill(id: string, fn: (w: Will) => Will) {
  update((s) => ({ ...s, wills: s.wills.map((w) => (w.id === id ? fn(w) : w)) }))
}

export function setWallet(patch: Partial<WalletState>) {
  update((s) => ({ ...s, wallet: { ...s.wallet, ...patch } }))
}

export function setSettings(patch: Partial<DemoSettings>) {
  update((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
}

export function getDemo() {
  return state
}

/** The demo clock: real time plus whatever the visitor fast-forwarded. */
export function demoNow(): number {
  return Date.now() + (state?.clockOffset ?? 0)
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Current demo state, or null until it has loaded on the client. */
export function useDemo(): DemoState | null {
  return useSyncExternalStore(subscribe, () => state, () => null)
}

export function useStorageOk(): boolean {
  return useSyncExternalStore(subscribe, () => storageOk, () => true)
}

/* ---------------------------------------------------------------------------
 * Simulated wallet prompt: a promise resolved by the WalletPrompt dialog.
 * ------------------------------------------------------------------------ */

export interface PromptRequest {
  summary: TxSummary
  fee: string
  resolve: (approved: boolean) => void
}

let prompt: PromptRequest | null = null
const promptListeners = new Set<() => void>()

function emitPrompt() {
  for (const l of promptListeners) l()
}

export function requestSignature(summary: TxSummary, fee: string): Promise<boolean> {
  return new Promise((resolve) => {
    prompt?.resolve(false)
    prompt = {
      summary,
      fee,
      resolve: (ok) => {
        prompt = null
        emitPrompt()
        resolve(ok)
      },
    }
    emitPrompt()
  })
}

export function usePrompt(): PromptRequest | null {
  return useSyncExternalStore(
    (l) => {
      promptListeners.add(l)
      return () => promptListeners.delete(l)
    },
    () => prompt,
    () => null
  )
}
