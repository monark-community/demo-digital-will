"use client"

import { CheckIcon, Loader2Icon, PrinterIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { TokenAmount } from "@/components/ui/token-amount"
import { WaxSeal } from "@/components/will/stamp"
import { intlLocale } from "@/i18n/config"
import { t } from "@/i18n/t"
import { toUnits } from "@/lib/demo/tokens"
import type { EstateRecord } from "@/lib/demo/types"
import { formatDateTime, formatNumber, formatUsd, shortAddress } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useCopy } from "./app-provider"

type StepKey = "snapshot" | "swap" | "lock" | "release" | "compliance" | "transfer"
const WALLET_STEPS: StepKey[] = ["snapshot", "swap", "lock", "release"]
const BANK_STEPS: StepKey[] = ["snapshot", "swap", "lock", "compliance", "transfer"]

/** The execution sequence, revealed step by step right after the transaction confirms. */
export function ExecutionSteps({ record, onDone }: { record: EstateRecord; onDone: () => void }) {
  const { app } = useCopy()
  const steps: StepKey[] = record.payout === "bank" ? BANK_STEPS : WALLET_STEPS
  const [done, setDone] = useState(0)

  useEffect(() => {
    if (done >= steps.length) {
      const id = window.setTimeout(onDone, 500)
      return () => window.clearTimeout(id)
    }
    const delay = steps[done] === "compliance" ? 1600 : steps[done] === "swap" ? 1200 : 850
    const id = window.setTimeout(() => setDone((n) => n + 1), delay)
    return () => window.clearTimeout(id)
  }, [done, steps.length, onDone, steps])

  return (
    <div className="rounded-md border bg-card p-4 sm:p-5" aria-live="polite">
      <h3 className="font-sans text-sm font-semibold">{app.will.execution.title}</h3>
      <ol className="mt-3 flex flex-col gap-2.5">
        {steps.map((s, i) => {
          const state = i < done ? "done" : i === done ? "active" : "todo"
          return (
            <li key={s} className={cn("flex items-center gap-3 text-sm", state === "todo" && "text-muted-foreground")}>
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full border",
                  state === "done" && "border-primary bg-primary text-primary-foreground",
                  state === "active" && "border-brass text-brass"
                )}
                aria-hidden="true"
              >
                {state === "done" ? <CheckIcon className="size-3.5" /> : state === "active" ? <Loader2Icon className="size-3.5 animate-spin" /> : <span className="text-[0.625rem]">{i + 1}</span>}
              </span>
              <span className={cn(state === "active" && "font-medium")}>{app.will.execution.steps[s]}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/** The printable estate record, sealed with wax. */
export function EstateRecordView({ record, willName, ownerName, bankLabel }: { record: EstateRecord; willName: string; ownerName: string; bankLabel?: string }) {
  const { app, locale } = useCopy()
  const r = app.will.record
  const lockedUnits = toUnits(record.total)

  return (
    <article className="paper animate-rise rounded-md p-5 sm:p-8" aria-labelledby="record-title">
      <header className="flex flex-col-reverse gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">{r.sub}</p>
          <h2 id="record-title" className="mt-2 text-2xl font-medium sm:text-3xl">
            {r.title}
          </h2>
          <p className="mt-1 font-serif text-lg text-muted-foreground italic">
            {willName} · {ownerName}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {t(r.executedAt, { date: formatDateTime(record.executedAt, locale) })}
            <br />
            {t(r.block, { block: new Intl.NumberFormat(intlLocale[locale]).format(record.block) })}
          </p>
        </div>
        <WaxSeal label={r.sealed} date={new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: "medium" }).format(record.executedAt)} className="self-start" />
      </header>

      <div className="double-rule my-6" aria-hidden="true" />

      <section aria-labelledby="rec-conv">
        <h3 id="rec-conv" className="font-sans text-sm font-semibold tracking-wide uppercase">
          {r.snapshot} → {r.conversions}
        </h3>
        <div className="mt-3 hidden grid-cols-[1fr_1fr_1fr_1fr] gap-3 border-b pb-2 text-xs text-muted-foreground sm:grid">
          <span>{r.asset}</span>
          <span className="text-right">{r.amount}</span>
          <span className="text-right">{r.price}</span>
          <span className="text-right">{r.received}</span>
        </div>
        <ul className="divide-y">
          {record.swaps.map((s) => {
            const u = toUnits(s.amount)
            return (
              <li key={s.symbol} className="grid grid-cols-2 gap-x-3 gap-y-1 py-2.5 text-sm sm:grid-cols-[1fr_1fr_1fr_1fr] sm:items-center">
                <span className="font-semibold">{s.symbol}</span>
                <span className="text-right sm:order-none">
                  <TokenAmount value={u.value} decimals={u.decimals} fractionDigits={5} locale={intlLocale[locale]} />
                </span>
                <span className="text-xs text-muted-foreground sm:text-right sm:text-sm">{formatUsd(s.price, locale)}</span>
                <span className="text-right font-medium tabular">{formatNumber(s.received, locale, 2)} tUSDC</span>
              </li>
            )
          })}
        </ul>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2 border-t border-foreground/40 pt-3">
          <span className="font-serif text-lg">{r.locked}</span>
          <span className="font-serif text-2xl font-medium">
            <TokenAmount value={lockedUnits.value} decimals={lockedUnits.decimals} fractionDigits={2} symbol="tUSDC" locale={intlLocale[locale]} />
          </span>
        </div>
        <p className="mt-1 text-right font-mono text-xs text-muted-foreground">{shortAddress(record.lockHash, 10, 6)}</p>
      </section>

      <section aria-labelledby="rec-rel" className="mt-6">
        <h3 id="rec-rel" className="font-sans text-sm font-semibold tracking-wide uppercase">
          {r.releases}
        </h3>
        {record.payout === "bank" ? (
          <div className="mt-3 rounded-sm border border-dashed p-3 text-sm">
            <p>{t(app.will.payout.bank, { bank: bankLabel ?? "" })}</p>
            <p className="mt-1 text-muted-foreground">
              {r.bankRef}: <span className="font-mono">{record.bankReference}</span>
            </p>
          </div>
        ) : null}
        <ul className="mt-2 divide-y">
          {record.releases.map((x) => (
            <li key={x.address} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5 text-sm">
              <span className="min-w-0">
                <span className="font-medium">{x.name}</span>
                <span className="ml-2 text-muted-foreground">{t(app.will.beneficiaries.share, { n: x.share })}</span>
                {x.hash ? <span className="block font-mono text-xs text-muted-foreground">{shortAddress(x.hash, 10, 6)}</span> : null}
              </span>
              <span className="font-medium tabular">{formatNumber(x.amount, locale, 2)} tUSDC</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6 flex justify-end" data-print-hide>
        <Button variant="outline" onClick={() => window.print()}>
          <PrinterIcon aria-hidden="true" />
          {r.print}
        </Button>
      </div>
    </article>
  )
}
