# Public readiness

Checked 2026-10-20 against the catalog rubric. This repo stays private.

## Gate 0

- [x] README with goal, quick start, concepts, safety, portability, verification
- [x] `package.json` scripts `dev`, `build`, `test`, `typecheck`
- [x] `tsconfig.json` strict
- [x] `.gitignore`
- [x] MIT `LICENSE`
- [x] `.github/workflows/ci.yml` (install, test, typecheck, build)
- [x] No secrets
- [x] `VERIFICATION-LOG.md`
- [x] Trust label in the README

## Gate 1

- [x] `spec.yaml`
- [x] `ARCHITECTURE.md`
- [x] Pure logic separated from I/O
- [x] `src/fifo.test.ts` with assertions
- [x] Best practices and anti-patterns
- [x] Edge cases
- [x] Antelope notes
- [x] Offline demo plus a documented, unverified live path
- [x] Related blueprints named below

## Gate 2

- [ ] Recorded live API smoke test
- [x] Empty/warning states in the demo (unmatched and skipped events)
- [ ] Axe or Lighthouse record
- [ ] Rate-limit fallback implemented (documented only)
- [x] Not a place to put new value; no signing
- [ ] Issue templates

## Related

- `wax-defi-loyalty-health-scorecard`
- `wax-immutable-data-provenance-explorer` (when present) or history-backed blueprints in the catalog
- `wax-ecosystem-blueprint-catalog` rubric
