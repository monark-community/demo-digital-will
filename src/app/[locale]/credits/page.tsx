import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"

import { isLocale } from "@/i18n/config"
import { getDictionary, t } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"
import { PHOTOS } from "@/lib/photos"

export async function generateMetadata({ params }: PageProps<"/[locale]/credits">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.credits
  return pageMetadata(locale, "/credits", m.title, m.description)
}

export default async function Credits({ params }: PageProps<"/[locale]/credits">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const d = dict.credits
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
      <h1 className="text-4xl font-medium sm:text-5xl">{d.title}</h1>
      <p className="mt-4 text-muted-foreground">{d.lead}</p>
      <h2 className="mt-12 text-2xl font-medium">{d.photos}</h2>
      <ul className="mt-4 divide-y border-y">
        {PHOTOS.map((p, i) => (
          <li key={p.key} className="flex items-center gap-4 py-4">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-sm border">
              <Image src={p.src} alt={dict.home.who.items[i]?.alt ?? ""} fill sizes="80px" className="object-cover" />
            </div>
            <div className="text-sm">
              <p>
                <a href={p.page} target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-4">
                  {t(d.photoBy, { name: p.photographer })}
                </a>
              </p>
              <p className="mt-1 text-muted-foreground">
                <a href={p.profile} target="_blank" rel="noopener noreferrer" className="underline decoration-foreground/30 underline-offset-4">
                  {p.profile.replace("https://", "")}
                </a>
              </p>
              <p className="mt-1 text-muted-foreground">{t(d.usedOn, { place: dict.home.who.items[i]?.title ?? "" })}</p>
            </div>
          </li>
        ))}
      </ul>
      <h2 className="mt-12 text-2xl font-medium">{d.other}</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
        {d.otherItems.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </section>
  )
}
