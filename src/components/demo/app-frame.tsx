"use client"

import { KeyRoundIcon, TriangleAlertIcon } from "lucide-react"
import { toast } from "sonner"

import { SealMark } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import { ConnectWallet } from "@/components/ui/connect-wallet"
import { NetworkBadge } from "@/components/ui/network-badge"
import { useTx } from "@/lib/demo/chain"
import { signIn, signOut } from "@/lib/demo/ops"
import { useDemo, useStorageOk } from "@/lib/demo/store"

import { useCopy } from "./app-provider"
import { DemoControls } from "./demo-controls"

function DeskBar() {
  const demo = useDemo()
  const { app, common } = useCopy()
  if (!demo) return null
  return (
    <div className="border-b bg-card/60" data-print-hide>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 sm:px-6">
        <span className="rounded-sm border border-brass/50 bg-brass-soft px-1.5 py-0.5 text-xs font-semibold text-brass">{common.demoBadge}</span>
        <NetworkBadge name={app.wallet.network} variant="outline" className="hidden sm:inline-flex" icon={<span className="block size-full rounded-full bg-brass" />} />
        <div className="ml-auto flex items-center gap-2">
          <DemoControls />
          <ConnectWallet
            status="connected"
            address={demo.wallet.address}
            name={demo.wallet.name}
            disconnectLabel={app.wallet.disconnect}
            onDisconnect={signOut}
            className="max-w-[12rem] py-1.5 [&_[data-slot=wallet-avatar]]:size-6! sm:max-w-none"
          />
        </div>
      </div>
    </div>
  )
}

function Gate() {
  const { app } = useCopy()
  const g = app.gate
  const tx = useTx()

  const connect = () =>
    tx.run({ kind: "sign", title: app.prompt.titles.signIn, lines: [] }, () => {
      signIn()
      toast.success(app.toasts.signedIn)
    })

  const waiting = tx.state.phase === "signing" || tx.state.phase === "pending"

  return (
    <section className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16 sm:py-24">
      <div className="paper rounded-md p-6 sm:p-8">
        <SealMark className="size-12" />
        <h1 className="mt-6 text-3xl font-medium sm:text-4xl">{g.title}</h1>
        <p className="mt-3 text-muted-foreground">{g.body}</p>
        <Button size="lg" className="mt-7 w-full sm:w-auto" onClick={connect} disabled={waiting}>
          <KeyRoundIcon aria-hidden="true" />
          {waiting ? g.connecting : g.connect}
        </Button>
        {tx.state.phase === "failed" ? (
          <p role="alert" className="mt-4 flex items-start gap-2 text-sm text-destructive">
            <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {g.rejected}
          </p>
        ) : null}
        <p className="mt-6 border-t pt-4 text-xs text-muted-foreground">{g.note}</p>
      </div>
    </section>
  )
}

function Loading() {
  const { common } = useCopy()
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6" aria-busy="true">
      <span className="sr-only">{common.loading}</span>
      <div className="h-9 w-64 animate-pulse rounded-md bg-muted" />
      <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded-md bg-muted" />
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="h-44 animate-pulse rounded-md bg-muted" />
        <div className="h-44 animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  )
}

export function AppFrame({ children }: { children: React.ReactNode }) {
  const demo = useDemo()
  const storageOk = useStorageOk()
  const { app } = useCopy()
  if (!demo) return <Loading />
  if (demo.wallet.status !== "connected") return <Gate />
  return (
    <>
      <DeskBar />
      {!storageOk ? (
        <p role="status" className="border-b bg-brass-soft px-4 py-2 text-center text-sm text-brass">
          {app.controls.storage}
        </p>
      ) : null}
      {children}
    </>
  )
}
