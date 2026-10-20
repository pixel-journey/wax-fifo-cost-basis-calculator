# wax-fifo-cost-basis-calculator

**Trust label:** `educational-reference`  
**Status:** Private. Gate 0 and Gate 1 for the pure engine. Live Hyperion parsing is not verified.  
**Not tax, legal, or accounting advice.**

One-sentence goal: show how First-In, First-Out matching turns a sorted WAX trade ledger into auditable lot consumption, open lots, and realized gain — entirely on the client, with policy flags instead of silent assumptions.

Parent catalog: [pixel-journey/wax-ecosystem-blueprint-catalog](https://github.com/pixel-journey/wax-ecosystem-blueprint-catalog)

## Contents

1. [Quick start](#quick-start)
2. [Why this exists](#why-this-exists)
3. [Concepts](#concepts)
4. [Patterns](#patterns)
5. [Demo](#demo)
6. [Integration](#integration)
7. [Best practices and anti-patterns](#best-practices-and-anti-patterns)
8. [Edge cases](#edge-cases)
9. [Safety](#safety)
10. [Antelope portability](#antelope-portability)
11. [Verification](#verification)
12. [Roadmap](#roadmap)

## Quick start

```bash
git clone https://github.com/pixel-journey/wax-fifo-cost-basis-calculator.git
cd wax-fifo-cost-basis-calculator
npm install
npm test
npm run dev
```

The dev server renders `examples/fixtures.ts`. No wallet and no network are required.

## Why this exists

Collectors mix buys, mints, and self-transfers, then ask a spreadsheet to “just do FIFO.” The usual failures are ordering, mixing assets, and inventing a zero cost for a mint. This repo isolates the matching rules so those failures are tests, not vibes.

It does **not** fetch your account. Mapping Hyperion actions into `LedgerEvent` is a separate, still-untested adapter. See [VERIFICATION-LOG.md](VERIFICATION-LOG.md).

## Concepts

| Idea | In this repo |
| --- | --- |
| Lot | Quantity still held from one acquire, with that acquire’s unit cost |
| FIFO | A disposal consumes the oldest open lots of the **same asset key** |
| Asset key | A string you choose and keep stable, e.g. `WAX` or `collection:template` |
| Realized gain | `quantity * (proceeds − cost)` summed only over matched quantity |
| Policy | Explicit choice for transfers and zero-price mints |

Timestamps sort first. Equal timestamps break ties by `id`, so the result does not depend on input order.

Quantities are converted to micro-units (`1e-6`) before matching so `0.5` and `1.5` do not drift across lot boundaries.

## Patterns

**Simple.** Sort, then walk. `explainDisposal()` is the sentence form of one sale.

**Recommended.** `runFifo(events)` with `DEFAULT_POLICY`: ignore `role: "transfer"`, and refuse mints whose `unitPrice` is `0`. Unmatched disposal quantity is warned and **excluded** from gain. It is not treated as a zero-cost sale.

**Advanced.** Pass a policy:

```ts
import { runFifo } from "./examples/fifo";

const result = runFifo(events, {
  transfer: "dispose", // only if you truly want transfers to realize
  mintBasis: "zero",   // only if your reporting policy says mints cost 0
});
```

`reportToCsv(result)` writes the match rows. Asset keys in this demo have no commas; quote fields if you add free-text columns.

## Demo

`npm run dev` shows the sample ledger:

- 2 WAX acquired at 10, then 1 at 12, then a sale of 2 at 15 → gain **10**, one open lot at 12
- A self-transfer is skipped
- A zero-price mint is skipped
- A later NFT buy at 4 and sell at 9 → gain **5**

Toggle the two policy controls to see the warnings change. That toggle is the teaching point.

Mock data lives in [examples/fixtures.ts](examples/fixtures.ts). The `alien.worlds:123` key is an **illustrative id**, not a claim about a specific mint.

## Integration

1. Normalize indexer rows into `LedgerEvent` **before** calling `runFifo`. Do the I/O outside `examples/fifo.ts`.
2. Pick asset keys up front. Fungible WAX and an NFT template must not share a queue.
3. Decide transfer and mint policy with the user. Persist the policy next to the report.
4. Render warnings. A blank gain figure with hidden unmatched quantity is worse than no tool.
5. For a live path, read account actions from a Hyperion `get_actions` endpoint, then map only the action types you understand (`transfer`, market buys/sells). Anything else stays unmatched and visible.

Suggested public read endpoints (unverified in this repo):

- `https://wax.eosusa.io`
- `https://wax.greymass.com`

Fall back to a second Hyperion if the first times out. Do not scrape a single commercial history product as the only source.

## Best practices and anti-patterns

Do:

- Keep the engine pure and unit-test the lots.
- Warn on unmatched quantity.
- Separate “moved to my other account” from “sold.”
- Show the lot ids that a disposal consumed.

Do not:

- Label an average-cost result as FIFO.
- Sort by block number you did not actually store.
- Apply a disposal to a lot acquired later.
- Drop self-transfers silently **and** also realize them. Pick one policy and print it on the report.
- Call the output a tax filing.

## Edge cases

| Case | Behavior |
| --- | --- |
| Sale before any acquire | Warning, gain unchanged, later acquire stays open |
| Sale larger than open quantity | Match what exists, warn for the rest |
| Two assets | Independent queues |
| Same timestamp | Lower `id` wins |
| `quantity <= 0` or non-finite price | `LedgerError` |
| Mint at price 0, default policy | Skipped |
| Mint at price 0, `mintBasis: "zero"` | Acquire at 0 |

## Safety

- Client-side only. The demo does not ask for keys.
- Do not send the raw ledger to a third party to “finish” FIFO.
- Reports can be wrong if the mapper mis-labels transfers. The engine will faithfully match a bad ledger.
- WCAG notes: the demo is a real table with a caption, visible warnings, and no motion. It is not a certified audit.

## Antelope portability

FIFO itself is chain-agnostic. What changes on another Antelope chain is the **mapper**: token contract (`eosio.token` vs a local equivalent), NFT marketplace action names, and Hyperion hostnames. Asset keys should include the chain id if you ever merge ledgers.

## Verification

| Claim | State |
| --- | --- |
| Sample WAX sale realizes 10 and leaves the newer lot | Covered by `examples/fifo.test.ts` |
| Default policy skips the sample transfer and zero mint | Covered by tests |
| `npm run dev` works offline | Local UI, no network |
| Live Hyperion mapping | **Untested** |
| Tax correctness for any jurisdiction | **Not claimed** |

## Roadmap

- A pure Hyperion action mapper with fixture JSON captured from a public response
- Quoted CSV and a period filter
- Side-by-side FIFO vs average-cost, clearly labeled
- Screenshot in the README after a recorded browser pass

## License

MIT. Built for the WAX and Antelope educational catalog.
