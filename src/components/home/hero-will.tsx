"use client"

import { useEffect, useState } from "react"

import { SealMark } from "@/components/brand/logo"
import { Stamp } from "@/components/will/stamp"
import { WindowRuler, type RulerLabels } from "@/components/will/window-ruler"
import { t } from "@/i18n/t"
import { waitDays } from "@/lib/demo/window"
import { cn } from "@/lib/utils"

const WEIGHTS = [2, 1, 2]
/** Confirmation order: Nadia first, then Marc, then Julien. */
const ORDER = [1, 0, 2]
const MIN = 7
const MAX = 30
const TOTAL = WEIGHTS.reduce((a, b) => a + b, 0)

export interface HeroWillCopy {
  label: string
  docTitle: string
  docSub: string
  guardians: string
  confirmed: string
  waiting: string
  people: { name: string; role: string }[]
  ruler: RulerLabels
  dayN: string
  weight: string
}

/**
 * Signature moment 1 on the home page: guardians confirm one after another
 * and each stamp slides the execution flag toward the minimum.
 * With reduced motion it shows the final state.
 */
export function HeroWill({ copy }: { copy: HeroWillCopy }) {
  const [step, setStep] = useState(3)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let s = 3
    const id = window.setInterval(() => {
      s = s >= 5 ? 0 : s + 1
      setStep(Math.min(3, s))
    }, 1700)
    return () => window.clearInterval(id)
  }, [])

  const confirmedIdx = ORDER.slice(0, step)
  const confirmedWeight = confirmedIdx.reduce((sum, i) => sum + (WEIGHTS[i] ?? 0), 0)
  const wait = waitDays(MIN, MAX, confirmedWeight, TOTAL)

  return (
    <figure aria-label={copy.label} className="paper relative mx-auto w-full max-w-md rounded-md p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow">{copy.docSub}</p>
          <p className="mt-2 truncate font-serif text-2xl leading-tight">{copy.docTitle}</p>
        </div>
        <SealMark className="size-10 opacity-90" />
      </div>
      <div className="double-rule my-5" aria-hidden="true" />
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{copy.guardians}</p>
      <ul className="mt-2 divide-y divide-dashed" aria-hidden="true">
        {copy.people.map((p, i) => {
          const on = confirmedIdx.includes(i)
          return (
            <li key={p.name} className="flex h-12 items-center justify-between gap-3">
              <span className="min-w-0">
                <span className="font-medium">{p.name}</span>
                <span className="ml-2 text-sm text-muted-foreground">{p.role}</span>
              </span>
              <span className="flex items-center gap-3">
                <span className="text-[0.6875rem] text-muted-foreground">{t(copy.weight, { n: WEIGHTS[i] ?? 1 })}</span>
                {on ? (
                  <Stamp animate>
                    {copy.confirmed}
                  </Stamp>
                ) : (
                  <span className={cn("w-[5.5rem] text-right text-xs text-muted-foreground italic")}>{copy.waiting}</span>
                )}
              </span>
            </li>
          )
        })}
      </ul>
      <WindowRuler
        className="mt-4"
        minDays={MIN}
        maxDays={MAX}
        waitDays={wait}
        elapsedDays={step > 0 ? 3 : null}
        labels={copy.ruler}
        ariaLabel={copy.label}
        executionNote={t(copy.dayN, { n: Math.round(wait * 10) / 10 })}
      />
    </figure>
  )
}
