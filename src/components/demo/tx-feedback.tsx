"use client"

import { Loader2Icon, PenLineIcon, RotateCcwIcon, TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TxStatus } from "@/components/ui/tx-status"
import type { TxState } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

import { useCopy } from "./app-provider"

/**
 * Inline status for one transaction, shown right under the action that sent
 * it: signing -> pending (with hash) -> confirmed, or failed with a retry.
 */
export function TxFeedback({ state, onRetry, onDismiss, className }: { state: TxState; onRetry?: () => void; onDismiss?: () => void; className?: string }) {
  const { app } = useCopy()
  const c = app.tx
  if (state.phase === "idle") return null

  return (
    <div aria-live="polite" className={cn("text-sm", className)}>
      {state.phase === "signing" ? (
        <p className="inline-flex items-center gap-2 text-muted-foreground">
          <PenLineIcon className="size-4 animate-pulse" aria-hidden="true" />
          {c.signing}
        </p>
      ) : null}
      {state.phase === "pending" && state.hash ? (
        <div className="flex flex-wrap items-center gap-2">
          <TxStatus status="pending" hash={state.hash} label={c.pending} className="max-w-full" />
        </div>
      ) : null}
      {state.phase === "pending" && !state.hash ? (
        <p className="inline-flex items-center gap-2 text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
          {c.pending}
        </p>
      ) : null}
      {state.phase === "confirmed" && state.hash ? <TxStatus status="confirmed" hash={state.hash} label={c.confirmed} className="max-w-full" /> : null}
      {state.phase === "failed" ? (
        <div role="alert" className="flex flex-col gap-3 rounded-md border border-destructive/40 bg-destructive/[0.06] p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-destructive">
            <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              {state.error === "rejected" ? c.rejected : c.reverted}
              {state.hash ? <span className="mt-1 block font-mono text-xs text-muted-foreground">{state.hash.slice(0, 10)}…{state.hash.slice(-6)}</span> : null}
            </span>
          </p>
          <div className="flex shrink-0 gap-2">
            {onDismiss ? (
              <Button size="sm" variant="ghost" onClick={onDismiss}>
                {c.dismiss}
              </Button>
            ) : null}
            {onRetry ? (
              <Button size="sm" variant="outline" onClick={onRetry}>
                <RotateCcwIcon aria-hidden="true" />
                {c.retry}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
