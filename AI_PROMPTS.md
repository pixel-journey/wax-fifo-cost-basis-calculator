# AI handoff — FIFO cost basis calculator

## Non-negotiables

1. **Not tax, legal, or accounting advice.**
2. FIFO consumes oldest open lots of the **same asset key**.
3. Default policy: ignore `role: "transfer"`; refuse mints with `unitPrice` **0**. Unmatched disposal quantity is **warned and excluded** from gain — not treated as zero-cost sale.
4. Timestamps sort first; equal timestamps break ties by `id`.
5. Quantities use micro-units (`1e-6`) before matching.
6. Sample: 2@10 then 1@12, sell 2@15 → gain **10**, open lot at 12.
7. Live Hyperion mapping is **untested**. Engine is pure on `LedgerEvent`.
8. FIFO math ports; mapper (token contract, market actions, Hyperion host) is chain-local.

## Prompt seeds

- "Run the sample WAX sale — gain and remaining lot?"
- "Unmatched disposal quantity — gain includes zero-cost remainder?"
- "Refuse labeling average-cost output as FIFO."
- "Refuse calling the report a tax filing."

## Do not

- Fetch Hyperion inside `src/fifo.ts`.
- Sort by block number you did not store.
- Apply disposal to a later acquire lot.
- Send raw ledger to a third party to "finish" FIFO.
