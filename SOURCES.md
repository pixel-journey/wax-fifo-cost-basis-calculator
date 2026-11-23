# Sources

| Source | Use |
| --- | --- |
| [docs.wax.io](https://docs.wax.io/) | Network / action context |
| [docs.eosnetwork.com](https://docs.eosnetwork.com/) | Transfer patterns |
| [Atomic markets lab](https://github.com/pixel-journey/wax-atomic-markets-and-trading-interface) | Sale shapes (mapper input, not this engine) |
| [token ledger](https://github.com/pixel-journey/px-token-balance-ledger) | Conservation under a token |
| [wharfkit/skill](https://github.com/wharfkit/skill) | SessionKit if a host later signs |

```bash
git clone https://github.com/wharfkit/skill.git ~/.claude/skills/wharfkit
```

## Product facts locked by tests

- FIFO consumes oldest open lots of the **same asset key**.
- Default policy: ignore `role: "transfer"`; refuse zero-price mints. Unmatched disposal qty **warned and excluded** from gain.
- Sample WAX sale realizes **10** and leaves the newer lot.
- Timestamps sort first; equal timestamps break ties by `id`.
- Micro-units (`1e-6`) before matching.

## Explicit non-claims

- **Not tax, legal, or accounting advice.**
- Live Hyperion mapping is **untested**.
- Engine will faithfully match a **bad** ledger if the mapper is wrong.

## Portability

FIFO math is chain-agnostic. Mappers change: token contract, market action names, Hyperion host, chain id in asset keys if ledgers merge.

## Suggested topics

`antelope` `education` `pixel-journey` `tokens` `wax`
