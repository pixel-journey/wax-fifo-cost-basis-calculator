import { describe, expect, it } from "vitest";
import { explainDisposal, reportToCsv, runFifo } from "./fifo";
import { SAMPLE_LEDGER } from "./fixtures";
import type { LedgerEvent } from "./types";

const wax = (partial: Partial<LedgerEvent> & Pick<LedgerEvent, "id" | "at" | "kind" | "quantity" | "unitPrice">): LedgerEvent => ({
  asset: "WAX",
  role: "trade",
  ...partial,
});

describe("runFifo", () => {
  it("matches a sale to the oldest lot and leaves the newer lot open", () => {
    const result = runFifo([
      wax({ id: "a", at: "2024-01-01T00:00:00Z", kind: "acquire", quantity: 2, unitPrice: 10 }),
      wax({ id: "b", at: "2024-02-01T00:00:00Z", kind: "acquire", quantity: 1, unitPrice: 12 }),
      wax({ id: "c", at: "2024-03-01T00:00:00Z", kind: "dispose", quantity: 1, unitPrice: 15 }),
    ]);
    const report = result.byAsset[0];
    expect(report?.realizedGain).toBe(5);
    expect(report?.matches[0]).toMatchObject({ lotEventId: "a", quantity: 1, unitCost: 10 });
    expect(report?.openLots).toEqual([
      expect.objectContaining({ eventId: "a", quantityRemaining: 1, unitCost: 10 }),
      expect.objectContaining({ eventId: "b", quantityRemaining: 1, unitCost: 12 }),
    ]);
  });

  it("spans two lots when one disposal is larger than the oldest lot", () => {
    const result = runFifo([
      wax({ id: "a", at: "2024-01-01T00:00:00Z", kind: "acquire", quantity: 1, unitPrice: 10 }),
      wax({ id: "b", at: "2024-01-02T00:00:00Z", kind: "acquire", quantity: 1, unitPrice: 20 }),
      wax({ id: "c", at: "2024-01-03T00:00:00Z", kind: "dispose", quantity: 2, unitPrice: 30 }),
    ]);
    const matches = result.byAsset[0]?.matches ?? [];
    expect(matches.map((match) => match.lotEventId)).toEqual(["a", "b"]);
    expect(result.totalRealizedGain).toBe(30);
    expect(explainDisposal(result, "c")).toContain("oldest lots first");
  });

  it("does not match a disposal backward onto a later acquire", () => {
    const result = runFifo([
      wax({ id: "sell", at: "2024-01-01T00:00:00Z", kind: "dispose", quantity: 1, unitPrice: 10 }),
      wax({ id: "buy", at: "2024-02-01T00:00:00Z", kind: "acquire", quantity: 1, unitPrice: 4 }),
    ]);
    expect(result.byAsset.find((report) => report.asset === "WAX")?.matches).toEqual([]);
    expect(result.warnings.some((warning) => warning.includes("sell"))).toBe(true);
    expect(result.totalRealizedGain).toBe(0);
  });

  it("keeps assets independent", () => {
    const result = runFifo([
      wax({ id: "w", at: "2024-01-01T00:00:00Z", kind: "acquire", quantity: 1, unitPrice: 1 }),
      {
        id: "n",
        at: "2024-01-01T00:00:00Z",
        asset: "nft:1",
        kind: "acquire",
        quantity: 1,
        unitPrice: 8,
      },
      wax({ id: "ws", at: "2024-02-01T00:00:00Z", kind: "dispose", quantity: 1, unitPrice: 3 }),
    ]);
    expect(result.byAsset.find((report) => report.asset === "nft:1")?.openLots).toHaveLength(1);
    expect(result.totalRealizedGain).toBe(2);
  });

  it("breaks timestamp ties by id", () => {
    const result = runFifo([
      wax({ id: "b", at: "2024-01-01T00:00:00Z", kind: "acquire", quantity: 1, unitPrice: 5 }),
      wax({ id: "a", at: "2024-01-01T00:00:00Z", kind: "acquire", quantity: 1, unitPrice: 1 }),
      wax({ id: "s", at: "2024-02-01T00:00:00Z", kind: "dispose", quantity: 1, unitPrice: 4 }),
    ]);
    expect(result.byAsset[0]?.matches[0]?.lotEventId).toBe("a");
    expect(result.totalRealizedGain).toBe(3);
  });

  it("ignores self-transfers and unknown-basis mints by default", () => {
    const result = runFifo(SAMPLE_LEDGER);
    expect(result.skipped).toEqual(["nft-mint", "wax-xfer"]);
    const waxReport = result.byAsset.find((report) => report.asset === "WAX");
    expect(waxReport?.realizedGain).toBe(10);
    expect(waxReport?.openLots).toEqual([
      expect.objectContaining({ eventId: "wax-buy-2", quantityRemaining: 1, unitCost: 12 }),
    ]);
    const nft = result.byAsset.find((report) => report.asset === "alien.worlds:123");
    expect(nft?.realizedGain).toBe(5);
    expect(reportToCsv(result).split("\n")[0]).toBe(
      "asset,disposal_id,lot_event_id,quantity,unit_cost,unit_proceeds,realized_gain"
    );
  });

  it("can force mint basis to zero only when the policy says so", () => {
    const result = runFifo(
      [
        {
          id: "mint",
          at: "2024-01-01T00:00:00Z",
          asset: "pack",
          kind: "acquire",
          role: "mint",
          quantity: 1,
          unitPrice: 0,
        },
        {
          id: "sell",
          at: "2024-02-01T00:00:00Z",
          asset: "pack",
          kind: "dispose",
          role: "trade",
          quantity: 1,
          unitPrice: 6,
        },
      ],
      { transfer: "ignore", mintBasis: "zero" }
    );
    expect(result.skipped).toEqual([]);
    expect(result.totalRealizedGain).toBe(6);
  });

  it("rejects non-positive quantities", () => {
    expect(() =>
      runFifo([
        wax({ id: "bad", at: "2024-01-01T00:00:00Z", kind: "acquire", quantity: 0, unitPrice: 1 }),
      ])
    ).toThrow(/positive/);
  });
});
