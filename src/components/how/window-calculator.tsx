"use client"

import { CheckIcon, RotateCcwIcon } from "lucide-react"
import { useId, useState } from "react"

import { Button } from "@/components/ui/button"
import { Stamp } from "@/components/will/stamp"
import { WindowRuler, type RulerLabels } from "@/components/will/window-ruler"
import { t } from "@/i18n/t"
import { waitDays } from "@/lib/demo/window"
import { cn } from "@/lib/utils"

export interface CalculatorCopy {
  min: string
  max: string
  guardians: string
  confirm: string
  weight: string
  formula: string
  result: string
  none: string
  reset: string
  stamp: string
  people: { name: string; role: string; weight: number }[]
  ruler: Omit<RulerLabels, "minMark" | "maxMark"> & { minMark: string; maxMark: string }
  rulerLabel: string
  dayN: string
}

/** Interactive version of the protection-window rule for /how-it-works. */
export function WindowCalculator({ copy }: { copy: CalculatorCopy }) {
  const [min, setMin] = useState(7)
  const [max, setMax] = useState(30)
  const [confirmed, setConfirmed] = useState<boolean[]>(copy.people.map(() => false))
  const id = useId()

  const total = copy.people.reduce((s, p) => s + p.weight, 0)
  const weight = copy.people.reduce((s, p, i) => s + (confirmed[i] ? p.weight : 0), 0)
  const wait = Math.round(waitDays(min, max, weight, total) * 10) / 10
  const any = confirmed.some(Boolean)

  return (
    <div className="grid gap-8 rounded-md border bg-card p-4 sm:p-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-10">
      <div className="flex flex-col gap-5">
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor={`${id}-min`} className="text-sm font-semibold">
              {copy.min}
            </label>
            <output htmlFor={`${id}-min`} className="font-serif text-lg tabular">
              {t(copy.dayN, { n: min })}
            </output>
          </div>
          <input
            id={`${id}-min`}
            type="range"
            min={1}
            max={29}
            value={min}
            onChange={(e) => {
              const v = Number(e.target.value)
              setMin(v)
              if (v >= max) setMax(Math.min(90, v + 1))
            }}
            className="mt-2 w-full accent-[var(--primary)]"
          />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor={`${id}-max`} className="text-sm font-semibold">
              {copy.max}
            </label>
            <output htmlFor={`${id}-max`} className="font-serif text-lg tabular">
              {t(copy.dayN, { n: max })}
            </output>
          </div>
          <input
            id={`${id}-max`}
            type="range"
            min={2}
            max={90}
            value={max}
            onChange={(e) => {
              const v = Number(e.target.value)
              setMax(v)
              if (v <= min) setMin(Math.max(1, v - 1))
            }}
            className="mt-2 w-full accent-[var(--primary)]"
          />
        </div>
        <div>
          <p className="text-sm font-semibold">{copy.guardians}</p>
          <ul className="mt-2 flex flex-col gap-2">
            {copy.people.map((p, i) => (
              <li key={p.name}>
                <button
                  type="button"
                  aria-pressed={confirmed[i]}
                  onClick={() => setConfirmed((c) => c.map((v, j) => (j === i ? !v : v)))}
                  className={cn(
                    "flex h-12 w-full items-center justify-between gap-3 rounded-md border px-3 text-left text-sm transition-colors",
                    confirmed[i] ? "border-wax/60 bg-wax-soft" : "border-foreground/25 hover:border-foreground/50"
                  )}
                >
                  <span>
                    <span className="font-semibold">{p.name}</span> <span className="text-muted-foreground">· {p.role} · {t(copy.weight, { n: p.weight })}</span>
                    <span className="sr-only"> {t(copy.confirm, { name: p.name })}</span>
                  </span>
                  {confirmed[i] ? <Stamp animate>{copy.stamp}</Stamp> : <CheckIcon className="size-4 text-muted-foreground" aria-hidden="true" />}
                </button>
              </li>
            ))}
          </ul>
          {any ? (
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => setConfirmed(copy.people.map(() => false))}>
              <RotateCcwIcon aria-hidden="true" />
              {copy.reset}
            </Button>
          ) : null}
        </div>
      </div>
      <div className="flex min-w-0 flex-col justify-center">
        <WindowRuler
          minDays={min}
          maxDays={max}
          waitDays={any ? wait : max}
          elapsedDays={null}
          labels={{ ...copy.ruler, minMark: t(copy.ruler.minMark, { n: min }), maxMark: t(copy.ruler.maxMark, { n: max }) }}
          ariaLabel={t(copy.rulerLabel, { n: any ? wait : max })}
          executionNote={any ? t(copy.dayN, { n: wait }) : undefined}
          className={any ? "" : "opacity-60"}
        />
        <p className="mt-6 font-serif text-2xl leading-snug" aria-live="polite">
          {any ? t(copy.result, { n: wait }) : copy.none}
        </p>
        <p className="mt-3 font-mono text-xs text-muted-foreground">{copy.formula}</p>
      </div>
    </div>
  )
}
