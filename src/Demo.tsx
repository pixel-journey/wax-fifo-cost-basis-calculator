"use client";

import { useMemo, useState } from "react";
import { explainDisposal, reportToCsv, runFifo } from "./fifo";
import { SAMPLE_LEDGER } from "./fixtures";
import type { FifoPolicy } from "./types";

export function Demo() {
  const [mintBasis, setMintBasis] = useState<FifoPolicy["mintBasis"]>("unknown");
  const [transfer, setTransfer] = useState<FifoPolicy["transfer"]>("ignore");
  const policy = useMemo<FifoPolicy>(() => ({ mintBasis, transfer }), [mintBasis, transfer]);
  const result = useMemo(() => runFifo(SAMPLE_LEDGER, policy), [policy]);
  const csv = useMemo(() => reportToCsv(result), [result]);

  return (
    <main className="wrap">
      <header className="mast">
        <p className="kicker">educational-reference · not tax advice</p>
        <h1>FIFO cost basis</h1>
        <p className="lede">
          Oldest open lots are consumed first. Transfers and zero-price mints stay out of the
          ledger unless you change the policy. The sample is hand-computed, not a live wallet.
        </p>
      </header>

      <section className="policy" aria-label="Matching policy">
        <label>
          Transfers
          <select
            value={transfer}
            onChange={(event) => setTransfer(event.target.value as FifoPolicy["transfer"])}
          >
            <option value="ignore">Ignore (recommended)</option>
            <option value="dispose">Realize as a disposal</option>
          </select>
        </label>
        <label>
          Mints priced at 0
          <select
            value={mintBasis}
            onChange={(event) => setMintBasis(event.target.value as FifoPolicy["mintBasis"])}
          >
            <option value="unknown">Exclude and warn</option>
            <option value="zero">Accept 0 as cost</option>
          </select>
        </label>
        <p className="total">
          Realized gain <strong>{result.totalRealizedGain} WAX</strong>
        </p>
      </section>

      <section>
        <h2>Sample events</h2>
        <div className="table-scroll">
          <table>
            <caption>Illustrative acquires, one self-transfer, and two sales.</caption>
            <thead>
              <tr>
                <th>When</th>
                <th>Id</th>
                <th>Asset</th>
                <th>Kind</th>
                <th>Role</th>
                <th>Qty</th>
                <th>Unit price</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_LEDGER.map((event) => (
                <tr key={event.id}>
                  <td>{event.at.slice(0, 10)}</td>
                  <td>{event.id}</td>
                  <td>{event.asset}</td>
                  <td>{event.kind}</td>
                  <td>{event.role}</td>
                  <td>{event.quantity}</td>
                  <td>{event.unitPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {result.byAsset.map((report) => (
        <section key={report.asset}>
          <h2>
            {report.asset}{" "}
            <span className="gain">gain {report.realizedGain}</span>
          </h2>
          {report.matches.length === 0 ? (
            <p>No matched disposals.</p>
          ) : (
            <ul className="matches">
              {report.matches.map((match) => (
                <li key={`${match.disposalId}-${match.lotEventId}`}>
                  {explainDisposal(
                    { ...result, byAsset: [{ ...report, matches: [match] }] },
                    match.disposalId
                  )}
                </li>
              ))}
            </ul>
          )}
          <h3>Open lots</h3>
          {report.openLots.length === 0 ? (
            <p>None.</p>
          ) : (
            <ul>
              {report.openLots.map((lot) => (
                <li key={lot.eventId}>
                  {lot.quantityRemaining} remaining from {lot.eventId} at {lot.unitCost}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section>
        <h2>Warnings</h2>
        <ul>
          {result.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>CSV</h2>
        <pre>{csv}</pre>
      </section>
    </main>
  );
}
