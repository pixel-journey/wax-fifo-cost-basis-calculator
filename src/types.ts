/** Educational FIFO types. Not a tax engine. */

export type LedgerKind = "acquire" | "dispose";

/** How the event should be interpreted before FIFO matching. */
export type LedgerRole = "trade" | "transfer" | "mint";

export interface LedgerEvent {
  id: string;
  /** ISO-8601 timestamp. Ordering is chronological, then id. */
  at: string;
  /** Stable asset key: token symbol or `collection:template`. */
  asset: string;
  kind: LedgerKind;
  role?: LedgerRole;
  /** Positive quantity in whole or fractional units. */
  quantity: number;
  /**
   * WAX per unit.
   * Acquire: cost. Dispose: proceeds.
   * Ignored when policy skips the event.
   */
  unitPrice: number;
  memo?: string;
}

export interface FifoPolicy {
  /**
   * `ignore` — a transfer does not open or close lots (move between own accounts).
   * `dispose` — a transfer realizes like a sale. Only use this with an explicit policy.
   */
  transfer: "ignore" | "dispose";
  /**
   * `unknown` — a mint without a stated cost is excluded and warned.
   * `zero` — a mint is an acquire at 0. That is a policy choice, not a fact.
   */
  mintBasis: "unknown" | "zero";
}

export interface DisposalMatch {
  asset: string;
  disposalId: string;
  lotEventId: string;
  quantity: number;
  unitCost: number;
  unitProceeds: number;
  realizedGain: number;
}

export interface OpenLot {
  asset: string;
  eventId: string;
  acquiredAt: string;
  quantityRemaining: number;
  unitCost: number;
}

export interface AssetFifoReport {
  asset: string;
  matches: DisposalMatch[];
  openLots: OpenLot[];
  realizedGain: number;
}

export interface FifoResult {
  byAsset: AssetFifoReport[];
  totalRealizedGain: number;
  warnings: string[];
  /** Events removed by policy before matching. */
  skipped: string[];
}
