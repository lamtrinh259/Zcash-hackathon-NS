export function PrivacyExplainer() {
  return (
    <div className="panel p-6">
      <p className="section-label">Why ZEC</p>
      <h2 className="mt-3 text-2xl font-semibold text-ink">Privacy-preserving payout receipts</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="font-semibold text-ink">Shield contractor destinations</p>
          <p className="mt-2 text-sm text-ink/65">
            The demo frames ZEC as a way to avoid broadcasting contractor payout details to the full internet.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="font-semibold text-ink">Share receipts privately</p>
          <p className="mt-2 text-sm text-ink/65">
            Each payout event ends with a receipt screen that is designed for a contractor, not a block explorer.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="font-semibold text-ink">Batch global contractor runs</p>
          <p className="mt-2 text-sm text-ink/65">
            Employers review one batched payroll run, then monitor a simulated queue and confirmation timeline.
          </p>
        </div>
      </div>
    </div>
  );
}
