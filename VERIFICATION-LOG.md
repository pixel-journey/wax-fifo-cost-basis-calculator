# Verification log

**Trust label:** educational-reference  
**Updated:** 2026-10-20

| Claim | Evidence | State |
| --- | --- | --- |
| Oldest lot is consumed first | `examples/fifo.test.ts` “matches a sale to the oldest lot” | verified (unit) |
| A disposal can span two lots | same file, “spans two lots” | verified (unit) |
| Later acquires do not fill earlier sales | “does not match a disposal backward” | verified (unit) |
| Asset queues are independent | “keeps assets independent” | verified (unit) |
| Timestamp ties use id | “breaks timestamp ties by id” | verified (unit) |
| Default sample gain is 10 WAX + 5 on the illustrative NFT key | “ignores self-transfers and unknown-basis mints” | verified (unit) |
| Zero-price mint can be opted in | “force mint basis to zero” | verified (unit) |
| Non-positive quantity throws | “rejects non-positive quantities” | verified (unit) |
| Demo renders with no network | `examples/Demo.tsx` imports fixtures only | partial (code inspection) |
| Hyperion action mapping | none | untested |
| Browser axe / Lighthouse | none | untested |
| Any jurisdiction’s tax result | not a goal | not claimed |

Record a live smoke test here before changing the trust label to `verified-patterns`.
