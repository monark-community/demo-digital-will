import type { Holding, TokenSymbol } from "./types"

/** Testnet tokens and reference prices (USD), shared with the other Monark demos. */
export const TOKENS: Record<TokenSymbol, { price: number; decimals: number; step: number; digits: number }> = {
  tETH: { price: 3200, decimals: 18, step: 0.01, digits: 4 },
  tWBTC: { price: 64000, decimals: 8, step: 0.001, digits: 5 },
  tUSDC: { price: 1, decimals: 6, step: 1, digits: 2 },
  tDAI: { price: 1, decimals: 18, step: 1, digits: 2 },
  tLINK: { price: 14.5, decimals: 18, step: 1, digits: 2 },
}

export const TOKEN_ORDER: TokenSymbol[] = ["tETH", "tWBTC", "tUSDC", "tDAI", "tLINK"]

/** Swap slippage applied at execution (simulated pool depth). */
export const SLIPPAGE: Record<TokenSymbol, number> = {
  tETH: 0.0031,
  tWBTC: 0.0042,
  tUSDC: 0,
  tDAI: 0.0004,
  tLINK: 0.0058,
}

export function usdValue(h: Holding): number {
  return h.amount * TOKENS[h.symbol].price
}

export function totalUsd(hs: Holding[]): number {
  return hs.reduce((sum, h) => sum + usdValue(h), 0)
}

/**
 * Whole-token amount to a base-unit string for the registry TokenAmount
 * component. We keep 6 decimals of precision, which is enough for display.
 */
export function toUnits(amount: number): { value: string; decimals: number } {
  return { value: String(Math.round(amount * 1e6)), decimals: 6 }
}
