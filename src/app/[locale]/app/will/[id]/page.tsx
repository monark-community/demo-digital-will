import type { Metadata } from "next"

import { WillView } from "@/components/demo/will-view"
import { isLocale, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

const SEED_WILL_IDS = ["family-savings", "robert-gagnon", "helene-cote"]

// The example wills are prerendered; wills written in the browser render on demand
// (the page is a client shell that reads the will from local demo state).
export function generateStaticParams() {
  return locales.flatMap((locale) => SEED_WILL_IDS.map((id) => ({ locale, id })))
}

export async function generateMetadata({ params }: PageProps<"/[locale]/app/will/[id]">): Promise<Metadata> {
  const { locale, id } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.will
  return { ...pageMetadata(locale, `/app/will/${id}`, m.title, m.description), robots: { index: false, follow: true } }
}

export default async function WillPage({ params }: PageProps<"/[locale]/app/will/[id]">) {
  const { id } = await params
  return <WillView id={id} />
}
