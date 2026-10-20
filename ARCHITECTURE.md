# Architecture

```
LedgerEvent[]  -->  applyPolicy  -->  per-asset queues  -->  FifoResult
                         |                                      |
                         +---- skipped ids + warnings ----------+
                                                              |
                                                         reportToCsv
                                                              |
                                                         Demo (React)
```

## Why the pieces are split

| Piece | Role |
| --- | --- |
| `examples/types.ts` | The ledger vocabulary. No I/O. |
| `examples/fifo.ts` | Ordering, policy, matching, CSV. Pure. |
| `examples/fixtures.ts` | The only numbers the demo is allowed to treat as known. |
| `examples/Demo.tsx` | Renders the engine. It does not reimplement FIFO. |
| `app/` | Next.js shell so `npm run dev` is the handbook’s quick start. |

## Decisions

**Micro-units.** JavaScript floats will eventually split a lot into `0.30000000004`. Matching runs in integer micro-units. Prices stay decimal because they are rates, and the gain is rounded to micro-WAX once per match.

**Policy outside the matcher.** Transfer and mint behavior are not “blockchain facts.” They are reporting choices. Default is the conservative one: do not realize a transfer, do not invent a zero mint basis.

**No indexer client in the hot path.** A live adapter would be a function `(actions) => LedgerEvent[]` with its own tests against saved JSON. It is intentionally absent until a response body is checked into the repo.

**Gain excludes unmatched quantity.** Showing a larger gain by assuming free inventory is the failure mode this repo exists to prevent.

## Data flow for a future live mode

```
Hyperion get_actions
  -> map known actions only
  -> LedgerEvent[]
  -> runFifo(events, userPolicy)
  -> table + warnings + csv
```

Unknown actions become warnings, not guessed lots.
