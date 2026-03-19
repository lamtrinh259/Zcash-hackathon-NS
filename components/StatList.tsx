export function StatList({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <dt className="text-sm text-ink/60">{item.label}</dt>
          <dd className="mt-2 text-2xl font-semibold text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
