/**
 * Scalloped wax-seal outline on a 32×32 grid, computed once. Used by the
 * logo, the favicon (src/app/icon.svg was generated from the same numbers)
 * and the estate-record seal.
 */
export function sealPath(cx = 16, cy = 16, valley = 14.1, crest = 16.6, bumps = 18): string {
  const step = (Math.PI * 2) / bumps
  const pt = (r: number, a: number) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`
  let d = `M ${pt(valley, -Math.PI / 2)}`
  for (let i = 0; i < bumps; i++) {
    const a0 = -Math.PI / 2 + i * step
    d += ` Q ${pt(crest, a0 + step / 2)} ${pt(valley, a0 + step)}`
  }
  return `${d} Z`
}

export const SEAL_PATH = sealPath()

/** The W whose middle strokes cross like a chain link. */
export const W_PATH = "M8.6 11.2 L12.3 21.4 L16 13.6 L19.7 21.4 L23.4 11.2"
