/**
 * Pure FIFO cost-basis engine.
 *
 * Simple: sort events, match each disposal to the oldest open lot.
 * Recommended: one queue per asset, integer micro-units, explicit warnings.
 * Advanced: policy flags for transfers and mints — never silent zero basis.
 *
 * This is an educational model of First-In, First-Out matching.
 * It is not tax, legal, or accounting advice.
 */

import type {
  AssetFifoReport,
  DisposalMatch,
  FifoPolicy,
  FifoResult,
  LedgerEvent,
  OpenLot,
} from "./types";

const SCALE = 1_000_000;

export const DEFAULT_POLICY: FifoPolicy = {
  transfer: "ignore",
  mintBasis: "unknown",
};

export class LedgerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LedgerError";
  }
}

function toMicro(quantity: number, label: string): number {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new LedgerError(`${label} must be a positive finite number`);
  }
  const micro = Math.round(quantity * SCALE);
  if (micro <= 0) {
    throw new LedgerError(`${label} is too small to represent`);
  }
  return micro;
}

function fromMicro(micro: number): number {
  return Math.round(micro) / SCALE;
}

function assertPrice(price: number, label: string): void {
  if (!Number.isFinite(price) || price < 0) {
    throw new LedgerError(`${label} must be a finite price >= 0`);
  }
}

export function sortEvents(events: readonly LedgerEvent[]): LedgerEvent[] {
  return [...events].sort((a, b) => {
    if (a.at < b.at) return -1;
    if (a.at > b.at) return 1;
    if (a.id < b.id) return -1;
    if (a.id > b.id) return 1;
    return 0;
  });
}

/**
 * Drop or rewrite events the chosen policy refuses to treat as trades.
 * Returned events are safe to match. Skipped ids are reported, not hidden.
 */
export function applyPolicy(
  events: readonly LedgerEvent[],
  policy: FifoPolicy = DEFAULT_POLICY
): { events: LedgerEvent[]; skipped: string[]; warnings: string[] } {
  const skipped: string[] = [];
  const warnings: string[] = [];
  const kept: LedgerEvent[] = [];

  for (const event of sortEvents(events)) {
    const role = event.role ?? "trade";
    if (role === "transfer" && policy.transfer === "ignore") {
      skipped.push(event.id);
      warnings.push(
        `${event.id}: transfer ignored (policy.transfer=ignore). It does not change lots.`
      );
      continue;
    }
    if (role === "mint" && event.kind === "acquire" && policy.mintBasis === "unknown") {
      if (event.unitPrice === 0) {
        skipped.push(event.id);
        warnings.push(
          `${event.id}: mint excluded. Zero was not accepted as a known cost (policy.mintBasis=unknown).`
        );
        continue;
      }
    }
    if (role === "mint" && event.kind === "acquire" && policy.mintBasis === "zero") {
      kept.push({ ...event, unitPrice: event.unitPrice });
      if (event.unitPrice !== 0) {
        warnings.push(
          `${event.id}: mint kept at stated unit price ${event.unitPrice}, not forced to zero.`
        );
      }
      continue;
    }
    kept.push(event);
  }

  return { events: kept, skipped, warnings };
}

interface MutableLot {
  eventId: string;
  acquiredAt: string;
  micro: number;
  unitCost: number;
}

export function runFifo(
  events: readonly LedgerEvent[],
  policy: FifoPolicy = DEFAULT_POLICY
): FifoResult {
  const applied = applyPolicy(events, policy);
  const warnings = [...applied.warnings];
  const queues = new Map<string, MutableLot[]>();
  const matches: DisposalMatch[] = [];

  for (const event of applied.events) {
    toMicro(event.quantity, `${event.id} quantity`);
    assertPrice(event.unitPrice, `${event.id} unitPrice`);
    const queue = queues.get(event.asset) ?? [];
    queues.set(event.asset, queue);
    const micro = toMicro(event.quantity, `${event.id} quantity`);

    if (event.kind === "acquire") {
      queue.push({
        eventId: event.id,
        acquiredAt: event.at,
        micro,
        unitCost: event.unitPrice,
      });
      continue;
    }

    let need = micro;
    while (need > 0 && queue.length > 0) {
      const lot = queue[0];
      if (!lot) break;
      const take = Math.min(lot.micro, need);
      const quantity = fromMicro(take);
      const realizedGain = fromMicro(Math.round(take * (event.unitPrice - lot.unitCost)));
      matches.push({
        asset: event.asset,
        disposalId: event.id,
        lotEventId: lot.eventId,
        quantity,
        unitCost: lot.unitCost,
        unitProceeds: event.unitPrice,
        realizedGain,
      });
      lot.micro -= take;
      need -= take;
      if (lot.micro === 0) queue.shift();
    }

    if (need > 0) {
      warnings.push(
        `${event.id}: disposal of ${fromMicro(need)} ${event.asset} has no open lot. Unmatched quantity is excluded from realized gain.`
      );
    }
  }

  const byAssetMap = new Map<string, AssetFifoReport>();
  const ensure = (asset: string): AssetFifoReport => {
    const existing = byAssetMap.get(asset);
    if (existing) return existing;
    const created: AssetFifoReport = {
      asset,
      matches: [],
      openLots: [],
      realizedGain: 0,
    };
    byAssetMap.set(asset, created);
    return created;
  };

  for (const match of matches) {
    const report = ensure(match.asset);
    report.matches.push(match);
    report.realizedGain = fromMicro(
      Math.round((report.realizedGain + match.realizedGain) * SCALE)
    );
  }

  for (const [asset, queue] of queues) {
    const report = ensure(asset);
    const openLots: OpenLot[] = queue
      .filter((lot) => lot.micro > 0)
      .map((lot) => ({
        asset,
        eventId: lot.eventId,
        acquiredAt: lot.acquiredAt,
        quantityRemaining: fromMicro(lot.micro),
        unitCost: lot.unitCost,
      }));
    report.openLots = openLots;
  }

  const byAsset = [...byAssetMap.values()].sort((a, b) =>
    a.asset < b.asset ? -1 : a.asset > b.asset ? 1 : 0
  );
  const totalRealizedGain = fromMicro(
    Math.round(byAsset.reduce((sum, report) => sum + report.realizedGain, 0) * SCALE)
  );

  return {
    byAsset,
    totalRealizedGain,
    warnings,
    skipped: applied.skipped,
  };
}

export function reportToCsv(result: FifoResult): string {
  const header =
    "asset,disposal_id,lot_event_id,quantity,unit_cost,unit_proceeds,realized_gain";
  const lines = [header];
  for (const report of result.byAsset) {
    for (const match of report.matches) {
      lines.push(
        [
          match.asset,
          match.disposalId,
          match.lotEventId,
          match.quantity,
          match.unitCost,
          match.unitProceeds,
          match.realizedGain,
        ].join(",")
      );
    }
  }
  return lines.join("\n");
}

/** One-sentence walkthrough for a newcomer. Simple pattern. */
export function explainDisposal(result: FifoResult, disposalId: string): string {
  const related = result.byAsset.flatMap((report) =>
    report.matches.filter((match) => match.disposalId === disposalId)
  );
  if (related.length === 0) {
    return `${disposalId} did not match any open lot. Check ordering and unmatched warnings.`;
  }
  const bits = related.map(
    (match) =>
      `${match.quantity} from lot ${match.lotEventId} (cost ${match.unitCost}, proceeds ${match.unitProceeds}, gain ${match.realizedGain})`
  );
  return `${disposalId} consumed oldest lots first: ${bits.join("; ")}.`;
}
