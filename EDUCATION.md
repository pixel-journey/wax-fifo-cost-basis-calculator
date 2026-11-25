# Education — oldest lots first

> **Rung:** `npm test` passes. The ledger is an argument. Hyperion is not parsed. This is **not** tax, legal, or accounting advice.  
> **The test is the rule.** Dust floors: [px-token-dust-truncation-visualizer](https://github.com/pixel-journey/px-token-dust-truncation-visualizer).

## Learning outcomes

| Level | After this file |
| --- | --- |
| Beginner | Match a sale against the oldest open lot |
| Intermediate | Multi-lot sells, same-timestamp id order, asset isolation |
| Masterclass | Refuse to call this a tax report or Hyperion parse |

---

## Beginner — one scene

| Ledger | Locked result |
| --- | --- |
| Buy 2 at 10, buy 1 at 12, sell 1 at 15 | realized gain `5` (lot `a` at cost 10) |
| Buy 1 at 10, buy 1 at 20, sell 2 at 30 | gain `30` |
| Sell before any buy | no match, gain `0` |

```bash
npm test
```

---

## Intermediate

| Rule | Detail |
| --- | --- |
| Match order | oldest open lot first |
| Same timestamp | ties break by id, not input order |
| Assets | WAX and `nft:1` do not mix |
| Quantity 0 | throws |
| Mint at price 0 | skipped unless `mintBasis: "zero"` |

### Attack → test

| Attack | Lab behavior |
| --- | --- |
| Match sell backward to later lots | refused |
| Mix NFT lots into WAX sell | asset isolation |
| Treat skipped mint as cost 0 | only with explicit policy |

### Exercises

1. Buy 2@10, buy 1@12, sell 1@15 — gain? (**5**.)  
2. Sell with no open lots — gain? (**0**.)  
3. Is this tax advice? (**No**.)

---

## Masterclass

Hyperion history, jurisdiction rules, and report formats are outside this pure matcher. Self-transfers and unknown-basis mints are skipped unless policy says otherwise.

---

## What this course will not teach

- Live Hyperion parsing
- Tax forms or legal findings
- That realized gain is a chain balance change
