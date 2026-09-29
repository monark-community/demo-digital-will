"use client"

import Link from "next/link"

import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { YOU } from "@/lib/demo/seed"
import type { ActivityEntry } from "@/lib/demo/types"
import { formatDateTime, formatRelative } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useCopy } from "./app-provider"

const dot: Record<ActivityEntry["kind"], string> = {
  deployed: "bg-foreground",
  invited: "bg-muted-foreground",
  accepted: "bg-primary",
  declined: "bg-muted-foreground",
  confirmed: "bg-brass",
  vetoed: "bg-primary",
  executed: "bg-wax",
}

export interface ActivityItem extends ActivityEntry {
  willId?: string
  willName?: string
}

export function ActivityList({ items, now, empty, limit }: { items: ActivityItem[]; now: number; empty: string; limit?: number }) {
  const { app, common, locale } = useCopy()
  const sorted = [...items].sort((a, b) => b.at - a.at).slice(0, limit ?? items.length)
  if (sorted.length === 0) return <p className="py-6 text-sm text-muted-foreground">{empty}</p>
  const who = (name: string) => (name === YOU.name ? common.youCap : name)
  return (
    <ol className="relative">
      {sorted.map((e) => (
        <li key={`${e.willId ?? ""}${e.id}`} className="relative flex gap-3 pb-4 pl-1 last:pb-0">
          <span className={cn("relative z-10 mt-1.5 size-2 shrink-0 rounded-full ring-4 ring-background", dot[e.kind])} aria-hidden="true" />
          <div className="min-w-0 flex-1 text-sm">
            <p className="leading-snug">
              {t(app.activity[e.kind], { actor: who(e.actor), target: e.target === YOU.name ? common.you : (e.target ?? "") })}
              {e.willName && e.willId ? (
                <>
                  {" · "}
                  <Link href={href(locale, `/app/will/${e.willId}`)} className="font-medium underline decoration-foreground/30 underline-offset-2 hover:decoration-foreground">
                    {e.willName}
                  </Link>
                </>
              ) : null}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              <time dateTime={new Date(e.at).toISOString()} title={formatDateTime(e.at, locale)}>
                {formatRelative(e.at, now, locale)}
              </time>
              {e.hash ? <span className="ml-2 font-mono">{e.hash.slice(0, 10)}…{e.hash.slice(-4)}</span> : null}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
