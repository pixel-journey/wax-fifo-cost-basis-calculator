import type { LedgerEvent } from "./types";

/**
 * Hand-computed sample. Not a real wallet.
 *
 * WAX token:
 *   buy 2 @ 10, buy 1 @ 12, sell 2 @ 15
 *   FIFO: 2 from the first lot → gain (15-10)*2 = 10
 *   open: 1 @ 12
 *
 * NFT key alien.worlds:123 (illustrative ids only):
 *   mint excluded under default policy
 *   buy 1 @ 4, sell 1 @ 9 → gain 5
 */
export const SAMPLE_LEDGER: LedgerEvent[] = [
  {
    id: "wax-buy-1",
    at: "2024-01-02T00:00:00Z",
    asset: "WAX",
    kind: "acquire",
    role: "trade",
    quantity: 2,
    unitPrice: 10,
    memo: "oldest lot",
  },
  {
    id: "wax-buy-2",
    at: "2024-02-01T00:00:00Z",
    asset: "WAX",
    kind: "acquire",
    role: "trade",
    quantity: 1,
    unitPrice: 12,
  },
  {
    id: "wax-xfer",
    at: "2024-02-15T00:00:00Z",
    asset: "WAX",
    kind: "dispose",
    role: "transfer",
    quantity: 0.5,
    unitPrice: 11,
    memo: "self transfer — ignored by default policy",
  },
  {
    id: "wax-sell-1",
    at: "2024-03-01T00:00:00Z",
    asset: "WAX",
    kind: "dispose",
    role: "trade",
    quantity: 2,
    unitPrice: 15,
  },
  {
    id: "nft-mint",
    at: "2024-01-01T00:00:00Z",
    asset: "alien.worlds:123",
    kind: "acquire",
    role: "mint",
    quantity: 1,
    unitPrice: 0,
    memo: "illustrative template id, not a live asset",
  },
  {
    id: "nft-buy",
    at: "2024-04-01T00:00:00Z",
    asset: "alien.worlds:123",
    kind: "acquire",
    role: "trade",
    quantity: 1,
    unitPrice: 4,
  },
  {
    id: "nft-sell",
    at: "2024-05-01T00:00:00Z",
    asset: "alien.worlds:123",
    kind: "dispose",
    role: "trade",
    quantity: 1,
    unitPrice: 9,
  },
];
