"use client"

import { useEffect, useState } from "react"

import { demoNow, useDemo } from "./store"

/** The demo clock, refreshed every 30 s and whenever demo state changes (e.g. advancing time). */
export function useNow(intervalMs = 30_000): number {
  const demo = useDemo()
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  // `demo` and `tick` are read so the value refreshes when either changes.
  void tick
  void demo
  return demoNow()
}
