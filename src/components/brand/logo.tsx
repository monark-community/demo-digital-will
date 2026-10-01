import { cn } from "@/lib/utils"

import { SEAL_PATH, W_PATH } from "./seal-path"

/** The WillChain seal: scalloped wax edge, inner ring and a W. Follows the theme via CSS variables. */
export function SealMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8 shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path d={SEAL_PATH} fill="var(--primary)" />
      <circle cx="16" cy="16" r="10.6" fill="none" stroke="var(--primary-foreground)" strokeOpacity="0.55" strokeWidth="0.8" />
      <path d={W_PATH} fill="none" stroke="var(--primary-foreground)" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <SealMark className="size-8" />
      <span className="font-serif text-[1.375rem] leading-none font-semibold tracking-[-0.01em]">WillChain</span>
    </span>
  )
}
