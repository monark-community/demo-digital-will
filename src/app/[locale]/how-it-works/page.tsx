import { ArrowDownIcon, ArrowRightIcon, CameraIcon, LandmarkIcon, LockIcon, RepeatIcon, SendIcon, ShieldIcon, UserRoundIcon, UsersRoundIcon, HeartHandshakeIcon, ScrollTextIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { WindowCalculator } from "@/components/how/window-calculator"
import { Button } from "@/components/ui/button"
import { href, isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"
import { cn } from "@/lib/utils"

export async function generateMetadata({ params }: PageProps<"/[locale]/how-it-works">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.how
  return pageMetadata(locale, "/how-it-works", m.title, m.description)
}

const roleIcons = [UserRoundIcon, UsersRoundIcon, HeartHandshakeIcon, ScrollTextIcon]
const execIcons = [CameraIcon, RepeatIcon, LockIcon, SendIcon]
const STAGES = ["draft", "inactive", "active", "declared", "executable", "executed"] as const
const stageTone: Record<(typeof STAGES)[number], string> = {
  draft: "border-dashed border-foreground/30 text-muted-foreground",
  inactive: "border-foreground/30",
  active: "border-primary/60 bg-ledger-soft text-primary",
  declared: "border-brass/60 bg-brass-soft text-brass",
  executable: "border-primary bg-primary text-primary-foreground",
  executed: "border-wax/60 bg-wax-soft text-wax",
}

export default async function HowItWorks({ params }: PageProps<"/[locale]/how-it-works">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const d = dict.how
  const w = dict.app.will.window

  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-4 pt-12 pb-12 sm:px-6 sm:pt-20">
        <p className="eyebrow">{d.eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-[2.5rem] leading-[1.05] font-medium sm:text-6xl">{d.title}</h1>
        <p className="mt-5 max-w-2xl font-serif text-xl leading-snug text-muted-foreground italic sm:text-2xl">{d.lead}</p>
      </section>

      {/* Roles */}
      <section aria-labelledby="roles" className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <h2 id="roles" className="sr-only">
          {d.roles.title}
        </h2>
        <div className="grid gap-px overflow-hidden rounded-md border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {d.roles.items.map((r, i) => {
            const Icon = roleIcons[i] ?? UserRoundIcon
            return (
              <div key={r.title} className="bg-card p-5">
                <Icon className="size-6 text-primary" strokeWidth={1.5} aria-hidden="true" />
                <p className="mt-4 font-serif text-xl font-medium">{r.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Lifecycle */}
      <section aria-labelledby="life" className="border-y bg-card/50">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 id="life" className="text-3xl font-medium sm:text-4xl">
            {d.lifecycle.title}
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">{d.lifecycle.lead}</p>
          <figure aria-label={d.lifecycle.label} className="mt-10">
            <ol className="grid gap-6 md:grid-cols-6 md:gap-4">
              {STAGES.map((s, i) => (
                <li key={s} className="relative">
                  <div className={cn("h-full rounded-md border px-3 py-3 md:text-center", stageTone[s])}>
                    <p className="font-semibold">{d.lifecycle.stages[s]}</p>
                    <p className={cn("text-xs", s === "executable" ? "text-primary-foreground/85" : "text-muted-foreground")}>{d.lifecycle.notes[s]}</p>
                  </div>
                  {i < STAGES.length - 1 ? (
                    <>
                      <ArrowDownIcon className="absolute -bottom-5 left-5 size-4 text-muted-foreground md:hidden" aria-hidden="true" />
                      <ArrowRightIcon className="absolute top-1/2 -right-4 hidden size-4 -translate-y-1/2 text-muted-foreground md:block" aria-hidden="true" />
                    </>
                  ) : null}
                </li>
              ))}
            </ol>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <p className="flex items-center gap-3 rounded-md border border-dashed border-primary/60 px-4 py-3 text-sm">
                <ShieldIcon className="size-5 shrink-0 text-primary" aria-hidden="true" />
                <span>
                  <span className="font-semibold">{d.lifecycle.veto}:</span> {d.lifecycle.stages.declared} → {d.lifecycle.stages.active}
                </span>
              </p>
              <p className="flex items-center gap-3 rounded-md border border-dashed border-foreground/30 px-4 py-3 text-sm">
                <LandmarkIcon className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span>
                  <span className="font-semibold">{d.lifecycle.cancel}:</span> {d.lifecycle.stages.inactive}, {d.lifecycle.stages.active}, {d.lifecycle.stages.declared} → {dict.app.status.canceled}
                </span>
              </p>
            </div>
          </figure>
        </div>
      </section>

      {/* Calculator */}
      <section aria-labelledby="calc" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <h2 id="calc" className="text-3xl font-medium sm:text-4xl">
          {d.calculator.title}
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">{d.calculator.lead}</p>
        <div className="mt-8">
          <WindowCalculator
            copy={{
              ...d.calculator,
              stamp: dict.app.will.guardians.stamp,
              ruler: { first: w.first, today: w.today, execution: w.execution, minMark: w.minMark, maxMark: w.maxMark },
              rulerLabel: w.rulerLabel,
              dayN: dict.home.hero.dayN,
            }}
          />
        </div>
      </section>

      {/* Execution */}
      <section aria-labelledby="exec" className="border-y bg-card/50">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 id="exec" className="text-3xl font-medium sm:text-4xl">
            {d.execution.title}
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">{d.execution.lead}</p>
          <ol className="mt-10 grid gap-6 md:grid-cols-4">
            {d.execution.steps.map((s, i) => {
              const Icon = execIcons[i] ?? CameraIcon
              return (
                <li key={s.title} className="relative">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full border-2 border-wax/70 text-wax">
                      <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <span className="font-serif text-sm text-muted-foreground tabular">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <p className="mt-4 font-serif text-xl font-medium">{s.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* Rules */}
      <section aria-labelledby="rules" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <h2 id="rules" className="text-3xl font-medium sm:text-4xl">
          {d.rules.title}
        </h2>
        <dl className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {d.rules.items.map((r, i) => (
            <div key={r.title} className="flex gap-4">
              <span className="font-serif text-3xl leading-none text-muted-foreground/70 tabular" aria-hidden="true">
                {["I", "II", "III", "IV"][i]}
              </span>
              <div>
                <dt className="font-serif text-xl font-medium">{r.title}</dt>
                <dd className="mt-2 text-muted-foreground">{r.body}</dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-medium">{d.cta.title}</h2>
            <p className="mt-2 text-primary-foreground/85">{d.cta.body}</p>
          </div>
          <Button asChild size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
            <Link href={href(locale, "/app")}>
              {d.cta.button}
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
