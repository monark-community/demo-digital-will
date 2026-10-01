import Link from "next/link"
import { locale as rootLocale } from "next/root-params"

import { SealMark } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import { href, isLocale, type Locale } from "@/i18n/config"
import { getDictionary } from "@/i18n"

async function currentLocale(): Promise<Locale> {
  const value = await rootLocale()
  return value && isLocale(value) ? value : "en"
}

export default async function NotFound() {
  const locale = await currentLocale()
  const d = getDictionary(locale).notFound
  return (
    <section className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <SealMark className="size-16 opacity-90" />
      <p className="eyebrow mt-8">{d.eyebrow}</p>
      <h1 className="mt-3 text-4xl font-medium sm:text-5xl">{d.title}</h1>
      <p className="mt-4 text-muted-foreground">{d.body}</p>
      <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button asChild size="lg">
          <Link href={href(locale)}>{d.home}</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href={href(locale, "/app")}>{d.demo}</Link>
        </Button>
      </div>
    </section>
  )
}
