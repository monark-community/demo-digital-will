import { ImageResponse } from "next/og"

import { SEAL_PATH, W_PATH } from "@/components/brand/seal-path"
import { isLocale, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n"

export const alt = "WillChain"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : "en"
  const d = getDictionary(locale)
  // Ruler: execution flag after two of three guardians confirmed.
  const flag = 0.54

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#F5F1E8", color: "#1F1D1A", padding: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="72" height="72" viewBox="0 0 32 32">
            <path d={SEAL_PATH} fill="#2F4A3C" />
            <circle cx="16" cy="16" r="10.6" fill="none" stroke="#F7F3EA" strokeOpacity="0.55" strokeWidth="0.8" />
            <path d={W_PATH} fill="none" stroke="#F7F3EA" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 48, fontWeight: 700, letterSpacing: -1 }}>WillChain</span>
        </div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 980 }}>{d.meta.ogTagline}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", position: "relative", height: 22, border: "2px solid #1F1D1A55", borderRadius: 4, background: "#FBF9F4" }}>
            <div style={{ display: "flex", width: "23%", height: "100%", background: "#D3C9B5" }} />
            <div style={{ display: "flex", position: "absolute", left: `${flag * 100}%`, top: -14, width: 6, height: 46, background: "#2F4A3C", borderRadius: 3 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#5C554A" }}>
            <span>{d.common.demoBadge}</span>
            <span>willchain.monark.io</span>
          </div>
        </div>
      </div>
    ),
    size
  )
}
