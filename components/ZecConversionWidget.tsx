import { conversionScenarios } from "../data/mockData";

export function ZecConversionWidget() {
  return (
    <div className="panel p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-label">Treasury Planner</p>
          <h2 className="mt-3 text-2xl font-semibold text-ink">ZEC conversion widget</h2>
          <p className="mt-2 max-w-xl text-sm text-ink/65">
            Simulated fiat-to-ZEC estimates for pre-funding a contractor run. Rate snapshots are mocked for demo use.
          </p>
        </div>
        <div className="rounded-2xl bg-mint px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-pine/60">Indicative rate</p>
          <p className="text-2xl font-semibold text-pine">$250.00 / ZEC</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {conversionScenarios.map((scenario) => (
          <div key={scenario.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-ink/60">Fund {scenario.label}</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{scenario.zec} ZEC</p>
            <p className="mt-1 text-sm text-ink/60">Estimated fee {scenario.fee}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-pine/70">{scenario.arrival}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
