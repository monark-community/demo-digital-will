"use client"

import { ArrowLeftIcon, BanknoteIcon, InfoIcon, MinusIcon, PlusIcon, SparklesIcon, TriangleAlertIcon, WalletIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useId, useMemo, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { WalletAvatar } from "@/components/ui/wallet"
import { WindowRuler } from "@/components/will/window-ruler"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { useTx } from "@/lib/demo/chain"
import { deployWill } from "@/lib/demo/ops"
import { beneficiaryChoices, EXAMPLE } from "@/lib/demo/seed"
import { useDemo } from "@/lib/demo/store"
import { TOKEN_ORDER, TOKENS, totalUsd } from "@/lib/demo/tokens"
import type { Holding, Payout, Person, TokenSymbol } from "@/lib/demo/types"
import { waitDays } from "@/lib/demo/window"
import { formatNumber, formatUsd } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useCopy } from "./app-provider"
import { useRelation, WeightPips } from "./bits"
import { TxFeedback } from "./tx-feedback"

type ErrorKey = "name" | "guardians" | "window" | "beneficiaries" | "shares" | "assets" | "balance"

function Chip({ person, pressed, onClick, label }: { person: Person; pressed: boolean; onClick: () => void; label: string }) {
  const rel = useRelation()
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-md border pr-3 pl-1.5 text-sm transition-colors pointer-coarse:h-11",
        pressed ? "border-primary bg-ledger-soft text-primary" : "border-foreground/25 hover:border-foreground/60"
      )}
    >
      <WalletAvatar address={person.address} size={24} />
      <span className="font-medium">{person.name}</span>
      <span className="text-xs text-muted-foreground">{rel(person.relation)}</span>
      {pressed ? <XIcon className="size-3.5" aria-hidden="true" /> : <PlusIcon className="size-3.5" aria-hidden="true" />}
    </button>
  )
}

/** A form section whose explanation stays behind an info toggle until asked for. */
function Fieldset({ title, hint, children, error, id }: { title: string; hint?: string; children: React.ReactNode; error?: string | null; id: string }) {
  const [open, setOpen] = useState(false)
  const hintLabel = t(useCopy().app.composer.hintLabel, { title })
  return (
    <fieldset className="border-t border-foreground/15 pt-6">
      <legend className="float-left flex w-full items-center gap-2 font-serif text-xl font-medium sm:text-2xl">
        {title}
        {hint ? (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={`${id}-hint`}
            aria-label={hintLabel}
            onClick={() => setOpen((o) => !o)}
            className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <InfoIcon className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </legend>
      <div className="clear-both" />
      {hint && open ? (
        <p id={`${id}-hint`} className="pt-1 text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
      <div className="mt-4">{children}</div>
      {error ? (
        <p className="mt-3 flex items-start gap-1.5 text-sm font-medium text-destructive">
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}

export function Composer() {
  const demo = useDemo()
  const router = useRouter()
  const { app, seed, locale } = useCopy()
  const c = app.composer
  const tx = useTx()
  const uid = useId()

  const [name, setName] = useState("")
  const [guardians, setGuardians] = useState<{ id: string; weight: number }[]>([])
  const [minDays, setMinDays] = useState("7")
  const [maxDays, setMaxDays] = useState("30")
  const [bens, setBens] = useState<{ id: string; share: string }[]>([])
  const [amounts, setAmounts] = useState<Partial<Record<TokenSymbol, string>>>({})
  const [payout, setPayout] = useState<Payout>("wallets")
  const [errors, setErrors] = useState<ErrorKey[] | null>(null)
  const [balanceSymbol, setBalanceSymbol] = useState<TokenSymbol | null>(null)

  const people = useMemo(() => beneficiaryChoices(seed), [seed])
  if (!demo) return null
  const contacts = demo.contacts

  const min = Number(minDays)
  const max = Number(maxDays)
  const windowOk = Number.isFinite(min) && Number.isFinite(max) && min >= 1 && max <= 365 && min < max
  const shareTotal = bens.reduce((s, b) => s + (Number(b.share) || 0), 0)
  const holdings: Holding[] = TOKEN_ORDER.map((symbol) => ({ symbol, amount: Number(amounts[symbol] ?? 0) || 0 })).filter((h) => h.amount > 0)
  const value = totalUsd(holdings)
  const balanceOf = (s: TokenSymbol) => demo.balances.find((b) => b.symbol === s)?.amount ?? 0

  const validate = (): ErrorKey[] => {
    const e: ErrorKey[] = []
    if (!name.trim()) e.push("name")
    if (guardians.length < 2) e.push("guardians")
    if (!windowOk) e.push("window")
    if (bens.length === 0) e.push("beneficiaries")
    else if (shareTotal !== 100) e.push("shares")
    if (holdings.length === 0) e.push("assets")
    const over = holdings.find((h) => h.amount > balanceOf(h.symbol) + 1e-9)
    if (over) {
      e.push("balance")
      setBalanceSymbol(over.symbol)
    }
    return e
  }

  const errorText = (k: ErrorKey) =>
    k === "shares" ? t(c.errors.shares, { n: shareTotal }) : k === "balance" ? t(c.errors.balance, { symbol: balanceSymbol ?? "" }) : c.errors[k]
  const has = (k: ErrorKey) => errors?.includes(k) ?? false

  const fillExample = () => {
    setName(seed.exampleName)
    setGuardians(EXAMPLE.guardians)
    setMinDays(String(EXAMPLE.window.minDays))
    setMaxDays(String(EXAMPLE.window.maxDays))
    setBens(EXAMPLE.beneficiaries.map((b) => ({ id: b.id, share: String(b.share) })))
    setAmounts(Object.fromEntries(Object.entries(EXAMPLE.holdings).map(([k, v]) => [k, String(v)])))
    setErrors(null)
  }

  const deploy = () => {
    const e = validate()
    setErrors(e.length ? e : null)
    if (e.length) {
      document.getElementById(`${uid}-errors`)?.focus()
      return
    }
    const draft = {
      name,
      guardians,
      window: { minDays: min, maxDays: max },
      beneficiaries: bens.flatMap((b) => {
        const person = people.find((p) => p.id === b.id)
        return person ? [{ person, share: Number(b.share) }] : []
      }),
      holdings,
      payout,
    }
    void tx.run(
      {
        kind: "tx",
        title: t(app.prompt.titles.deploy, { name: name.trim() }),
        movesValue: true,
        legal: true,
        lines: [
          { label: app.prompt.lines.guardians, value: guardians.map((g) => contacts.find((x) => x.id === g.id)?.name ?? "").join(", ") },
          { label: app.prompt.lines.window, value: t(c.window.range, { min, max }) },
          { label: app.prompt.lines.funds, value: holdings.map((h) => `${formatNumber(h.amount, locale)} ${h.symbol}`).join(" · ") },
        ],
      },
      (hash) => {
        const id = deployWill(draft, hash)
        toast.success(c.deployed)
        router.push(href(locale, `/app/will/${id}`))
      }
    )
  }

  const toggleGuardian = (id: string) =>
    setGuardians((gs) => (gs.some((g) => g.id === id) ? gs.filter((g) => g.id !== id) : [...gs, { id, weight: 1 }]))
  const setWeight = (id: string, delta: number) =>
    setGuardians((gs) => gs.map((g) => (g.id === id ? { ...g, weight: Math.min(3, Math.max(1, g.weight + delta)) } : g)))
  const toggleBen = (id: string) => setBens((bs) => (bs.some((b) => b.id === id) ? bs.filter((b) => b.id !== id) : [...bs, { id, share: "" }]))
  const splitEvenly = () =>
    setBens((bs) => {
      if (bs.length === 0) return bs
      const base = Math.floor(100 / bs.length)
      return bs.map((b, i) => ({ ...b, share: String(i === 0 ? 100 - base * (bs.length - 1) : base) }))
    })

  const totalWeight = guardians.reduce((s, g) => s + g.weight, 0)
  // Wait if only the lightest guardian confirms (the longest realistic wait after a declaration).
  const lightest = guardians.length ? Math.min(...guardians.map((g) => g.weight)) : 0
  const oneConfirmation = Math.round(waitDays(min, max, lightest, totalWeight || 1) * 10) / 10

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <Link href={href(locale, "/app")} className="inline-flex h-10 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        {app.nav.back}
      </Link>
      <div className="mt-2 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-medium sm:text-5xl">{c.title}</h1>
        </div>
        <Button variant="outline" onClick={fillExample} className="self-start sm:self-auto">
          <SparklesIcon aria-hidden="true" />
          {c.example}
        </Button>
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          deploy()
        }}
        className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]"
      >
        <div className="flex min-w-0 flex-col gap-8">
          {errors ? (
            <div id={`${uid}-errors`} tabIndex={-1} role="alert" className="rounded-md border border-destructive/50 bg-destructive/[0.06] p-4 outline-none">
              <p className="font-semibold text-destructive">{c.errors.title}</p>
              <ul className="mt-2 list-disc pl-5 text-sm text-destructive">
                {errors.map((k) => (
                  <li key={k}>{errorText(k)}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <Label htmlFor={`${uid}-name`} className="font-serif text-xl font-medium sm:text-2xl">
              {c.name}
            </Label>
            <Input
              id={`${uid}-name`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={c.namePlaceholder}
              aria-invalid={has("name") || undefined}
              maxLength={60}
              className="mt-3 h-11 max-w-md text-base"
            />
          </div>

          <Fieldset id={`${uid}-g`} title={c.guardians.title} hint={c.guardians.hint} error={has("guardians") ? c.errors.guardians : null}>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{c.guardians.contacts}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {contacts.map((p) => {
                const on = guardians.some((g) => g.id === p.id)
                return <Chip key={p.id} person={p} pressed={on} onClick={() => toggleGuardian(p.id)} label={t(on ? c.guardians.remove : c.guardians.add, { name: p.name })} />
              })}
            </div>
            {guardians.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground italic">{c.guardians.empty}</p>
            ) : (
              <ul className="mt-4 divide-y rounded-md border bg-card">
                {guardians.map((g) => {
                  const p = contacts.find((x) => x.id === g.id)
                  if (!p) return null
                  return (
                    <li key={g.id} className="flex items-center gap-3 px-3 py-2.5">
                      <WalletAvatar address={p.address} size={28} />
                      <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
                      <WeightPips weight={g.weight} label={t(app.will.guardians.weight, { n: g.weight })} />
                      <div className="flex items-center">
                        <Button type="button" variant="ghost" size="icon-sm" aria-label={t(c.guardians.weightLess, { name: p.name })} disabled={g.weight <= 1} onClick={() => setWeight(g.id, -1)}>
                          <MinusIcon aria-hidden="true" />
                        </Button>
                        <output aria-label={t(c.guardians.weight, { name: p.name })} className="w-5 text-center font-semibold tabular">
                          {g.weight}
                        </output>
                        <Button type="button" variant="ghost" size="icon-sm" aria-label={t(c.guardians.weightMore, { name: p.name })} disabled={g.weight >= 3} onClick={() => setWeight(g.id, 1)}>
                          <PlusIcon aria-hidden="true" />
                        </Button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Fieldset>

          <Fieldset id={`${uid}-w`} title={c.window.title} hint={c.window.hint} error={has("window") ? c.errors.window : null}>
            <div className="flex flex-wrap gap-4">
              <div>
                <Label htmlFor={`${uid}-min`}>{c.window.min}</Label>
                <Input id={`${uid}-min`} type="number" inputMode="numeric" min={1} max={364} value={minDays} onChange={(e) => setMinDays(e.target.value)} aria-invalid={has("window") || undefined} className="mt-1.5 h-11 w-32 text-base" />
              </div>
              <div>
                <Label htmlFor={`${uid}-max`}>{c.window.max}</Label>
                <Input id={`${uid}-max`} type="number" inputMode="numeric" min={2} max={365} value={maxDays} onChange={(e) => setMaxDays(e.target.value)} aria-invalid={has("window") || undefined} className="mt-1.5 h-11 w-32 text-base" />
              </div>
            </div>
            {windowOk ? (
              <div className="mt-5 rounded-md border bg-card p-4">
                <WindowRuler
                  minDays={min}
                  maxDays={max}
                  waitDays={waitDays(min, max, totalWeight > 0 ? totalWeight : 0, totalWeight)}
                  elapsedDays={null}
                  labels={{
                    first: app.will.window.first,
                    today: app.will.window.today,
                    execution: app.will.window.execution,
                    minMark: t(app.will.window.minMark, { n: min }),
                    maxMark: t(app.will.window.maxMark, { n: max }),
                  }}
                  ariaLabel={t(app.will.window.rulerLabel, { n: min })}
                />
                <p className="mt-2 text-sm text-muted-foreground">{t(c.window.preview, { min, max: oneConfirmation })}</p>
              </div>
            ) : null}
          </Fieldset>

          <Fieldset id={`${uid}-b`} title={c.beneficiaries.title} hint={c.beneficiaries.hint} error={has("beneficiaries") ? c.errors.beneficiaries : has("shares") ? t(c.errors.shares, { n: shareTotal }) : null}>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{c.beneficiaries.people}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {people.map((p) => {
                const on = bens.some((b) => b.id === p.id)
                return <Chip key={p.id} person={p} pressed={on} onClick={() => toggleBen(p.id)} label={t(on ? c.beneficiaries.remove : c.beneficiaries.add, { name: p.name })} />
              })}
            </div>
            {bens.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground italic">{c.beneficiaries.empty}</p>
            ) : (
              <>
                <ul className="mt-4 divide-y rounded-md border bg-card">
                  {bens.map((b) => {
                    const p = people.find((x) => x.id === b.id)
                    if (!p) return null
                    const inputId = `${uid}-share-${b.id}`
                    return (
                      <li key={b.id} className="flex items-center gap-3 px-3 py-2">
                        <WalletAvatar address={p.address} size={28} />
                        <label htmlFor={inputId} className="min-w-0 flex-1 truncate font-medium">
                          {p.name}
                          <span className="sr-only"> {t(c.beneficiaries.share, { name: p.name })}</span>
                        </label>
                        <div className="flex items-center gap-1.5">
                          <Input
                            id={inputId}
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={100}
                            value={b.share}
                            onChange={(e) => setBens((bs) => bs.map((x) => (x.id === b.id ? { ...x, share: e.target.value } : x)))}
                            aria-invalid={has("shares") || undefined}
                            className="h-10 w-20 text-right text-base"
                          />
                          <span className="text-muted-foreground">%</span>
                        </div>
                      </li>
                    )
                  })}
                </ul>
                <div className="mt-2 flex items-center justify-between">
                  <Button type="button" variant="link" onClick={splitEvenly}>
                    {c.beneficiaries.even}
                  </Button>
                  <span className={cn("text-sm font-semibold tabular", shareTotal === 100 ? "text-primary" : "text-brass")} aria-live="polite">
                    {t(c.beneficiaries.total, { n: shareTotal })}
                  </span>
                </div>
              </>
            )}
          </Fieldset>

          <Fieldset id={`${uid}-a`} title={c.assets.title} hint={c.assets.hint} error={has("assets") ? c.errors.assets : has("balance") ? errorText("balance") : null}>
            <ul className="divide-y rounded-md border bg-card">
              {TOKEN_ORDER.map((symbol) => {
                const bal = balanceOf(symbol)
                const inputId = `${uid}-amt-${symbol}`
                const over = (Number(amounts[symbol]) || 0) > bal + 1e-9
                return (
                  <li key={symbol} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5">
                    <label htmlFor={inputId} className="w-16 font-semibold">
                      {symbol}
                      <span className="sr-only"> {t(c.assets.amountFor, { symbol })}</span>
                    </label>
                    <span className="order-3 w-full text-xs text-muted-foreground sm:order-none sm:w-auto sm:flex-1">
                      {t(c.assets.balance, { amount: `${formatNumber(bal, locale, TOKENS[symbol].digits)} ${symbol}` })}
                    </span>
                    <div className="ml-auto flex items-center gap-1.5">
                      <Input
                        id={inputId}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step={TOKENS[symbol].step}
                        placeholder="0"
                        value={amounts[symbol] ?? ""}
                        onChange={(e) => setAmounts((a) => ({ ...a, [symbol]: e.target.value }))}
                        aria-invalid={over || undefined}
                        className="h-10 w-32 text-right text-base"
                      />
                      <Button type="button" variant="ghost" size="sm" onClick={() => setAmounts((a) => ({ ...a, [symbol]: String(bal) }))}>
                        {c.assets.max}
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
            <p className="mt-2 text-right text-sm font-semibold tabular">{t(c.assets.total, { value: formatUsd(value, locale) })}</p>
          </Fieldset>

          <Fieldset id={`${uid}-p`} title={c.payout.title}>
            <div role="radiogroup" aria-label={c.payout.title} className="grid gap-3 sm:grid-cols-2">
              {(["wallets", "bank"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={payout === p}
                  onClick={() => setPayout(p)}
                  className={cn(
                    "flex items-start gap-3 rounded-md border p-4 text-left transition-colors",
                    payout === p ? "border-primary bg-ledger-soft ring-1 ring-primary" : "border-foreground/25 hover:border-foreground/50"
                  )}
                >
                  {p === "wallets" ? <WalletIcon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" /> : <BanknoteIcon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />}
                  <span>
                    <span className="block font-semibold">{p === "wallets" ? c.payout.wallets : c.payout.bank}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">{p === "wallets" ? c.payout.walletsHint : c.payout.bankHint}</span>
                  </span>
                </button>
              ))}
            </div>
          </Fieldset>
        </div>

        {/* Draft summary: a paper preview of the will, with the deploy action. */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="paper rounded-md p-5">
            <p className="eyebrow">{c.title}</p>
            <p className={cn("mt-2 font-serif text-2xl leading-tight", !name.trim() && "text-muted-foreground italic")}>{name.trim() || c.namePlaceholder}</p>
            <dl className="mt-4 divide-y border-y text-sm">
              <div className="flex justify-between gap-3 py-2">
                <dt className="text-muted-foreground">{app.will.guardians.title}</dt>
                <dd className="font-medium">{guardians.length}</dd>
              </div>
              <div className="flex justify-between gap-3 py-2">
                <dt className="text-muted-foreground">{c.window.title}</dt>
                <dd className="font-medium">{windowOk ? t(c.window.range, { min, max }) : "—"}</dd>
              </div>
              <div className="flex justify-between gap-3 py-2">
                <dt className="text-muted-foreground">{app.will.beneficiaries.title}</dt>
                <dd className="font-medium">{bens.length}</dd>
              </div>
              <div className="flex justify-between gap-3 py-2">
                <dt className="text-muted-foreground">{app.will.assets.title}</dt>
                <dd className="font-medium tabular">{formatUsd(value, locale)}</dd>
              </div>
            </dl>
            <Button type="submit" size="lg" className="mt-5 w-full" disabled={tx.busy}>
              {tx.busy ? c.deploying : c.review}
            </Button>
            <TxFeedback className="mt-3" state={tx.state} onRetry={deploy} onDismiss={tx.reset} />
          </div>
        </aside>
      </form>
    </div>
  )
}
