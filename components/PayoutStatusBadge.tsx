const badgeStyles = {
  Ready: "bg-mint text-pine",
  "Needs review": "bg-amber-100 text-amber-700",
  "Pending docs": "bg-rose-100 text-rose-700",
  Draft: "bg-slate-100 text-slate-700",
  "Awaiting approval": "bg-amber-100 text-amber-700",
  Broadcasting: "bg-sky-100 text-sky-700",
  Settled: "bg-mint text-pine",
  Queued: "bg-slate-100 text-slate-700",
  Confirmed: "bg-mint text-pine",
  "Receipt shared": "bg-violet-100 text-violet-700",
  Pending: "bg-slate-100 text-slate-700"
} as const;

export function PayoutStatusBadge({ status }: { status: keyof typeof badgeStyles }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeStyles[status]}`}>
      {status}
    </span>
  );
}
