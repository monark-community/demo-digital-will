"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { locales, switchLocalePath, type Locale } from "@/i18n/config"
import { cn } from "@/lib/utils"

/** Compact EN/FR switch that keeps the current page. */
export function LocaleSwitch({ locale, label, names }: { locale: Locale; label: string; names: Record<Locale, string> }) {
  const pathname = usePathname() ?? `/${locale}`
  return (
    <nav aria-label={label} className="flex items-center rounded-md border border-border p-0.5 text-xs font-semibold">
      {locales.map((l) => (
        <Link
          key={l}
          href={switchLocalePath(pathname, l)}
          hrefLang={l}
          lang={l}
          aria-current={l === locale ? "true" : undefined}
          aria-label={names[l]}
          className={cn(
            "grid h-7 min-w-8 place-items-center rounded-[3px] px-1.5 uppercase transition-colors pointer-coarse:h-9 pointer-coarse:min-w-10",
            l === locale ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {l}
        </Link>
      ))}
    </nav>
  )
}
