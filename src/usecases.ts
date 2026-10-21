import { HISTORY_ORIGIN, historyActions } from "./api";
import { runFifo } from "./fifo";
import { SAMPLE_LEDGER } from "./fixtures";
import type { ChainAction, HttpRequest } from "./api";

export type UseCase = {
  title: string;
  detail: string;
  request: HttpRequest;
  transaction: { note: string; actions: ChainAction[] } | null;
};

const report = runFifo(SAMPLE_LEDGER);

export const USE_CASES: UseCase[] = [
  {
    title: "Transfers you would still have to classify",
    detail: "Hyperion returns action traces. It does not return lots. SAMPLE_LEDGER is hand-computed, and a transfer role is ignored by the default policy. This URL is not requested.",
    request: historyActions(HISTORY_ORIGIN, "alice", "eosio.token:transfer", 50),
    transaction: null,
  },
  {
    title: "NFT transfers are a different filter",
    detail: `Sample realized gain across the hand ledger is ${report.totalRealizedGain}. Not tax advice. No disposal transaction is built here.`,
    request: historyActions(HISTORY_ORIGIN, "alice", "atomicassets:transfer", 50),
    transaction: null,
  },
];

export function assertUseCases(): void {
  if (report.totalRealizedGain !== 15) throw new Error(`gain ${report.totalRealizedGain}`);
}
