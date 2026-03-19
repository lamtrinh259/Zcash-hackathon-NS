import { Contractor } from "../data/mockData";
import { PayoutStatusBadge } from "./PayoutStatusBadge";

export function ContractorTable({ rows }: { rows: Contractor[] }) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
        <div>
          <p className="text-lg font-semibold text-ink">Contractor roster</p>
          <p className="text-sm text-ink/60">Seeded data for demo import and payroll review.</p>
        </div>
        <button className="rounded-full bg-pine px-4 py-2 text-sm font-semibold text-white">Export CSV</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-ink/60">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 font-medium">Country</th>
              <th className="px-6 py-3 font-medium">Gross</th>
              <th className="px-6 py-3 font-medium">Wallet</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100 text-ink/80">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-ink">{row.name}</p>
                    <p className="text-xs text-ink/50">{row.id}</p>
                  </div>
                </td>
                <td className="px-6 py-4">{row.role}</td>
                <td className="px-6 py-4">{row.country}</td>
                <td className="px-6 py-4">
                  <p>${row.fiatAmount.toLocaleString()}</p>
                  <p className="text-xs text-ink/50">{row.zecAmount} ZEC</p>
                </td>
                <td className="px-6 py-4 font-mono text-xs">{row.wallet}</td>
                <td className="px-6 py-4">
                  <PayoutStatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
