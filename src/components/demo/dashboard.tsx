"use client"

import { ArrowRightIcon, BellRingIcon, MailOpenIcon, PlusIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { WalletAvatar } from "@/components/ui/wallet"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { useDemo } from "@/lib/demo/store"
import { totalUsd } from "@/lib/demo/tokens"
import type { Will } from "@/lib/demo/types"
import { useNow } from "@/lib/demo/use-now"
import { displayStatus, executionAt } from "@/lib/demo/window"
import { formatDate, formatDuration, formatUsd } from "@/lib/format"

import { ActivityList, type ActivityItem } from "./activity-list"
import { useCopy } from "./app-provider"
import { SectionTitle, StatusBadge } from "./bits"

function WillCard({ will, now }: { will: Will; now: number }) {
  const { app, locale } = useCopy()
  const d = app.dashboard
  const status = displayStatus(will, now)
  const at = executionAt(will)
  const accepted = will.guardians.filter((g) => g.state === "accepted" || g.state === "confirmed").length
  const you = will.guardians.find((g) => g.isYou)
  return (
    <article className="group relative flex flex-col rounded-md border bg-card p-4 transition-colors hover:border-foreground/40 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg leading-snug font-medium sm:text-xl">
            <Link href={href(locale, `/app/will/${will.id}`)} className="after:absolute after:inset-0 after:rounded-md focus-visible:outline-none">
              {will.name}
            </Link>
          </h3>
          {will.role === "guardian" ? (
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <WalletAvatar address={will.owner.address} size={16} />
              {t(d.owner, { name: will.owner.name })}
            </p>
          ) : null}
        </div>
        <StatusBadge status={status} />
      </div>

      {status === "declared" && at ? (
        <p className="mt-3 text-sm font-medium text-brass">
          {t(app.will.window.remaining, { time: formatDuration(at - now, locale) })} · {formatDate(at, locale, false)}
        </p>
      ) : null}
      {status === "executable" ? <p className="mt-3 text-sm font-medium text-primary">{app.will.window.elapsed}</p> : null}
      {you?.state === "pending" ? <p className="mt-3 text-sm font-medium text-brass">{app.will.actions.waitingFor}</p> : null}

      <div className="min-h-4 flex-1" aria-hidden="true" />
      <dl className="grid grid-cols-2 gap-3 border-t border-dashed pt-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">{app.will.assets.title}</dt>
          <dd className="font-medium tabular">{formatUsd(will.record ? will.record.total : totalUsd(will.holdings), locale, 0)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{app.will.guardians.title}</dt>
          <dd className="font-medium">{t(d.guardiansCount, { accepted, total: will.guardians.length })}</dd>
        </div>
      </dl>
    </article>
  )
}

export function Dashboard() {
  const demo = useDemo()
  const now = useNow()
  const { app, locale } = useCopy()
  const d = app.dashboard
  if (!demo) return null

  const mine = demo.wills.filter((w) => w.role === "owner")
  const guarding = demo.wills.filter((w) => w.role === "guardian" && w.guardians.find((g) => g.isYou)?.state !== "declined")
  const alerts = mine.filter((w) => displayStatus(w, now) === "declared")
  const invites = guarding.filter((w) => w.guardians.find((g) => g.isYou)?.state === "pending")
  const activity: ActivityItem[] = demo.wills.flatMap((w) => w.activity.map((e) => ({ ...e, willId: w.id, willName: w.name })))

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-medium sm:text-[2.5rem] sm:leading-tight">{d.title}</h1>
        </div>
        <Button asChild size="lg" className="self-start sm:self-auto">
          <Link href={href(locale, "/app/new")}>
            <PlusIcon aria-hidden="true" />
            {d.write}
          </Link>
        </Button>
      </div>

      {alerts.length > 0 || invites.length > 0 ? (
        <div className="mt-8 flex flex-col gap-3">
          {alerts.map((w) => {
            const first = w.guardians.find((g) => g.state === "confirmed")
            const at = executionAt(w) ?? now
            return (
              <div key={w.id} role="alert" className="flex flex-col gap-4 rounded-md border-2 border-brass/60 bg-brass-soft p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="flex gap-3">
                  <BellRingIcon className="mt-1 size-5 shrink-0 text-brass" aria-hidden="true" />
                  <div>
                    <p className="font-serif text-lg leading-snug font-medium text-foreground">{t(d.alertTitle, { name: first?.name ?? "" })}</p>
                    <p className="mt-1 text-sm text-foreground/80">{t(d.alertBody, { will: w.name, date: formatDate(at, locale) })}</p>
                  </div>
                </div>
                <Button asChild className="shrink-0">
                  <Link href={href(locale, `/app/will/${w.id}#veto`)}>
                    {d.alertCta}
                    <ArrowRightIcon aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            )
          })}
          {invites.map((w) => (
            <div key={w.id} className="flex flex-col gap-4 rounded-md border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex gap-3">
                <MailOpenIcon className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
                <p className="font-serif text-lg leading-snug font-medium">{t(d.inviteTitle, { name: w.owner.name })}</p>
              </div>
              <Button asChild variant="outline" className="shrink-0">
                <Link href={href(locale, `/app/will/${w.id}`)}>
                  {d.inviteCta}
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-10">
          <section aria-labelledby="yours">
            <SectionTitle id="yours">{d.yours}</SectionTitle>
            {mine.length === 0 ? (
              <div className="mt-4 rounded-md border border-dashed p-6 text-center">
                <p className="mx-auto max-w-md text-muted-foreground">{d.emptyYours}</p>
                <Button asChild className="mt-4">
                  <Link href={href(locale, "/app/new")}>{d.write}</Link>
                </Button>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {mine.map((w) => (
                  <WillCard key={w.id} will={w} now={now} />
                ))}
              </div>
            )}
          </section>
          <section aria-labelledby="guarding">
            <SectionTitle id="guarding">{d.guarding}</SectionTitle>
            {guarding.length === 0 ? (
              <p className="mt-4 rounded-md border border-dashed p-6 text-center text-muted-foreground">{d.emptyGuarding}</p>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {guarding.map((w) => (
                  <WillCard key={w.id} will={w} now={now} />
                ))}
              </div>
            )}
          </section>
        </div>
        <aside aria-labelledby="activity">
          <SectionTitle id="activity">{d.activity}</SectionTitle>
          <div className="mt-4">
            <ActivityList items={activity} now={now} empty={d.emptyActivity} limit={9} />
          </div>
        </aside>
      </div>
    </div>
  )
}
