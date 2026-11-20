# Education — oldest lots first

> **Rung:** `npm test` passes (10). The ledger is an argument. Hyperion is not parsed. This is not tax, legal, or accounting advice.  
> **The test is the rule.** A positive amount that can still floor to zero is [px-token-dust-truncation-visualizer](https://github.com/pixel-journey/px-token-dust-truncation-visualizer). This file matches whole units.

## Predict, then run

| Ledger | Locked result |
| --- | --- |
| Buy 2 at 10, buy 1 at 12, sell 1 at 15 | realized gain `5`. The match is lot `a` at cost 10. Lot `a` still has 1 open, and lot `b` is untouched. |
| Buy 1 at 10, buy 1 at 20, sell 2 at 30 | lots `a` then `b`. Gain `(30-10) + (30-20) = 30`. |
| Sell before any buy | no match, a warning, gain `0`. Later lots are not used backward. |
| WAX and `nft:1` in one ledger, only WAX is sold | the NFT lot stays open. WAX gain is `2` (sold at 3, cost 1). |
| Two buys at the same timestamp, ids `b` then `a` | the sale matches `a`. Ties break by id, not by input order. Gain `3` (sold at 4, cost 1). |
| The sample ledger | skips `nft-mint` and `wax-xfer`. WAX gain `10`. The NFT `alien.worlds:123` gain is `5`. |
| A mint at price 0, then a sale at 6, with `mintBasis: "zero"` | gain `6`. Without that policy the mint is skipped. |
| Quantity 0 | throws. |

Self-transfers and unknown-basis mints are skipped unless the policy says otherwise. Do not treat a skipped mint as a zero-cost lot.

The HTTP examples are unsent. They are not a tax export.
