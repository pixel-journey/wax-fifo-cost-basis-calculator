# Security — FIFO lot matching

## Closed in tests

| Issue | Behavior |
| --- | --- |
| Buy 2@10, buy 1@12, sell 1@15 | gain **5**; lot a cost 10 matched |
| Sell before any buy | no match, warning, gain **0** |
| Equal timestamps | ties break by `id`, not input order |
| Quantity 0 | throws |
| Default policy | skips transfers and zero-price mints |
| Unmatched disposal quantity | warned and **excluded** from gain |

## Not closed (production)

| Concern | Guidance |
| --- | --- |
| Live Hyperion | Mapper is untested; arguments only |
| Tax / legal / accounting | **Not advice** — not a filing |
| Asset key design | Fungible and NFT must not share a queue |
| Policy persistence | Store transfer/mint policy next to the report |

## Attack angles

1. Labeling average-cost results as FIFO.  
2. Treating a skipped mint as a zero-cost lot without `mintBasis: "zero"`.  
3. Applying a disposal to a lot acquired later (time travel).  
4. Hiding unmatched quantity behind a blank gain figure.  
5. Claiming a tax filing from client-side matching alone.

## Honesty limits

No network. No keys. Pure matching only.

| Sibling | Distinction |
| --- | --- |
| [dust visualizer](https://github.com/pixel-journey/px-token-dust-truncation-visualizer) | Floor can pay zero |
| [token ledger](https://github.com/pixel-journey/px-token-balance-ledger) | Conservation of balances |

[docs.wax.io](https://docs.wax.io/).
