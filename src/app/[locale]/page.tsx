import { ArrowRightIcon, EyeIcon, HourglassIcon, LockKeyholeIcon } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { HeroWill } from "@/components/home/hero-will"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { href, isLocale } from "@/i18n/config"
import { getDictionary, t } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"
import { PHOTOS } from "@/lib/photos"

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta
  return pageMetadata(locale, "/", null, m.description)
}

const problemIcons = [LockKeyholeIcon, EyeIcon, HourglassIcon]
const proofTargets = ["/app/new", "/app/will/family-savings#veto", "/app/will/helene-cote", "/app/will/helene-cote"]

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const d = dict.home
  const w = dict.app.will.window

  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-12 pb-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-20 lg:pb-24">
        <div>
          <p className="eyebrow">{d.eyebrow}</p>
          <h1 className="mt-4 text-[2.625rem] leading-[1.04] font-medium sm:text-6xl lg:text-[4rem]">{d.title}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{d.lead}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={href(locale, "/app")}>
                {d.ctaPrimary}
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={href(locale, "/how-it-works")}>{d.ctaSecondary}</Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">{dict.common.finance}</p>
        </div>
        <HeroWill
          copy={{
            ...d.hero,
            ruler: { first: w.first, today: w.today, execution: w.execution, minMark: t(w.minMark, { n: 7 }), maxMark: t(w.maxMark, { n: 30 }) },
          }}
        />
      </section>

      {/* Problem */}
      <section className="border-y bg-card/50">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="max-w-2xl text-3xl leading-tight font-medium sm:text-4xl">{d.problem.title}</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {d.problem.items.map((item, i) => {
              const Icon = problemIcons[i] ?? LockKeyholeIcon
              return (
                <div key={item.title} className="border-t border-foreground/20 pt-5">
                  <Icon className="size-6 text-wax" strokeWidth={1.5} aria-hidden="true" />
                  <p className="mt-4">
                    <span className="font-serif text-xl font-medium">{item.title}</span> <span className="text-muted-foreground">{item.body}</span>
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How a will moves */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-3xl font-medium sm:text-4xl">{d.steps.title}</h2>
          <Link href={href(locale, "/how-it-works")} className="inline-flex items-center gap-1.5 font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary">
            {d.steps.more}
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <ol className="mt-10 grid gap-0 md:grid-cols-4">
          {d.steps.items.map((s, i) => (
            <li key={s.title} className="relative border-l border-foreground/20 pb-8 pl-6 md:border-t md:border-l-0 md:pt-6 md:pr-6 md:pb-0 md:pl-0">
              <span aria-hidden="true" className="absolute top-0 -left-[7px] size-3.5 rounded-full border-2 border-primary bg-background md:-top-[7px] md:left-0" />
              <span className="font-serif text-4xl text-muted-foreground/70 tabular">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-2 font-serif text-xl font-medium">{s.title}</p>
              <p className="mt-2 text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Who it's for */}
      <section className="border-t bg-card/50">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <h2 className="text-3xl font-medium sm:text-4xl">{d.who.title}</h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
            {d.who.items.map((item, i) => {
              const photo = PHOTOS[i]
              return (
                <figure key={item.title}>
                  {photo ? (
                    <div className="relative aspect-[4/3] overflow-hidden rounded-md border">
                      <Image
                        src={photo.src}
                        alt={item.alt}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        placeholder="blur"
                        className="object-cover sepia-[0.12] saturate-[0.85]"
                      />
                    </div>
                  ) : null}
                  <figcaption className="mt-4">
                    <p className="font-serif text-xl font-medium">{item.title}</p>
                    <p className="mt-2 text-muted-foreground">{item.body}</p>
                  </figcaption>
                </figure>
              )
            })}
          </div>
        </div>
      </section>

      {/* What the demo proves */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="text-3xl font-medium sm:text-4xl">{d.proof.title}</h2>
            <p className="mt-4 max-w-md text-muted-foreground">{d.proof.lead}</p>
          </div>
          <ul className="divide-y border-y">
            {d.proof.items.map((item, i) => (
              <li key={item.title} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <div>
                  <p className="font-serif text-xl font-medium">{item.title}</p>
                  <p className="mt-1 text-muted-foreground">{item.body}</p>
                </div>
                <Link
                  href={href(locale, proofTargets[i] ?? "/app")}
                  className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
                >
                  {d.proof.cta}
                  <ArrowRightIcon className="size-4" aria-hidden="true" />
                  <span className="sr-only">: {item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t bg-card/50">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
          <h2 className="text-3xl font-medium sm:text-4xl">{d.faq.title}</h2>
          <Accordion type="single" collapsible className="mt-8 border-t">
            {d.faq.items.map((item, i) => (
              <AccordionItem key={item.q} value={`q${i}`} className="border-b">
                <AccordionTrigger className="py-5 text-left font-serif text-lg font-medium hover:no-underline">{item.q}</AccordionTrigger>
                <AccordionContent className="pb-5 text-base text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Closing */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between">
          <h2 className="max-w-2xl text-3xl leading-tight font-medium sm:text-4xl">{d.closing.title}</h2>
          <Button asChild size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
            <Link href={href(locale, "/app")}>
              {d.closing.cta}
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
