import Link from "next/link"

import { Wordmark } from "@/components/brand/logo"
import { href, MONARK_URL, PROJECT_DOC_URL, REPO_URL, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n"

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const links = [
    { href: href(locale, "/how-it-works"), label: dict.nav.how, external: false },
    { href: href(locale, "/app"), label: dict.nav.demoShort, external: false },
    { href: href(locale, "/credits"), label: dict.nav.credits, external: false },
    { href: PROJECT_DOC_URL, label: dict.nav.project, external: true },
    { href: REPO_URL, label: dict.nav.source, external: true },
  ]
  return (
    <footer className="mt-auto border-t bg-background" data-print-hide>
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-8 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Wordmark />
            <p className="mt-3 font-serif text-lg leading-snug text-muted-foreground italic">{dict.footer.pitch}</p>
          </div>
          <nav aria-label={dict.nav.footer}>
            <ul className="grid grid-cols-2 gap-x-10 gap-y-1 sm:grid-cols-3">
              {links.map((l) => (
                <li key={l.href}>
                  {l.external ? (
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4">
                      {l.label}
                      <span aria-hidden="true" className="ml-1">↗</span>
                    </a>
                  ) : (
                    <Link href={l.href} className="inline-flex h-9 items-center text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="double-rule mt-8" aria-hidden="true" />
        <div className="mt-5 flex flex-col gap-3 text-[0.8125rem] text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            <span className="rounded-sm border border-brass/50 bg-brass-soft px-1.5 py-0.5 font-semibold text-brass">{dict.common.demoBadge}</span>
          </p>
          <a href={MONARK_URL} target="_blank" rel="noopener noreferrer" className="text-[0.8125rem] text-muted-foreground hover:text-foreground hover:underline underline-offset-4">
            {dict.common.builtWith}
          </a>
        </div>
      </div>
    </footer>
  )
}
