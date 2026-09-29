import { cn } from "@/lib/utils"

import { SEAL_PATH } from "@/components/brand/seal-path"

/** A rubber-stamp label pressed onto the page when a guardian confirms. */
export function Stamp({ children, animate = false, tone = "wax", className }: { children: React.ReactNode; animate?: boolean; tone?: "wax" | "ink"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block -rotate-[8deg] rounded-[3px] border-2 px-1.5 py-px font-sans text-[0.625rem] leading-tight font-bold tracking-[0.12em] whitespace-nowrap uppercase",
        tone === "wax" ? "border-wax/80 text-wax" : "border-foreground/60 text-foreground",
        animate && "animate-stamp",
        className
      )}
    >
      {children}
    </span>
  )
}

/** Signature moment 3: the wax seal on an executed estate record. */
export function WaxSeal({ label, date, className }: { label: string; date: string; className?: string }) {
  return (
    <div className={cn("relative grid size-28 shrink-0 place-items-center", className)}>
      <svg viewBox="0 0 32 32" className="absolute inset-0 size-full" aria-hidden="true">
        <path d={SEAL_PATH} fill="var(--wax)" />
        <circle cx="16" cy="16" r="11.4" fill="none" stroke="var(--background)" strokeOpacity="0.6" strokeWidth="0.35" />
        <circle cx="16" cy="16" r="10.6" fill="none" stroke="var(--background)" strokeOpacity="0.35" strokeWidth="0.2" />
      </svg>
      <div className="relative flex flex-col items-center text-center text-background">
        <span className="font-serif text-base leading-none font-semibold italic">{label}</span>
        <span className="mt-1 text-[0.625rem] font-semibold tracking-wider uppercase tabular">{date}</span>
      </div>
    </div>
  )
}
