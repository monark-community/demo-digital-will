"use client"

import { HeartPulseIcon } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"

import { cn } from "@/lib/utils"

const HOLD_MS = 1500

/**
 * Signature moment 2: press and hold to prove you're alive. The fill advances
 * like ink while held; letting go early drains it. Works with a pointer or by
 * holding Space/Enter, and the instruction is announced to screen readers.
 */
export function HoldButton({
  label,
  holdingLabel,
  instructions,
  onComplete,
  disabled,
}: {
  label: string
  holdingLabel: string
  instructions: string
  onComplete: () => void
  disabled?: boolean
}) {
  const [holding, setHolding] = useState(false)
  const [progress, setProgress] = useState(0)
  const completeRef = useRef(onComplete)
  const hintId = useId()

  useEffect(() => {
    completeRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (!holding) return
    const started = performance.now()
    let frame = 0
    const loop = () => {
      const p = Math.min(1, (performance.now() - started) / HOLD_MS)
      setProgress(p)
      if (p >= 1) {
        setHolding(false)
        completeRef.current()
        return
      }
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [holding])

  // Drain the fill after a release or a completed hold.
  useEffect(() => {
    if (holding || progress === 0) return
    const id = window.setTimeout(() => setProgress(0), progress >= 1 ? 600 : 0)
    return () => window.clearTimeout(id)
  }, [holding, progress])

  const begin = () => {
    if (!disabled && !holding) setHolding(true)
  }
  const end = () => setHolding(false)

  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        aria-describedby={hintId}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          begin()
        }}
        onPointerUp={end}
        onPointerCancel={end}
        onKeyDown={(e) => {
          if ((e.key === " " || e.key === "Enter") && !e.repeat) {
            e.preventDefault()
            begin()
          }
        }}
        onKeyUp={(e) => {
          if (e.key === " " || e.key === "Enter") end()
        }}
        onBlur={end}
        onContextMenu={(e) => e.preventDefault()}
        className={cn(
          "relative isolate inline-flex h-14 w-full touch-none items-center justify-center gap-2.5 overflow-hidden rounded-md border-2 border-primary bg-card px-6 font-semibold text-primary select-none sm:w-auto sm:min-w-[22rem]",
          "transition-transform duration-150 focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none disabled:opacity-50",
          holding && "scale-[0.985]"
        )}
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 -z-10 bg-primary"
          style={{ width: `${progress * 100}%`, transition: holding ? "none" : "width 300ms ease-out" }}
        />
        <HeartPulseIcon className={cn("size-5", progress > 0.12 && "text-primary-foreground")} aria-hidden="true" />
        <span className={cn(progress > 0.45 && "text-primary-foreground")}>{holding ? holdingLabel : label}</span>
      </button>
      <p id={hintId} className="mt-2 text-xs text-muted-foreground">
        {instructions}
      </p>
    </div>
  )
}
