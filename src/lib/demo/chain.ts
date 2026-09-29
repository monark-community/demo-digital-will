"use client"

import { useCallback, useRef, useState } from "react"

import { randomHash } from "./ids"
import { getDemo, requestSignature, setSettings } from "./store"
import type { TxState, TxSummary } from "./types"

/**
 * Simulated chain. A transaction is: wallet prompt (sign or reject) ->
 * pending with a hash for a realistic block time -> confirmed or reverted.
 * "Fail the next transaction" in the demo controls forces one revert.
 * A signature ("sign" kind) skips the network entirely.
 */

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function blockTime(): number {
  const slow = getDemo()?.settings.slow
  const [min, max] = slow ? [3000, 6000] : [1200, 2400]
  return Math.round(min + Math.random() * (max - min))
}

async function mine(): Promise<"confirmed" | "reverted"> {
  await sleep(blockTime())
  if (getDemo()?.settings.failNext) {
    setSettings({ failNext: false })
    return "reverted"
  }
  return "confirmed"
}

/** Estimated network fee shown in the wallet prompt (simulated, in tETH). */
export function estimateFee(): string {
  return (0.00042 + Math.random() * 0.00031).toFixed(5)
}

/** A plausible Sepolia block height for the demo clock. */
export function currentBlock(now: number): number {
  return 6_812_000 + Math.floor((now - Date.UTC(2026, 0, 1)) / 12_000)
}

/**
 * One transaction's lifecycle for a component. `apply` runs only on
 * confirmation and receives the transaction hash.
 */
export function useTx() {
  const [state, setState] = useState<TxState>({ phase: "idle" })
  const busy = useRef(false)

  const run = useCallback(async (summary: TxSummary, apply: (hash: string) => void | Promise<void>) => {
    if (busy.current) return false
    busy.current = true
    try {
      setState({ phase: "signing" })
      const ok = await requestSignature(summary, summary.kind === "tx" ? estimateFee() : "0")
      if (!ok) {
        setState({ phase: "failed", error: "rejected" })
        return false
      }
      if (summary.kind === "sign") {
        await sleep(500)
        await apply("")
        setState({ phase: "confirmed" })
        return true
      }
      const hash = randomHash()
      setState({ phase: "pending", hash })
      const outcome = await mine()
      if (outcome === "reverted") {
        setState({ phase: "failed", hash, error: "reverted" })
        return false
      }
      await apply(hash)
      setState({ phase: "confirmed", hash })
      return true
    } finally {
      busy.current = false
    }
  }, [])

  const reset = useCallback(() => setState({ phase: "idle" }), [])

  return { state, run, reset, busy: state.phase === "signing" || state.phase === "pending" }
}
