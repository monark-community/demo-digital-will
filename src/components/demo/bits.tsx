"use client"

import { WalletAvatar } from "@/components/ui/wallet"
import type { Relation, WillStatus } from "@/lib/demo/types"
import { shortAddress } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useCopy } from "./app-provider"

const statusTone: Record<WillStatus, string> = {
  inactive: "border-foreground/25 text-muted-foreground",
  active: "border-primary/50 bg-ledger-soft text-primary",
  declared: "border-brass/50 bg-brass-soft text-brass",
  executable: "border-primary bg-primary text-primary-foreground",
  executed: "border-wax/50 bg-wax-soft text-wax",
}

const statusDot: Record<WillStatus, string> = {
  inactive: "border border-muted-foreground bg-transparent",
  active: "bg-primary",
  declared: "bg-brass animate-pulse",
  executable: "bg-primary-foreground",
  executed: "bg-wax",
}

export function StatusBadge({ status, className }: { status: WillStatus; className?: string }) {
  const { app } = useCopy()
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-semibold whitespace-nowrap", statusTone[status], className)}>
      <span className={cn("size-1.5 rounded-full", statusDot[status])} aria-hidden="true" />
      {app.status[status]}
    </span>
  )
}

export function useRelation() {
  const { app } = useCopy()
  return (r: Relation) => app.relations[r]
}

/** A person with their jazzicon, name, relation and short address. */
export function PersonLine({
  name,
  address,
  relation,
  isYou,
  trailing,
  className,
}: {
  name: string
  address: string
  relation: Relation
  isYou?: boolean
  trailing?: React.ReactNode
  className?: string
}) {
  const rel = useRelation()
  const { common } = useCopy()
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <WalletAvatar address={address} size={32} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">
          {name}
          {isYou ? <span className="ml-1.5 text-xs font-semibold text-primary">({common.you})</span> : null}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {rel(relation)} · <span className="font-mono">{shortAddress(address)}</span>
        </p>
      </div>
      {trailing}
    </div>
  )
}

/** Weight shown as filled pips (1–3) plus a text label for screen readers. */
export function WeightPips({ weight, label }: { weight: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1" title={label}>
      <span className="sr-only">{label}</span>
      {[1, 2, 3].map((i) => (
        <span key={i} aria-hidden="true" className={cn("size-2 rotate-45 border border-foreground/50", i <= weight ? "bg-foreground/80" : "bg-transparent opacity-40")} />
      ))}
    </span>
  )
}

export function SectionTitle({ children, aside, id }: { children: React.ReactNode; aside?: React.ReactNode; id?: string }) {
  return (
    <div className="flex items-end justify-between gap-3 border-b border-foreground/15 pb-2">
      <h2 id={id} className="text-xl font-medium sm:text-2xl">
        {children}
      </h2>
      {aside}
    </div>
  )
}
