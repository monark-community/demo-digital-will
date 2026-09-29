"use client"

import { createContext, useContext, useEffect, useRef } from "react"
import { toast } from "sonner"

import { Toaster } from "@/components/ui/sonner"
import type { Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n"
import { t } from "@/i18n/t"
import { guardianAccepts } from "@/lib/demo/ops"
import { demoNow, getDemo, initDemo, useDemo } from "@/lib/demo/store"
import { displayStatus } from "@/lib/demo/window"

import { WalletPrompt } from "./wallet-prompt"

export interface AppCopy {
  locale: Locale
  app: Dictionary["app"]
  seed: Dictionary["seed"]
  common: Pick<Dictionary["common"], "demoBadge" | "finance" | "legal" | "close" | "copy" | "copied" | "you" | "youCap" | "loading">
}

const Ctx = createContext<AppCopy | null>(null)

export function useCopy(): AppCopy {
  const v = useContext(Ctx)
  if (!v) throw new Error("useCopy outside AppProvider")
  return v
}

/**
 * Other people, simulated: after you deploy, each invited guardian accepts
 * on their own a couple of seconds apart. Also announces when a running
 * window elapses while you watch.
 */
function useSimulatedPeople(copy: AppCopy) {
  const demo = useDemo()
  const scheduled = useRef(new Set<string>())
  const executableSeen = useRef<Set<string> | null>(null)

  useEffect(() => {
    if (!demo) return
    for (const will of demo.wills) {
      if (!will.autoAccept) continue
      const pending = will.guardians.filter((g) => g.state === "pending" && !g.isYou)
      pending.forEach((g, i) => {
        const key = `${will.id}:${g.id}`
        if (scheduled.current.has(key)) return
        scheduled.current.add(key)
        window.setTimeout(() => {
          const current = getDemo()?.wills.find((w) => w.id === will.id)
          if (!current || current.guardians.find((x) => x.id === g.id)?.state !== "pending") return
          const activated = guardianAccepts(will.id, g.id)
          toast(t(copy.app.toasts.accepted, { name: g.name, will: will.name }))
          if (activated) toast.success(t(copy.app.toasts.active, { will: will.name }))
        }, 2200 + i * 1900 + Math.random() * 600)
      })
    }
  }, [demo, copy])

  // Announce wills that become executable during the visit (e.g. after advancing the clock).
  useEffect(() => {
    if (!demo) return
    const now = demoNow()
    const executable = new Set(demo.wills.filter((w) => displayStatus(w, now) === "executable").map((w) => w.id))
    if (executableSeen.current) {
      for (const id of executable) {
        if (!executableSeen.current.has(id)) {
          const will = demo.wills.find((w) => w.id === id)
          if (will?.role === "guardian") toast(copy.app.toasts.executable)
        }
      }
    }
    executableSeen.current = executable
  }, [demo, copy])
}

export function AppProvider({ value, children }: { value: AppCopy; children: React.ReactNode }) {
  useEffect(() => {
    initDemo(value.seed)
  }, [value.seed])
  return (
    <Ctx.Provider value={value}>
      <SimulatedPeople />
      {children}
      <WalletPrompt />
      {/* Toasts sit bottom-right on desktop and along the bottom on phones: the actions and their inline
          status live at the top of each page, so toasts never cover what they report on. */}
      <Toaster position="bottom-right" offset={{ bottom: 20, right: 20 }} mobileOffset={{ bottom: 12, left: 12, right: 12 }} closeButton={false} />
    </Ctx.Provider>
  )
}

function SimulatedPeople() {
  const copy = useCopy()
  useSimulatedPeople(copy)
  return null
}
