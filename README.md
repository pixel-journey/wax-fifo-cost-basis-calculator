# wax-fifo-cost-basis-calculator

**FIFO Cost Basis Calculator**

A portfolio accounting tool that uses First-In, First-Out (FIFO) rules to calculate clear capital gains distributions for historical trades on WAX. Helps users and projects generate accurate tax or accounting reports from on-chain transaction history.

**Status:** 🔒 Private (In Development) | Target: Public when v1 complete  
**Category:** Advanced Compliance, Accounting Analytics & Financial Forensics  
**Parent Catalog:** [pixel-journey/wax-ecosystem-blueprint-catalog](https://github.com/pixel-journey/wax-ecosystem-blueprint-catalog)

> Built to the same high standard of educational excellence, production readiness, and WAX best practices as the [gkniftyheads-tracker](https://github.com/henrikpiga/gkniftyheads-tracker).

---

## Quick Start

```bash
git clone https://github.com/pixel-journey/wax-fifo-cost-basis-calculator.git
cd wax-fifo-cost-basis-calculator
npm install
npm run dev
```

Connect a wallet or explore sample trade history in the demo to see instant FIFO cost basis and capital gains calculations.

---

## Why This Blueprint?

Calculating accurate cost basis for crypto/NFT trades is complex and error-prone, especially for tax or accounting purposes. This tool automates FIFO-based calculations from on-chain history, providing clear, auditable reports without manual spreadsheets.

---

## Architecture & Data Flow

```
Connect Wallet or Load Sample History
       ↓
Fetch and Parse Transaction History
  - Buys, sells, transfers, mints
       ↓
Apply FIFO Cost Basis Rules
  - Match oldest purchases to sales
  - Calculate gains/losses
       ↓
Generate Reports and Breakdowns
  - Per-asset or portfolio view
  - Exportable CSV or detailed ledger
```

All calculations are client-side.

---

## Complete Repository Structure

Follows Pixel Journey high standards.

Key parts:
- `app/` — Main calculator interface
- `components/` — TradeHistoryTable, CostBasisSummary, GainsBreakdown, ExportPanel
- `hooks/` — useFifoCalculation, useTradeHistory
- `lib/wax/` — history-parser.ts, fifo-engine.ts, gains-calculator.ts
- `public/mock-data/` — Sample trade histories with known cost basis
- `.github/workflows/` — CI automation

Detailed comments on FIFO logic and transaction parsing.

---

## Key WAX Concepts Explained

- **Transaction History Parsing**: Extracting buys, sells, and transfers from Hyperion or other indexers.
- **FIFO Methodology**: Matching the oldest acquired assets to sales for accurate cost basis.
- **Capital Gains Calculation**: Computing realized gains/losses per trade or over periods.
- **On-Chain Auditability**: All underlying data is public, making reports verifiable.

This is **WAX-primary** but the FIFO calculation and reporting pattern is portable to other chains with similar transaction data.

---

## Design Specifications

- Clean accounting-style tables and summaries
- Clear gains/losses visualization
- Responsive design
- Accessible controls and detailed explanations

Aligned with Pixel Journey Design System.

---

## Technical Architecture & Best Practices

- **Stack**: Next.js 15, TypeScript, Tailwind + shadcn/ui
- **Data**: Efficient history fetching and parsing with React Query
- **Performance**: Client-side FIFO engine with caching for large histories
- **Demo Mode**: Full interactive calculator with realistic sample trades

See catalog standards for WAX rate limiting and history best practices.

---

## Demo & Usage

- Explore pre-loaded sample trade histories
- Connect wallet for personal FIFO calculations
- View detailed cost basis and gains breakdowns
- Export reports as CSV or detailed ledgers
- Adjust parameters for different reporting periods

Designed for immediate practical value.

---

## Customization

- Adjust FIFO rules or reporting formats
- Add support for specific asset types or custom events
- Integrate with other compliance or accounting tools in the catalog
- Customize output and branding

---

## Roadmap

- v1: Core FIFO engine + reports + demo
- v1.1: Advanced filtering, multi-period reports, and batch processing
- Future: Deeper integration with tax export and compliance tools

---

## Contributing & Credits

Built with care for accurate on-chain accounting tools on WAX.

MIT License.

Following the production-quality educational standards from the gkniftyheads-tracker.

---

*Pixel Journey — Making Web3 interfaces pixel-perfect and delightful.*