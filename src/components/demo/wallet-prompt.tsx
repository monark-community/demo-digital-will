"use client"

import { PenLineIcon, SendIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NetworkBadge } from "@/components/ui/network-badge"
import { WalletAvatar } from "@/components/ui/wallet"
import { YOU } from "@/lib/demo/seed"
import { usePrompt } from "@/lib/demo/store"
import { shortAddress } from "@/lib/format"

import { useCopy } from "./app-provider"

/** The simulated wallet: every signature and transaction passes through here. */
export function WalletPrompt() {
  const prompt = usePrompt()
  const { app, common } = useCopy()
  const p = app.prompt
  const s = prompt?.summary

  return (
    <Dialog open={!!prompt} onOpenChange={(open) => !open && prompt?.resolve(false)}>
      <DialogContent closeLabel={common.close} className="gap-0 p-0 sm:max-w-md">
        {s ? (
          <>
            <DialogHeader className="border-b px-5 pt-5 pb-4">
              <div className="flex items-center justify-between gap-3 pr-8">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {s.kind === "sign" ? <PenLineIcon className="size-3.5" aria-hidden="true" /> : <SendIcon className="size-3.5" aria-hidden="true" />}
                  {s.kind === "sign" ? p.signTitle : p.txTitle}
                </span>
                <NetworkBadge name={app.wallet.network} variant="outline" icon={<span className="block size-full rounded-full bg-brass" />} />
              </div>
              <DialogTitle className="mt-3">{s.title}</DialogTitle>
              <DialogDescription className="font-mono text-xs">{p.site}</DialogDescription>
            </DialogHeader>
            <dl className="divide-y px-5 text-sm">
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-muted-foreground">{p.from}</dt>
                <dd className="flex items-center gap-2">
                  <WalletAvatar address={YOU.address} size={20} />
                  <span className="font-mono text-xs">{shortAddress(YOU.address)}</span>
                </dd>
              </div>
              {s.kind === "sign" ? (
                <div className="py-3">
                  <dt className="text-muted-foreground">{p.message}</dt>
                  <dd className="mt-1.5 rounded-sm border bg-muted/60 p-3 font-mono text-xs leading-relaxed">{p.signMessage}</dd>
                </div>
              ) : null}
              {s.lines.map((l) => (
                <div key={l.label} className="flex items-start justify-between gap-4 py-3">
                  <dt className="shrink-0 text-muted-foreground">{l.label}</dt>
                  <dd className="text-right font-medium">{l.value}</dd>
                </div>
              ))}
              {s.kind === "tx" ? (
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-muted-foreground">{p.fee}</dt>
                  <dd className="font-mono text-xs">{prompt?.fee} tETH</dd>
                </div>
              ) : null}
            </dl>
            {s.movesValue ? (
              <p className="mx-5 mb-4 rounded-sm border border-brass/40 bg-brass-soft px-3 py-2 text-xs font-medium text-brass">{common.finance}</p>
            ) : null}
            <DialogFooter className="mx-0 mb-0 rounded-b-md px-5">
              <Button variant="outline" onClick={() => prompt?.resolve(false)}>
                {p.reject}
              </Button>
              <Button onClick={() => prompt?.resolve(true)} autoFocus>
                {p.confirm}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
