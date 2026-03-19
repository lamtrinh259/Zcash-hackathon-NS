"use client";

import { PayoutStatusBadge } from "@/components/PayoutStatusBadge";
import type { ValidatedRow } from "@/lib/payroll";

type Props = {
  rows: ValidatedRow[];
  testTxConfirmed?: Record<string, boolean>;
  onToggleTestTx?: (contractorId: string) => void;
  showValidation?: boolean;
};

export function ImportReviewTable({ rows, testTxConfirmed = {}, onToggleTestTx, showValidation = true }: Props) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
        <div>
          <p className="text-lg font-semibold text-ink">Contractor batch</p>
          <p className="text-sm text-ink/60">Imported rows, validation state, and test transaction gating.</p>
        </div>
        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-ink/70">{rows.length} rows</div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-ink/60">
            <tr>
              <th className="px-6 py-3 font-medium">Contractor</th>
              <th className="px-6 py-3 font-medium">Amount</th>
              <th className="px-6 py-3 font-medium">Destination</th>
              <th className="px-6 py-3 font-medium">Test tx</th>
              <th className="px-6 py-3 font-medium">State</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isValid = row.issues.length === 0;
              const testConfirmed = testTxConfirmed[row.contractorId];
              const gatingStatus = !row.requiresTestTxBoolean
                ? "Not needed"
                : testConfirmed
                  ? "Confirmed"
                  : "Required";

              return (
                <tr key={`${row.contractorId}-${row.rowNumber}`} className="border-t border-slate-100 align-top text-ink/80">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-ink">{row.name || "Missing name"}</p>
                    <p className="text-xs text-ink/50">
                      {row.contractorId || `Row ${row.rowNumber}`} · {row.role || "Missing role"} · {row.country || "Missing country"}
                    </p>
                    {showValidation && row.issues.length > 0 ? (
                      <div className="mt-2 space-y-1">
                        {row.issues.map((issue) => (
                          <p key={`${row.rowNumber}-${issue.field}-${issue.message}`} className="text-xs text-rose-700">
                            {issue.field}: {issue.message}
                          </p>
                        ))}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-ink">
                      ${Number.isFinite(row.usdAmountNumber) ? row.usdAmountNumber.toLocaleString() : row.usdAmount}
                    </p>
                    <p className="text-xs text-ink/50">{isValid ? `${row.zecAmount.toFixed(8)} ZEC` : "No conversion until valid"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-mono text-xs text-ink/70">{row.wallet || "Missing wallet"}</p>
                    <p className="mt-1 text-xs text-ink/50">{row.memo || "Missing payout memo"}</p>
                  </td>
                  <td className="px-6 py-4">
                    {row.requiresTestTxBoolean ? (
                      <button
                        type="button"
                        onClick={() => onToggleTestTx?.(row.contractorId)}
                        className={`rounded-full px-3 py-2 text-xs font-semibold ${
                          testConfirmed ? "bg-mint text-pine" : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {gatingStatus}
                      </button>
                    ) : (
                      <span className="text-xs text-ink/50">{gatingStatus}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <PayoutStatusBadge status={isValid ? (row.requiresTestTxBoolean && !testConfirmed ? "Needs review" : "Ready") : "Needs review"} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
