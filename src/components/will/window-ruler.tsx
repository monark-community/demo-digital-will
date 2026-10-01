import { cn } from "@/lib/utils"

export interface RulerLabels {
  first: string
  today: string
  execution: string
  minMark: string
  maxMark: string
}

/** Keep a flag label inside the ruler: anchor left near the start, right near the end. */
function anchor(pct: number): string {
  if (pct < 14) return "translate-x-0"
  if (pct > 86) return "-translate-x-full"
  return "-translate-x-1/2"
}

/**
 * Signature moment 1: the shrinking protection window.
 * A ruler from the first confirmation (0) to the maximum wait. The hatched
 * zone is the minimum nobody can skip; the ledger-green flag is when the
 * estate becomes executable and slides left as guardians confirm; the ink
 * line is today. Pure presentation, so the hero, the calculator and the
 * will page share it.
 */
export function WindowRuler({
  minDays,
  maxDays,
  waitDays,
  elapsedDays,
  labels,
  ariaLabel,
  executionNote,
  className,
}: {
  minDays: number
  maxDays: number
  waitDays: number
  /** Days since the first confirmation, or null when nothing is running. */
  elapsedDays: number | null
  labels: RulerLabels
  ariaLabel: string
  executionNote?: string
  className?: string
}) {
  const pct = (d: number) => Math.min(100, Math.max(0, (d / maxDays) * 100))
  const minPct = pct(minDays)
  const waitPct = pct(waitDays)
  const todayPct = elapsedDays === null ? null : pct(elapsedDays)
  const reached = elapsedDays !== null && elapsedDays >= waitDays

  return (
    <div role="img" aria-label={ariaLabel} className={cn("relative select-none", className)}>
      {/* Execution flag, above the track */}
      <div className="relative h-11">
        <div
          className="absolute bottom-0 w-0 transition-[left] duration-700 ease-(--ease-quill)"
          style={{ left: `${waitPct}%` }}
        >
          <div className={cn("flex w-max flex-col whitespace-nowrap", anchor(waitPct), waitPct < 14 ? "items-start" : waitPct > 86 ? "items-end" : "items-center")}>
            <span
              className={cn(
                "rounded-sm px-1.5 py-0.5 text-[0.6875rem] font-semibold tracking-wide uppercase",
                reached ? "bg-primary text-primary-foreground" : "bg-ledger-soft text-primary"
              )}
            >
              {labels.execution}
            </span>
            {executionNote ? <span className="mt-0.5 text-xs font-medium text-foreground tabular">{executionNote}</span> : null}
          </div>
        </div>
      </div>

      {/* Track */}
      <div className="relative mt-1.5 h-3 rounded-[2px] border border-foreground/25 bg-card">
        {/* Minimum nobody can skip */}
        <div
          className="absolute inset-y-0 left-0 border-r border-foreground/30"
          style={{
            width: `${minPct}%`,
            backgroundImage: "repeating-linear-gradient(135deg, var(--border) 0 2px, transparent 2px 6px)",
          }}
        />
        {/* Time already elapsed since the first confirmation */}
        {todayPct !== null ? (
          <div className="absolute inset-y-0 left-0 bg-brass/35 transition-[width] duration-700 ease-(--ease-quill)" style={{ width: `${todayPct}%` }} />
        ) : null}
        {/* Execution line */}
        <div
          className={cn("absolute -top-2 -bottom-2 w-[3px] -translate-x-1/2 rounded-full transition-[left] duration-700 ease-(--ease-quill)", reached ? "bg-primary" : "bg-primary/80")}
          style={{ left: `${waitPct}%` }}
        />
        {/* Today line */}
        {todayPct !== null ? (
          <div className="absolute -top-1 -bottom-1 w-px -translate-x-1/2 bg-foreground transition-[left] duration-700" style={{ left: `${todayPct}%` }} />
        ) : null}
      </div>

      {/* Today flag, below */}
      <div className="relative h-6">
        {todayPct !== null ? (
          <div className="absolute top-1.5 w-0 transition-[left] duration-700" style={{ left: `${todayPct}%` }}>
            <span className={cn("block w-max text-xs font-semibold whitespace-nowrap", anchor(todayPct))}>▲ {labels.today}</span>
          </div>
        ) : null}
      </div>

      {/* Scale */}
      <div className="relative mt-1 h-5 border-t border-dashed border-border text-[0.6875rem] text-muted-foreground">
        <span className="absolute top-1 left-0">{labels.first}</span>
        <span
          className={cn("absolute top-1 whitespace-nowrap", minPct < 12 || minPct > 80 ? "hidden" : "")}
          style={{ left: `${minPct}%`, transform: "translateX(-50%)" }}
        >
          {labels.minMark}
        </span>
        <span className="absolute top-1 right-0">{labels.maxMark}</span>
      </div>
    </div>
  )
}
