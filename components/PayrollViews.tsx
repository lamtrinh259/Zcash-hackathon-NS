"use client";

import Link from "next/link";
import type { ChangeEvent } from "react";
import { DownloadArtifactButton } from "./DownloadArtifactButton";
import { ImportReviewTable } from "./ImportReviewTable";
import { MobileSigningHandoff } from "./MobileSigningHandoff";
import { PayoutStatusBadge } from "./PayoutStatusBadge";
import { PayrollSummaryCards } from "./PayrollSummaryCards";
import { PrivacyExplainer } from "./PrivacyExplainer";
import { StatList } from "./StatList";
import { usePayrollOps } from "./PayrollOpsProvider";

function formatTimestamp(value: string | null) {
  if (!value) {
    return "Not approved yet";
  }

  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export function DashboardView() {
  const { summary, rate, approvedAt, invalidRows, heldRows } = usePayrollOps();

  return (
    <>
      <PayrollSummaryCards
        cards={[
          {
            label: "Imported rows",
            value: `${summary.totalRows}`,
            note: `${summary.validRows} valid, ${summary.invalidRows} blocked before payout`
          },
          {
            label: "Current admin rate",
            value: `$${rate.toFixed(2)} / ZEC`,
            note: "Manually entered for demo conversion and batch math"
          },
          {
            label: "Batch status",
            value: approvedAt ? "Approved" : "Draft",
            note: approvedAt ? `Approved ${formatTimestamp(approvedAt)}` : "Awaiting test tx confirmations and review"
          }
        ]}
      />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-ink">Current run snapshot</p>
              <p className="text-sm text-ink/60">The full flow is seeded and persisted across routes in local storage.</p>
            </div>
            <Link href="/team" className="rounded-full bg-pine px-4 py-2 text-sm font-semibold text-white">
              Continue workflow
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-ink/45">Ready now</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{summary.readyRows} recipients</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-ink/45">Held by test tx</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{heldRows.length} recipients</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-ink/45">Validation issues</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{invalidRows.length} rows</p>
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <div className="panel p-6">
            <p className="section-label">Ops Snapshot</p>
            <h2 className="mt-3 text-2xl font-semibold text-ink">Payout ops, not payroll compliance</h2>
            <p className="mt-3 text-sm text-ink/65">
              The MVP covers import, validation, conversion, gated approval, ZIP-321 generation, and exported artifacts.
              It does not cover tax withholding, local employment rules, or on-chain settlement.
            </p>
          </div>
          <div className="panel p-6">
            <p className="section-label">Projected batch</p>
            <div className="mt-5">
              <StatList
                items={[
                  { label: "Ready USD total", value: `$${summary.totalUsd.toLocaleString()}` },
                  { label: "Ready ZEC total", value: `${summary.totalZec.toFixed(8)} ZEC` },
                  { label: "Approval time", value: approvedAt ? "Captured" : "Pending" },
                  { label: "Artifacts", value: approvedAt ? "Exportable" : "Locked until approval" }
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function TeamImportView() {
  const { csvText, setCsvText, loadSampleCsv, loadReviewSampleCsv, summary, invalidRows, rows } = usePayrollOps();

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setCsvText(result);
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <div className="panel p-6">
          <p className="section-label">CSV Import</p>
          <h2 className="mt-3 text-2xl font-semibold text-ink">Upload or paste contractor payout rows</h2>
          <p className="mt-3 text-sm text-ink/65">
            Start with the approval-ready sample for the clean demo path, or switch to the edge-case sample to show row-level
            validation failures without leaving this screen.
          </p>
          <textarea
            value={csvText}
            onChange={(event) => setCsvText(event.target.value)}
            className="mt-6 h-72 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 font-mono text-xs text-ink outline-none ring-0"
          />
          <div className="mt-5 flex flex-wrap gap-3">
            <label className="cursor-pointer rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-ink">
              Upload CSV
              <input type="file" accept=".csv,text/csv" onChange={handleFileChange} className="hidden" />
            </label>
            <button type="button" onClick={loadSampleCsv} className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-ink">
              Load happy-path sample
            </button>
            <button
              type="button"
              onClick={loadReviewSampleCsv}
              className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-ink"
            >
              Load validation edge cases
            </button>
            {invalidRows.length === 0 ? (
              <Link href="/payroll/create" className="rounded-full bg-pine px-5 py-3 text-sm font-semibold text-white">
                Continue to batch preview
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-full bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-400"
              >
                Continue to batch preview
              </button>
            )}
          </div>
        </div>
        <div className="panel p-6">
          <p className="section-label">Validation</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-ink/60">Parsed rows</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{rows.length}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-ink/60">Valid rows</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{summary.validRows}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-ink/60">Blocked rows</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{summary.invalidRows}</p>
            </div>
          </div>
          <div className="mt-5 rounded-3xl bg-rose-50 p-5 text-sm text-rose-800">
            {invalidRows.length > 0
              ? `${invalidRows.length} row-level validation error${invalidRows.length === 1 ? "" : "s"} visible in the table. Please review and fix the errors before proceeding further.`
              : "All rows currently pass validation. Continue to conversion to preview the ready batch totals."}
          </div>
        </div>
      </div>
      <ImportReviewTable rows={rows} showValidation />
    </div>
  );
}

export function RunBuilderView() {
  const { rate, setRate, summary, validRows, readyRows, heldRows } = usePayrollOps();

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
      <div className="panel p-6">
        <p className="section-label">Run Parameters</p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="text-sm font-medium text-ink">
            Pay period
            <input
              readOnly
              value="Mar 1 - Mar 15, 2026"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </label>
          <label className="text-sm font-medium text-ink">
            Treasury source
            <input
              readOnly
              value="Primary ZEC operations wallet"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </label>
          <label className="text-sm font-medium text-ink">
            Admin USD / ZEC rate
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={rate}
              onChange={(event) => setRate(Number(event.target.value))}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </label>
          <label className="text-sm font-medium text-ink">
            Batch mode
            <input
              readOnly
              value="Mocked ZIP-321 grouped send"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </label>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-ink/60">Validated rows</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{validRows.length}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-ink/60">Ready after gating</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{readyRows.length}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-ink/60">Held for test tx</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{heldRows.length}</p>
          </div>
        </div>
          <div className="mt-6 rounded-3xl bg-pine p-5 text-white">
            <p className="text-sm text-white/75">Conversion preview</p>
            <p className="mt-2 text-3xl font-semibold">{summary.totalZec.toFixed(4)} ZEC</p>
            <p className="mt-2 text-sm text-white/75">
              ${summary.totalUsd.toLocaleString()} across {summary.readyRows} ready recipients using an admin-entered rate of ${rate.toFixed(2)} / ZEC.
            </p>
          </div>
        {summary.invalidRows === 0 ? (
          <div className="mt-6 rounded-3xl bg-mint p-5 text-sm text-pine">
            Validation is clean. The next step is confirming required test transactions, then approving the mocked batch.
          </div>
        ) : (
          <div className="mt-6 rounded-3xl bg-amber-50 p-5 text-sm text-amber-800">
            Resolve validation blockers before expecting a clean approval run.
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/payroll/review" className="rounded-full bg-pine px-5 py-3 text-sm font-semibold text-white">
            Continue to review
          </Link>
          <Link href="/team" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-ink">
            Back to import
          </Link>
        </div>
      </div>
      <div className="space-y-8">
        <div className="panel p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="section-label">Treasury Planner</p>
              <h2 className="mt-3 text-2xl font-semibold text-ink">Conversion widget</h2>
              <p className="mt-2 text-sm text-ink/65">
                The admin sets a manual rate for the demo. Conversion updates flow through the import table, batch preview,
                and exported artifacts immediately.
              </p>
            </div>
            <div className="rounded-2xl bg-mint px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-pine/60">Entered rate</p>
              <p className="text-2xl font-semibold text-pine">${rate.toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[5000, 12500, 40000].map((amount) => (
              <div key={amount} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-ink/60">Fund ${amount.toLocaleString()}</p>
                <p className="mt-2 text-2xl font-semibold text-ink">{(amount / rate).toFixed(4)} ZEC</p>
                <p className="mt-1 text-sm text-ink/60">Mock routing fee ${(amount * 0.0018).toFixed(2)}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-pine/70">Same-day simulated settlement</p>
              </div>
            ))}
          </div>
        </div>
        <PrivacyExplainer />
      </div>
    </div>
  );
}

export function ReviewView() {
  const { heldRows, summary, approveBatch, approvedAt, artifacts, testTxConfirmed, toggleTestTx, rows, canApproveBatch, approvalBlockers } =
    usePayrollOps();

  return (
    <div className="grid gap-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="panel p-6">
          <p className="section-label">Approval checklist</p>
          <div className="mt-5 space-y-4 text-sm text-ink/70">
            <p>1. Confirm the admin FX rate matches the treasury assumption for this run.</p>
            <p>2. Resolve row-level validation errors and confirm required test transactions.</p>
            <p>3. Approve the mocked batch to generate a ZIP-321 URI and JSON audit log.</p>
          </div>
          <div className="mt-6 rounded-3xl bg-pine p-5 text-white">
            <p className="text-sm text-white/75">Approval summary</p>
            <p className="mt-2 text-3xl font-semibold">
              {summary.readyRows} ready, {summary.invalidRows + heldRows.length} held
            </p>
            <p className="mt-2 text-sm text-white/75">
              Ready batch size: {summary.totalZec.toFixed(8)} ZEC. Approval time: {formatTimestamp(approvedAt)}.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={approveBatch}
              disabled={!canApproveBatch}
              className={`rounded-full px-5 py-3 text-sm font-semibold text-white ${
                canApproveBatch ? "bg-pine" : "cursor-not-allowed bg-slate-300"
              }`}
            >
              Approve mocked payout batch
            </button>
            <Link href="/payouts" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-ink">
              View payout artifacts
            </Link>
          </div>
          {!canApproveBatch ? (
            <div className="mt-4 rounded-3xl bg-amber-50 p-4 text-sm text-amber-800">
              {approvalBlockers.join(" ")}
            </div>
          ) : (
            <div className="mt-4 rounded-3xl bg-mint p-4 text-sm text-pine">
              All approval gates are satisfied. Approve the batch to unlock exportable payout artifacts.
            </div>
          )}
          <div className="mt-6 rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-semibold text-ink">ZIP-321 preview</p>
            <p className="mt-3 break-all font-mono text-xs text-ink/70">{artifacts.zip321Uri || "Approve the ready recipients to generate a URI."}</p>
          </div>
        </div>
        <div className="space-y-8">
          <PrivacyExplainer />
          <div className="panel p-6">
            <p className="section-label">Test transaction gating</p>
            <div className="mt-4 space-y-3 text-sm text-ink/70">
              {rows
                .filter((row) => row.issues.length === 0 && row.requiresTestTxBoolean)
                .map((row) => (
                  <div key={row.contractorId} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <div>
                      <p className="font-semibold text-ink">{row.name}</p>
                      <p className="text-xs text-ink/50">{row.contractorId}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleTestTx(row.contractorId)}
                      className={`rounded-full px-3 py-2 text-xs font-semibold ${
                        testTxConfirmed[row.contractorId] ? "bg-mint text-pine" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {testTxConfirmed[row.contractorId] ? "Test confirmed" : "Mark test tx received"}
                    </button>
                  </div>
                ))}
              {heldRows.length === 0 ? (
                <p className="rounded-2xl bg-mint p-4 text-pine">All required test transactions are confirmed.</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <ImportReviewTable rows={rows} testTxConfirmed={testTxConfirmed} onToggleTestTx={toggleTestTx} showValidation />
      {approvedAt ? (
        <div className="panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-ink">Exportable artifacts unlocked</p>
              <p className="text-sm text-ink/60">The demo keeps all payout logic mocked while still producing shareable output.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <DownloadArtifactButton
                label="Download handoff .txt"
                filename="run-0319-zodl-handoff.txt"
                content={artifacts.handoffText}
                mimeType="text/plain;charset=utf-8"
              />
              <DownloadArtifactButton
                label="Download audit log"
                filename="run-0319-mvp.json"
                content={artifacts.auditLog}
                mimeType="application/json;charset=utf-8"
              />
            </div>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <textarea readOnly value={artifacts.zip321Uri} className="h-40 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 font-mono text-xs text-ink" />
            <textarea readOnly value={artifacts.auditLog} className="h-40 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 font-mono text-xs text-ink" />
          </div>
        </div>
      ) : null}
      <MobileSigningHandoff
        zip321Uri={artifacts.zip321Uri}
        handoffText={artifacts.handoffText}
        approvedAt={approvedAt}
        recipientCount={summary.readyRows}
        totalZec={summary.totalZec}
      />
    </div>
  );
}

export function PayoutsView() {
  const { approvedAt, payoutRows, artifacts, summary } = usePayrollOps();

  return (
    <>
      <PayrollSummaryCards
        cards={[
          {
            label: "Mocked payouts queued",
            value: `${payoutRows.length}`,
            note: approvedAt ? "Derived from the approved ready batch" : "Will populate after approval"
          },
          {
            label: "ZIP-321 URI",
            value: artifacts.zip321Uri ? "Generated" : "Pending",
            note: "Exportable plain text artifact for the demo"
          },
          {
            label: "Audit log",
            value: approvedAt ? "Ready" : "Locked",
            note: "JSON export of the mocked payout batch"
          }
        ]}
      />
      <div className="panel mt-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-lg font-semibold text-ink">Payout status history</p>
            <p className="text-sm text-ink/60">Simulated event feed driven by the approved recipients list.</p>
          </div>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-ink/70">
            {approvedAt ? `Approved ${formatTimestamp(approvedAt)}` : "Batch not approved"}
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {payoutRows.length > 0 ? (
            payoutRows.map((row) => (
              <div key={row.contractorId} className="grid gap-4 px-6 py-5 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr] md:items-center">
                <div>
                  <p className="font-semibold text-ink">{row.name}</p>
                  <p className="text-xs text-ink/50">{row.contractorId}</p>
                </div>
                <div>
                  <p className="font-semibold text-ink">${row.usdAmountNumber.toLocaleString()}</p>
                  <p className="text-xs text-ink/50">{row.zecAmount.toFixed(8)} ZEC</p>
                </div>
                <div>
                  <p className="font-mono text-xs text-ink/70">{row.wallet}</p>
                  <p className="mt-1 text-xs text-ink/50">{row.memo}</p>
                </div>
                <div className="md:text-right">
                  <PayoutStatusBadge status={row.payoutStatus} />
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-10 text-sm text-ink/60">Approve the batch on the review screen to populate payout states and artifacts.</div>
          )}
        </div>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <MobileSigningHandoff
          zip321Uri={artifacts.zip321Uri}
          handoffText={artifacts.handoffText}
          approvedAt={approvedAt}
          recipientCount={payoutRows.length}
          totalZec={summary.totalZec}
        />
        <div className="panel p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-label">Artifact Export</p>
              <h2 className="mt-3 text-2xl font-semibold text-ink">JSON audit log</h2>
            </div>
            <DownloadArtifactButton
              label={approvedAt ? "Download .json" : "Download locked"}
              filename="run-0319-mvp.json"
              content={artifacts.auditLog}
              mimeType="application/json;charset=utf-8"
              disabled={!approvedAt}
            />
          </div>
          <textarea readOnly value={artifacts.auditLog} className="mt-5 h-56 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 font-mono text-xs text-ink" />
        </div>
      </div>
    </>
  );
}

export function ReceiptsView() {
  const { payoutRows, approvedAt } = usePayrollOps();
  const latestReceipt = payoutRows[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="panel p-6">
        <p className="section-label">Latest receipt</p>
        <h2 className="mt-3 text-2xl font-semibold text-ink">{latestReceipt?.name ?? "No approved recipient yet"}</h2>
        <p className="mt-2 text-sm text-ink/60">{latestReceipt ? `${latestReceipt.role} · ${latestReceipt.country}` : "Approve a batch to populate contractor receipts."}</p>
        <div className="mt-6 rounded-3xl bg-pine p-6 text-white">
          <p className="text-sm text-white/75">Payout amount</p>
          <p className="mt-2 text-4xl font-semibold">{latestReceipt ? `${latestReceipt.zecAmount.toFixed(8)} ZEC` : "0.00000000 ZEC"}</p>
          <p className="mt-2 text-white/75">
            {latestReceipt ? `$${latestReceipt.usdAmountNumber.toLocaleString()} equivalent` : "Mocked contractor receipt remains empty before approval"}
          </p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-ink/60">Pay period</p>
            <p className="mt-2 font-semibold text-ink">Mar 1 - Mar 15, 2026</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-ink/60">Receipt status</p>
            <div className="mt-2">
              <PayoutStatusBadge status={approvedAt ? "Confirmed" : "Pending"} />
            </div>
          </div>
        </div>
        <p className="mt-6 text-sm text-ink/65">
          This contractor-facing screen stays concise: payout amount, pay period, status, and destination memo without exposing raw ops detail.
        </p>
      </div>
      <div className="panel p-6">
        <p className="section-label">History</p>
        <h2 className="mt-3 text-2xl font-semibold text-ink">Recent mocked contractor receipts</h2>
        <div className="mt-6 space-y-4">
          {payoutRows.length > 0 ? (
            payoutRows.map((row) => (
              <div key={row.contractorId} className="rounded-2xl border border-slate-200 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink">{row.name}</p>
                    <p className="mt-1 text-xs text-ink/50">{row.contractorId}</p>
                  </div>
                  <PayoutStatusBadge status={row.payoutStatus === "Broadcasting" ? "Pending" : "Confirmed"} />
                </div>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-2xl font-semibold text-ink">{row.zecAmount.toFixed(8)} ZEC</p>
                    <p className="text-sm text-ink/60">${row.usdAmountNumber.toLocaleString()} equivalent</p>
                  </div>
                  <p className="text-sm text-ink/60">{row.memo}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200 p-5 text-sm text-ink/60">
              Approve a batch to generate mocked contractor receipts.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
