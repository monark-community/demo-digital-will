"use client"

import { ArrowLeftIcon, BanknoteIcon, CheckIcon, ClockIcon, GavelIcon, HandshakeIcon, ShieldCheckIcon, WalletIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { useCallback, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { TokenAmount } from "@/components/ui/token-amount"
import { WalletAddress } from "@/components/ui/wallet"
import { Stamp } from "@/components/will/stamp"
import { WindowRuler } from "@/components/will/window-ruler"
import { href, intlLocale } from "@/i18n/config"
import { t } from "@/i18n/t"
import { useTx } from "@/lib/demo/chain"
import { acceptRole, confirmPassing, declineRole, executeWill, proveAlive } from "@/lib/demo/ops"
import { useDemo } from "@/lib/demo/store"
import { TOKENS, toUnits, totalUsd, usdValue } from "@/lib/demo/tokens"
import type { Will } from "@/lib/demo/types"
import { useNow } from "@/lib/demo/use-now"
import { DAY, displayStatus, executionAt, inCooldown, waitDays, weights, willWaitDays } from "@/lib/demo/window"
import { formatDate, formatDuration, formatUsd } from "@/lib/format"
import { cn } from "@/lib/utils"

import { ActivityList } from "./activity-list"
import { useCopy } from "./app-provider"
import { PersonLine, SectionTitle, StatusBadge, WeightPips } from "./bits"
import { EstateRecordView, ExecutionSteps } from "./estate-record"
import { HoldButton } from "./hold-button"
import { TxFeedback } from "./tx-feedback"

/* ------------------------------------------------------------------------ */

function WindowPanel({ will, now }: { will: Will; now: number }) {
  const { app, locale } = useCopy()
  const w = app.will.window
  const { confirmed, total } = weights(will)
  const at = executionAt(will)
  const wait = willWaitDays(will)
  const running = will.declaration !== null && will.status !== "executed"
  const elapsed = running && will.declaration ? (now - will.declaration.firstAt) / DAY : null
  const labels = {
    first: w.first,
    today: w.today,
    execution: w.execution,
    minMark: t(w.minMark, { n: will.window.minDays }),
    maxMark: t(w.maxMark, { n: will.window.maxDays }),
  }
  const idleWait = waitDays(will.window.minDays, will.window.maxDays, 0, total)

  return (
    <section aria-labelledby="window-title" className="rounded-md border bg-card p-4 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="window-title" className="text-xl font-medium sm:text-2xl">
          {w.title}
        </h2>
        <span className="text-xs text-muted-foreground">{t(w.weight, { confirmed, total })}</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{t(w.rule, { min: will.window.minDays, max: will.window.maxDays })}</p>

      {running && at ? (
        <>
          <WindowRuler
            className="mt-5"
            minDays={will.window.minDays}
            maxDays={will.window.maxDays}
            waitDays={wait}
            elapsedDays={elapsed}
            labels={labels}
            ariaLabel={t(w.rulerLabel, { n: Math.round(wait * 10) / 10 })}
            executionNote={formatDate(at, locale, false)}
          />
          <p className={cn("mt-4 flex items-center gap-2 text-sm font-medium", now >= at ? "text-primary" : "text-brass")}>
            <ClockIcon className="size-4" aria-hidden="true" />
            {now >= at ? w.elapsed : `${t(w.remaining, { time: formatDuration(at - now, locale) })} · ${t(w.at, { date: formatDate(at, locale) })}`}
          </p>
        </>
      ) : will.status !== "executed" ? (
        <div className="mt-4">
          <WindowRuler
            className="opacity-70"
            minDays={will.window.minDays}
            maxDays={will.window.maxDays}
            waitDays={idleWait}
            elapsedDays={null}
            labels={labels}
            ariaLabel={t(w.rulerLabel, { n: Math.round(idleWait * 10) / 10 })}
          />
          <p className="mt-3 text-sm">
            <span className="font-medium">{w.idleTitle}.</span>{" "}
            <span className="text-muted-foreground">
              {t(w.idleBody, { earliest: formatDate(now + will.window.minDays * DAY, locale), latest: formatDate(now + idleWait * DAY, locale) })}
            </span>
          </p>
        </div>
      ) : null}
      {inCooldown(will, now) && will.cooldownUntil ? (
        <p className="mt-3 rounded-sm bg-ledger-soft px-3 py-2 text-sm text-primary">{t(w.cooldown, { date: formatDate(will.cooldownUntil, locale) })}</p>
      ) : null}
    </section>
  )
}

/* ------------------------------------------------------------------------ */

function OwnerVeto({ will, now }: { will: Will; now: number }) {
  const { app, locale } = useCopy()
  const a = app.will.actions
  const tx = useTx()
  const at = executionAt(will) ?? now
  const names = will.guardians.filter((g) => g.state === "confirmed").map((g) => g.name)

  const veto = useCallback(() => {
    void tx.run(
      {
        kind: "tx",
        title: app.prompt.titles.veto,
        lines: [
          { label: app.prompt.lines.will, value: will.name },
          { label: app.prompt.lines.effect, value: app.prompt.lines.vetoEffect },
        ],
      },
      (hash) => {
        const until = proveAlive(will.id, hash)
        toast.success(t(app.toasts.vetoed, { date: formatDate(until, locale) }))
      }
    )
  }, [tx, app, will, locale])

  return (
    <section id="veto" aria-labelledby="veto-title" className="scroll-mt-24 rounded-md border-2 border-brass/60 bg-brass-soft p-4 sm:p-6">
      <h2 id="veto-title" className="text-2xl font-medium">
        {a.vetoTitle}
      </h2>
      <p className="mt-2 text-foreground/85">{t(a.vetoBody, { names: names.join(", "), date: formatDate(at, locale) })}</p>
      <div className="mt-5">
        <HoldButton label={a.hold} holdingLabel={a.holding} instructions={a.holdKeyboard} onComplete={veto} disabled={tx.busy} />
      </div>
      <TxFeedback className="mt-4" state={tx.state} onRetry={veto} onDismiss={tx.reset} />
    </section>
  )
}

function GuardianActions({ will, now, onExecuted }: { will: Will; now: number; onExecuted: () => void }) {
  const { app, locale, common } = useCopy()
  const a = app.will.actions
  const tx = useTx()
  const [last, setLast] = useState<"accept" | "decline" | "confirm" | "execute" | null>(null)
  const you = will.guardians.find((g) => g.isYou)
  const status = displayStatus(will, now)
  if (!you) return null

  const accept = () => {
    setLast("accept")
    void tx.run(
      { kind: "tx", title: app.prompt.titles.accept, lines: [{ label: app.prompt.lines.will, value: `${will.name} · ${will.owner.name}` }, { label: app.prompt.lines.effect, value: t(app.prompt.lines.acceptEffect, { n: you.weight }) }] },
      (hash) => {
        acceptRole(will.id, hash)
        toast.success(t(app.toasts.acceptedYou, { will: will.name }))
      }
    )
  }
  const decline = () => {
    setLast("decline")
    void tx.run(
      { kind: "tx", title: app.prompt.titles.decline, lines: [{ label: app.prompt.lines.will, value: `${will.name} · ${will.owner.name}` }, { label: app.prompt.lines.effect, value: app.prompt.lines.declineEffect }] },
      (hash) => {
        declineRole(will.id, hash)
        toast(t(app.toasts.declinedYou, { will: will.name }))
      }
    )
  }
  const confirm = () => {
    setLast("confirm")
    void tx.run(
      { kind: "tx", title: t(app.prompt.titles.confirm, { name: will.owner.name }), lines: [{ label: app.prompt.lines.will, value: will.name }, { label: app.prompt.lines.effect, value: t(app.prompt.lines.confirmEffect, { n: you.weight }) }] },
      (hash) => {
        confirmPassing(will.id, hash)
        toast(app.toasts.confirmed)
      }
    )
  }
  const execute = () => {
    setLast("execute")
    void tx.run(
      {
        kind: "tx",
        title: t(app.prompt.titles.execute, { name: will.owner.name }),
        movesValue: true,
        lines: [
          { label: app.prompt.lines.will, value: will.name },
          { label: app.prompt.lines.funds, value: formatUsd(totalUsd(will.holdings), locale, 0) },
          { label: app.prompt.lines.effect, value: app.prompt.lines.executeEffect },
        ],
      },
      (hash) => {
        onExecuted()
        executeWill(will.id, hash)
      }
    )
  }
  const retry = { accept, decline, confirm, execute }

  const feedback = <TxFeedback className="mt-4" state={tx.state} onRetry={last ? retry[last] : undefined} onDismiss={tx.reset} />

  if (will.status === "executed") {
    return will.record ? (
      <p className="flex items-center gap-2 text-muted-foreground">
        <GavelIcon className="size-4" aria-hidden="true" />
        {t(a.executedBy, { date: formatDate(will.record.executedAt, locale) })}
      </p>
    ) : null
  }

  if (you.state === "pending") {
    return (
      <section className="rounded-md border bg-card p-4 sm:p-6">
        <h2 className="flex items-center gap-2 text-2xl font-medium">
          <HandshakeIcon className="size-6 text-primary" aria-hidden="true" />
          {t(app.dashboard.inviteTitle, { name: will.owner.name })}
        </h2>
        <p className="mt-2 text-muted-foreground">{app.statusHint.inactive}</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button size="lg" onClick={accept} disabled={tx.busy}>
            <CheckIcon aria-hidden="true" />
            {a.accept}
          </Button>
          <Button size="lg" variant="outline" onClick={decline} disabled={tx.busy}>
            <XIcon aria-hidden="true" />
            {a.decline}
          </Button>
        </div>
        {feedback}
      </section>
    )
  }

  if (you.state === "declined") return <p className="rounded-md border p-4 text-muted-foreground">{a.youDeclined}</p>

  if (status === "executable") {
    return (
      <section className="rounded-md border-2 border-primary bg-ledger-soft p-4 sm:p-6">
        <h2 className="flex items-center gap-2 text-2xl font-medium">
          <GavelIcon className="size-6 text-primary" aria-hidden="true" />
          {app.will.window.elapsed}
        </h2>
        <p className="mt-2 text-foreground/85">{a.executeHint}</p>
        <Button size="lg" className="mt-5 w-full sm:w-auto" onClick={execute} disabled={tx.busy}>
          <GavelIcon aria-hidden="true" />
          {a.execute}
        </Button>
        <p className="mt-3 text-xs font-medium text-brass">{common.finance}</p>
        {feedback}
      </section>
    )
  }

  const canConfirm = you.state === "accepted" && (will.status === "active" || will.status === "declared")
  return (
    <section className="rounded-md border bg-card p-4 sm:p-6">
      {you.state === "confirmed" ? (
        <p className="flex items-center gap-2 font-medium">
          <Stamp>{app.will.guardians.stamp}</Stamp>
          <span className="text-muted-foreground">{t(a.youConfirmed, { date: formatDate(you.confirmedAt ?? now, locale) })}</span>
        </p>
      ) : (
        <p className="flex items-start gap-2 text-muted-foreground">
          <ShieldCheckIcon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          {will.status === "inactive"
            ? t(a.waitGuardians, { n: will.guardians.filter((g) => g.state === "pending").length })
            : will.status === "declared"
              ? t(a.othersConfirmed, { names: will.guardians.filter((g) => g.state === "confirmed").map((g) => g.name).join(", ") })
              : a.youAccepted}
        </p>
      )}
      {canConfirm ? (
        <div className="mt-5 border-t pt-5">
          <Button size="lg" variant="outline" className="w-full border-wax/60 text-wax hover:bg-wax-soft sm:w-auto" onClick={confirm} disabled={tx.busy || inCooldown(will, now)}>
            {a.confirm}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">{a.confirmHint}</p>
        </div>
      ) : null}
      {feedback}
    </section>
  )
}

function OwnerStatus({ will, now }: { will: Will; now: number }) {
  const { app, locale } = useCopy()
  const a = app.will.actions
  const status = displayStatus(will, now)
  if (status === "declared") return <OwnerVeto will={will} now={now} />
  if (status === "executed" && will.record) return <p className="text-muted-foreground">{t(a.executedBy, { date: formatDate(will.record.executedAt, locale) })}</p>
  if (status === "executable") return <p className="rounded-md border bg-card p-4 text-muted-foreground">{app.statusHint.executable}</p>
  const pending = will.guardians.filter((g) => g.state === "pending").length
  return (
    <p className="flex items-start gap-2 rounded-md border bg-card p-4 text-muted-foreground">
      <ShieldCheckIcon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
      {pending > 0 ? t(a.waitGuardians, { n: pending }) : a.ownerActive}
    </p>
  )
}

/* ------------------------------------------------------------------------ */

function Guardians({ will }: { will: Will }) {
  const { app } = useCopy()
  return (
    <section aria-labelledby="g-title">
      <SectionTitle id="g-title">{app.will.guardians.title}</SectionTitle>
      <ul className="mt-2 divide-y">
        {will.guardians.map((g) => (
          <li key={g.id} className="py-3">
            <PersonLine
              name={g.name}
              address={g.address}
              relation={g.relation}
              isYou={g.isYou}
              trailing={
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  {g.state === "confirmed" ? (
                    <Stamp animate>
                      <span aria-hidden="true">{app.will.guardians.stamp}</span>
                      <span className="sr-only">{app.guardianState.confirmed}</span>
                    </Stamp>
                  ) : (
                    <span className={cn("text-xs font-medium", g.state === "accepted" ? "text-primary" : "text-muted-foreground")}>{app.guardianState[g.state]}</span>
                  )}
                  <WeightPips weight={g.weight} label={t(app.will.guardians.weight, { n: g.weight })} />
                </div>
              }
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

function Assets({ will }: { will: Will }) {
  const { app, locale } = useCopy()
  return (
    <section aria-labelledby="a-title">
      <SectionTitle id="a-title">{app.will.assets.title}</SectionTitle>
      <ul className="mt-2 divide-y">
        {will.holdings.map((h) => {
          const u = toUnits(h.amount)
          return (
            <li key={h.symbol} className="flex items-center justify-between gap-3 py-2.5">
              <span className="font-semibold">{h.symbol}</span>
              <TokenAmount
                className="items-end text-right"
                value={u.value}
                decimals={u.decimals}
                fractionDigits={TOKENS[h.symbol].digits}
                locale={intlLocale[locale]}
                usdValue={usdValue(h)}
              />
            </li>
          )
        })}
      </ul>
      <p className="mt-1 flex justify-between border-t border-foreground/30 pt-2 text-sm">
        <span className="text-muted-foreground">{app.will.assets.total}</span>
        <span className="font-semibold tabular">{formatUsd(totalUsd(will.holdings), locale)}</span>
      </p>
    </section>
  )
}

const shareColors = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]

function Beneficiaries({ will }: { will: Will }) {
  const { app } = useCopy()
  return (
    <section aria-labelledby="b-title">
      <SectionTitle id="b-title">{app.will.beneficiaries.title}</SectionTitle>
      <div className="mt-3 flex h-2.5 overflow-hidden rounded-[2px]" aria-hidden="true">
        {will.beneficiaries.map((b, i) => (
          <span key={b.id} className={cn(shareColors[i % shareColors.length], "border-r-2 border-card last:border-r-0")} style={{ width: `${b.share}%` }} />
        ))}
      </div>
      <ul className="mt-2 divide-y">
        {will.beneficiaries.map((b, i) => (
          <li key={b.id} className="py-2.5">
            <PersonLine
              name={b.name}
              address={b.address}
              relation={b.relation}
              trailing={
                <span className="flex items-center gap-2 font-serif text-lg font-medium tabular">
                  <span className={cn("size-2.5 rounded-[2px]", shareColors[i % shareColors.length])} aria-hidden="true" />
                  {t(app.will.beneficiaries.share, { n: b.share })}
                </span>
              }
            />
          </li>
        ))}
      </ul>
      <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
        {will.payout === "bank" ? <BanknoteIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> : <WalletIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
        {will.payout === "bank" ? t(app.will.payout.bank, { bank: will.bankLabel ?? "" }) : app.will.payout.wallets}
      </p>
    </section>
  )
}

/* ------------------------------------------------------------------------ */

export function WillView({ id }: { id: string }) {
  const demo = useDemo()
  const now = useNow(15_000)
  const { app, locale } = useCopy()
  const [revealing, setRevealing] = useState(false)
  const will = demo?.wills.find((w) => w.id === id)

  if (!demo) return null
  if (!will) {
    return (
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-20 text-center">
        <p className="font-serif text-2xl">{app.will.notFound}</p>
        <Button asChild variant="outline" className="mt-6">
          <Link href={href(locale, "/app")}>{app.nav.back}</Link>
        </Button>
      </div>
    )
  }

  const status = displayStatus(will, now)
  const you = will.guardians.find((g) => g.isYou)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <Link href={href(locale, "/app")} className="inline-flex h-10 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground" data-print-hide>
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        {app.nav.back}
      </Link>

      <header className="mt-2 flex flex-col gap-3 border-b pb-6">
        <p className="eyebrow">
          {will.role === "owner"
            ? `${app.will.yourRole}: ${app.will.roleOwner}`
            : `${app.will.ownerLabel}: ${will.owner.name} · ${app.will.yourRole}: ${t(app.will.roleGuardian, { n: you?.weight ?? 1 })}`}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="text-3xl font-medium sm:text-5xl">{will.name}</h1>
          <StatusBadge status={status} className="text-sm" />
        </div>
        <p className="text-muted-foreground">{app.statusHint[status]}</p>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>
            {app.will.contract} <WalletAddress address={will.contract} className="text-foreground" />
          </span>
          <span aria-hidden="true">·</span>
          <span>{t(app.will.createdOn, { date: formatDate(will.deployedAt, locale) })}</span>
        </p>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-8">
          {will.role === "owner" ? <OwnerStatus will={will} now={now} /> : <GuardianActions will={will} now={now} onExecuted={() => setRevealing(true)} />}
          {will.status === "executed" && will.record ? (
            revealing ? (
              <ExecutionSteps
                record={will.record}
                onDone={() => {
                  setRevealing(false)
                  toast.success(app.toasts.executed)
                }}
              />
            ) : (
              <EstateRecordView record={will.record} willName={will.name} ownerName={will.owner.name} bankLabel={will.bankLabel} />
            )
          ) : (
            <WindowPanel will={will} now={now} />
          )}
          <Guardians will={will} />
        </div>
        <div className="flex min-w-0 flex-col gap-8">
          <Assets will={will} />
          <Beneficiaries will={will} />
          <section aria-labelledby="act-title">
            <SectionTitle id="act-title">{app.will.activity.title}</SectionTitle>
            <div className="mt-4">
              <ActivityList items={will.activity} now={now} empty={app.dashboard.emptyActivity} />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

