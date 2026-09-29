import type { Guardian, Will, WillStatus } from "./types"

export const DAY = 24 * 60 * 60 * 1000
export const VETO_COOLDOWN_DAYS = 3

/**
 * The protection-window rule from the testament contract:
 *   wait = max − (max − min) × confirmedWeight / totalWeight
 * With every guardian confirmed the wait is exactly the minimum.
 */
export function waitDays(minDays: number, maxDays: number, confirmedWeight: number, totalWeight: number): number {
  if (totalWeight <= 0) return maxDays
  const ratio = Math.min(1, Math.max(0, confirmedWeight / totalWeight))
  return maxDays - (maxDays - minDays) * ratio
}

/** Guardians who count toward the total: everyone who accepted (declined ones are out). */
export function activeGuardians(guardians: Guardian[]): Guardian[] {
  return guardians.filter((g) => g.state === "accepted" || g.state === "confirmed")
}

export function weights(will: Will): { confirmed: number; total: number } {
  const active = activeGuardians(will.guardians)
  return {
    confirmed: active.filter((g) => g.state === "confirmed").reduce((s, g) => s + g.weight, 0),
    total: active.reduce((s, g) => s + g.weight, 0),
  }
}

export function willWaitDays(will: Will): number {
  const { confirmed, total } = weights(will)
  return waitDays(will.window.minDays, will.window.maxDays, confirmed, total)
}

/** When the will becomes executable, or null if no declaration is running. */
export function executionAt(will: Will): number | null {
  if (!will.declaration) return null
  return will.declaration.firstAt + willWaitDays(will) * DAY
}

export function displayStatus(will: Will, now: number): WillStatus {
  if (will.status === "declared") {
    const at = executionAt(will)
    if (at !== null && now >= at) return "executable"
  }
  return will.status
}

export function inCooldown(will: Will, now: number): boolean {
  return will.cooldownUntil !== null && now < will.cooldownUntil
}
