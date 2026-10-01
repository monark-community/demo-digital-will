import { DAY } from "./window"
import type { DemoState, Person, Will } from "./types"

/** Localised names used by the seed (will names and the example charity). */
export interface SeedCopy {
  wills: { family: string; robert: string; helene: string }
  charity: string
}

export const YOU: Person = {
  id: "you",
  name: "Camille Tremblay",
  address: "0x5A1e3F7b9C2d4E6f8A0b1C3d5E7f9A2b4C6dC3D9",
  relation: "you",
}

const P = {
  marc: { id: "marc", name: "Marc Tremblay", address: "0x8B2f4a91C0d3E5b7A9c1D2e4F6a8B0c3D5e7F914", relation: "brother" },
  nadia: { id: "nadia", name: "Nadia Haddad", address: "0x3c7E9a1B5d2F4c6A8e0B1d3F5a7C9e2B4d6F80a2", relation: "friend" },
  julien: { id: "julien", name: "Julien Roy", address: "0xD41a6C8e0F2b4D6a8C1e3B5d7F9a0C2e4B6d8A37", relation: "notary" },
  sophie: { id: "sophie", name: "Sophie Lavoie", address: "0x6F0b2D4f6A8c1E3a5C7e9B0d2F4b6D8a1C3e5B72", relation: "partner" },
  karim: { id: "karim", name: "Karim Benali", address: "0x9E3d5B7f1A2c4E6b8D0a2C4e6A8c0E2b4D6f8C15", relation: "colleague" },
  lea: { id: "lea", name: "Léa Tremblay", address: "0x2A4c6E8a0C2e4A6c8E1b3D5f7B9d1F3a5C7e9D06", relation: "daughter" },
  thomas: { id: "thomas", name: "Thomas Tremblay", address: "0x7C9e1A3c5E7a9C2e4A6c8E0b2D4f6B8d0F2a4E88", relation: "son" },
  robert: { id: "robert", name: "Robert Gagnon", address: "0x4E6a8C0e2A4c6E8b1D3f5B7d9F1a3C5e7A9c1B53", relation: "friend" },
  sylvie: { id: "sylvie", name: "Sylvie Gagnon", address: "0x1D3f5B7d9F1b3D5f7A9c2E4a6C8e0A2c4E6a8D29", relation: "spouse" },
  isabelle: { id: "isabelle", name: "Isabelle Fortin", address: "0xB5d7F9b1D3f5A7c9E2a4C6e8A0c2E4a6C8e1F064", relation: "notary" },
  helene: { id: "helene", name: "Hélène Côté", address: "0xE7a9C1e3A5c7E9b2D4f6B8d0F2b4D6f8A1c3E5B0", relation: "friend" },
  samuel: { id: "samuel", name: "Samuel Côté", address: "0x0F2b4D6f8B0d2F4a6C8e1A3c5E7a9C1e3A5c7D41", relation: "son" },
  julie: { id: "julie", name: "Julie Côté", address: "0xC6e8A0c2E4a6C8e1B3d5F7b9D1f3B5d7F9a2C4E7", relation: "daughter" },
} satisfies Record<string, Person>

function charity(name: string): Person {
  return { id: "erable", name, address: "0xF8b0D2f4B6d8F0a3C5e7A9c1E3a5C7e9B2d4F6A1", relation: "charity" }
}

/** Seed hashes are fixed so a reset shows the same history. */
const H = {
  family: "0x6b1f0c3a9e84d27c5b3a1e0f9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c",
  familyNadia: "0x2d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e",
  robert: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
  helene: "0x4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e",
  heleneSamuel: "0x7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d",
  heleneJulien: "0x1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b",
}

export function createSeed(copy: SeedCopy, now = Date.now()): DemoState {
  const family: Will = {
    id: "family-savings",
    name: copy.wills.family,
    owner: YOU,
    role: "owner",
    contract: "0xA37c19D2e84F5b60C1d9E3a7B2f4C8e0D6a1F5B9",
    deployedAt: now - 214 * DAY,
    guardians: [
      { ...P.marc, weight: 2, state: "accepted" },
      { ...P.nadia, weight: 1, state: "confirmed", confirmedAt: now - 26 * 60 * 60 * 1000 },
      { ...P.julien, weight: 2, state: "accepted" },
    ],
    beneficiaries: [
      { ...P.lea, share: 50 },
      { ...P.thomas, share: 40 },
      { ...charity(copy.charity), share: 10 },
    ],
    holdings: [
      { symbol: "tETH", amount: 1.85 },
      { symbol: "tWBTC", amount: 0.12 },
      { symbol: "tUSDC", amount: 4500 },
    ],
    window: { minDays: 7, maxDays: 30 },
    status: "declared",
    declaration: { firstAt: now - 26 * 60 * 60 * 1000 },
    cooldownUntil: null,
    payout: "wallets",
    record: null,
    activity: [
      { id: "a1", at: now - 214 * DAY, kind: "deployed", actor: YOU.name, hash: H.family },
      { id: "a2", at: now - 213 * DAY, kind: "accepted", actor: P.julien.name },
      { id: "a3", at: now - 212 * DAY, kind: "accepted", actor: P.marc.name },
      { id: "a4", at: now - 210 * DAY, kind: "accepted", actor: P.nadia.name },
      { id: "a5", at: now - 26 * 60 * 60 * 1000, kind: "confirmed", actor: P.nadia.name, hash: H.familyNadia },
    ],
  }

  const robert: Will = {
    id: "robert-gagnon",
    name: copy.wills.robert,
    owner: P.robert,
    role: "guardian",
    contract: "0x5E2b8D0f3A6c9E1b4D7f0A3c6E9b2D5f8A1c4E7B",
    deployedAt: now - 2 * DAY,
    guardians: [
      { ...P.isabelle, weight: 2, state: "accepted" },
      { ...YOU, weight: 1, state: "pending", isYou: true },
    ],
    beneficiaries: [{ ...P.sylvie, share: 100 }],
    holdings: [
      { symbol: "tETH", amount: 3.2 },
      { symbol: "tLINK", amount: 250 },
    ],
    window: { minDays: 14, maxDays: 60 },
    status: "inactive",
    declaration: null,
    cooldownUntil: null,
    payout: "bank",
    bankLabel: "Desjardins ···· 4821",
    record: null,
    activity: [
      { id: "r1", at: now - 2 * DAY, kind: "deployed", actor: P.robert.name, hash: H.robert },
      { id: "r2", at: now - 2 * DAY, kind: "invited", actor: P.robert.name, target: YOU.name },
      { id: "r3", at: now - 1.5 * DAY, kind: "accepted", actor: P.isabelle.name },
    ],
  }

  const helene: Will = {
    id: "helene-cote",
    name: copy.wills.helene,
    owner: P.helene,
    role: "guardian",
    contract: "0x8D1f4A7c0E3b6D9f2A5c8E1b4D7f0A3c6E9b2F5D",
    deployedAt: now - 3 * 365 * DAY,
    guardians: [
      { ...P.samuel, weight: 2, state: "confirmed", confirmedAt: now - 6 * DAY },
      { ...P.julien, weight: 1, state: "confirmed", confirmedAt: now - 4 * DAY },
      { ...YOU, weight: 1, state: "accepted", isYou: true },
    ],
    beneficiaries: [
      { ...P.julie, share: 60 },
      { ...P.samuel, share: 30 },
      { ...charity(copy.charity), share: 10 },
    ],
    holdings: [
      { symbol: "tETH", amount: 2.4 },
      { symbol: "tWBTC", amount: 0.05 },
      { symbol: "tDAI", amount: 1200 },
      { symbol: "tLINK", amount: 300 },
    ],
    window: { minDays: 5, maxDays: 21 },
    status: "declared",
    declaration: { firstAt: now - 6 * DAY },
    cooldownUntil: null,
    payout: "wallets",
    record: null,
    activity: [
      { id: "h1", at: now - 3 * 365 * DAY, kind: "deployed", actor: P.helene.name, hash: H.helene },
      { id: "h2", at: now - 3 * 365 * DAY + DAY, kind: "accepted", actor: P.samuel.name },
      { id: "h3", at: now - 3 * 365 * DAY + DAY, kind: "accepted", actor: P.julien.name },
      { id: "h4", at: now - 3 * 365 * DAY + 2 * DAY, kind: "accepted", actor: YOU.name },
      { id: "h5", at: now - 6 * DAY, kind: "confirmed", actor: P.samuel.name, hash: H.heleneSamuel },
      { id: "h6", at: now - 4 * DAY, kind: "confirmed", actor: P.julien.name, hash: H.heleneJulien },
    ],
  }

  return {
    version: 1,
    clockOffset: 0,
    wallet: { status: "disconnected", address: YOU.address, name: YOU.name },
    balances: [
      { symbol: "tETH", amount: 3.4 },
      { symbol: "tWBTC", amount: 0.3 },
      { symbol: "tUSDC", amount: 12000 },
      { symbol: "tDAI", amount: 2000 },
      { symbol: "tLINK", amount: 500 },
    ],
    contacts: [P.marc, P.nadia, P.julien, P.sophie, P.karim],
    wills: [family, robert, helene],
    settings: { failNext: false, slow: false },
  }
}

/** Beneficiary choices offered by the composer. */
export function beneficiaryChoices(copy: SeedCopy): Person[] {
  return [P.lea, P.thomas, P.sophie, charity(copy.charity)]
}

/** Example fill for the composer. */
export const EXAMPLE = {
  guardians: [
    { id: "sophie", weight: 2 },
    { id: "marc", weight: 1 },
    { id: "julien", weight: 2 },
  ],
  window: { minDays: 10, maxDays: 45 },
  beneficiaries: [
    { id: "lea", share: 45 },
    { id: "thomas", share: 45 },
    { id: "erable", share: 10 },
  ],
  holdings: { tETH: 1.2, tWBTC: 0.05, tUSDC: 2500 } as Record<string, number>,
}
