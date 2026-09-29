import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { notFound } from "next/navigation"

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const d = getDictionary(locale).home
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <h1 className="text-5xl">{d.title}</h1>
    </section>
  )
}
