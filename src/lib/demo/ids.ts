/*
 * Ids and hashes use Math.random on purpose: crypto.randomUUID is missing on
 * plain-http origins (a phone on the LAN), and nothing here needs to be secure.
 */

const HEX = "0123456789abcdef"

function hex(n: number): string {
  let s = ""
  for (let i = 0; i < n; i++) s += HEX[Math.floor(Math.random() * 16)]
  return s
}

export function randomHash(): string {
  return `0x${hex(64)}`
}

/** A checksummed-looking address (mixed case, not a real EIP-55 checksum). */
export function randomAddress(): string {
  const raw = hex(40)
  let out = ""
  for (const c of raw) out += /[a-f]/.test(c) && Math.random() > 0.5 ? c.toUpperCase() : c
  return `0x${out}`
}

export function randomId(prefix = "id"): string {
  return `${prefix}-${hex(10)}`
}

/** Readable id from a name: "Family savings" -> "family-savings-3fa2". */
export function slugId(name: string): string {
  const base = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32)
  return `${base || "will"}-${hex(4)}`
}
