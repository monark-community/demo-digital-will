import Link from "next/link"

import { Wordmark } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import { href, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n"

import { LocaleSwitch } from "./locale-switch"
import { MobileMenu } from "./mobile-menu"
import { NavLinks } from "./nav-links"
import { ThemeToggle } from "./theme"

export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = [
    { href: href(locale, "/how-it-works"), label: dict.nav.how },
    { href: href(locale, "/app"), label: dict.nav.demoShort },
  ]
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 supports-[backdrop-filter]:bg-background/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href={href(locale)} aria-label={dict.common.home} className="-ml-1 rounded-md p-1">
          <Wordmark />
        </Link>
        <nav aria-label={dict.nav.primary} className="ml-6 hidden md:block">
          <NavLinks items={items} className="flex items-center gap-7" />
        </nav>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <div className="hidden items-center gap-1.5 md:flex">
            <LocaleSwitch locale={locale} label={dict.common.language} names={dict.common.languageNames} />
            <ThemeToggle label={dict.common.theme} />
          </div>
          <Button asChild size="sm" className="ml-1">
            <Link href={href(locale, "/app")}>
              <span className="sm:hidden">{dict.nav.demoShort}</span>
              <span className="hidden sm:inline">{dict.nav.demo}</span>
            </Link>
          </Button>
          <MobileMenu items={items} openLabel={dict.common.openMenu} closeLabel={dict.common.closeMenu} title="WillChain">
            <LocaleSwitch locale={locale} label={dict.common.language} names={dict.common.languageNames} />
            <ThemeToggle label={dict.common.theme} />
          </MobileMenu>
        </div>
      </div>
    </header>
  )
}
