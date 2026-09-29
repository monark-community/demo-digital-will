import { CheckIcon } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { cn } from "@/lib/utils"

// Internal strategy review only: never linked, not in the sitemap, not indexed.
export async function generateMetadata({ params }: PageProps<"/[locale]/pricing">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.pricing
  return { title: m.title, description: m.description, robots: { index: false, follow: false } }
}

export default async function Pricing({ params }: PageProps<"/[locale]/pricing">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const d = getDictionary(locale).pricing
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
      <p className="eyebrow text-brass">{d.eyebrow}</p>
      <h1 className="mt-4 max-w-3xl text-4xl leading-tight font-medium sm:text-5xl">{d.title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{d.lead}</p>
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {d.tiers.map((tier, i) => (
          <article key={tier.name} className={cn("flex flex-col rounded-md border p-6", i === 1 ? "paper border-primary" : "bg-card")}>
            <p className="eyebrow">{tier.who}</p>
            <h2 className="mt-3 text-3xl font-medium">{tier.name}</h2>
            <p className="mt-4">
              <span className="font-serif text-4xl font-medium">{tier.price}</span>
              {tier.cadence ? <span className="ml-2 text-sm text-muted-foreground">{tier.cadence}</span> : null}
            </p>
            <ul className="mt-6 space-y-2.5 border-t pt-5 text-sm">
              {tier.items.map((x) => (
                <li key={x} className="flex gap-2">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  {x}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <h2 className="mt-16 text-2xl font-medium">{d.why.title}</h2>
      <ul className="mt-4 max-w-3xl list-disc space-y-2 pl-5 text-muted-foreground">
        {d.why.items.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </section>
  )
}
