import { intlLocale, type Locale } from "@/i18n/config"

export function formatUsd(value: number, locale: Locale, digits = 2): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency: "USD",
    currencyDisplay: "symbol",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}

export function formatNumber(value: number, locale: Locale, maxDigits = 4): string {
  return new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: maxDigits }).format(value)
}

export function formatDate(ts: number, locale: Locale, withYear = true): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    day: "numeric",
    month: "long",
    ...(withYear ? { year: "numeric" } : {}),
  }).format(ts)
}

export function formatDateTime(ts: number, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(ts)
}

/** "in 3 days", "2 hours ago", localised. */
export function formatRelative(ts: number, now: number, locale: Locale): string {
  const rtf = new Intl.RelativeTimeFormat(intlLocale[locale], { numeric: "auto" })
  const diff = ts - now
  const abs = Math.abs(diff)
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  if (abs < minute) return rtf.format(0, "second")
  if (abs < hour) return rtf.format(Math.round(diff / minute), "minute")
  if (abs < day) return rtf.format(Math.round(diff / hour), "hour")
  if (abs < 60 * day) return rtf.format(Math.round(diff / day), "day")
  if (abs < 365 * day) return rtf.format(Math.round(diff / (30 * day)), "month")
  return rtf.format(Math.round(diff / (365 * day)), "year")
}

/** "3 d 4 h" style remaining time, localised units. */
export function formatDuration(ms: number, locale: Locale): string {
  const totalHours = Math.max(0, Math.round(ms / 3_600_000))
  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24
  const nf = (n: number, unit: "day" | "hour") =>
    new Intl.NumberFormat(intlLocale[locale], { style: "unit", unit, unitDisplay: "long" }).format(n)
  if (days === 0) return nf(hours, "hour")
  if (hours === 0) return nf(days, "day")
  return `${nf(days, "day")} ${nf(hours, "hour")}`
}

export function shortAddress(address: string, start = 6, end = 4): string {
  if (address.length <= start + end + 1) return address
  return `${address.slice(0, start)}…${address.slice(-end)}`
}
