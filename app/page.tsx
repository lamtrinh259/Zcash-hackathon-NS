import Link from "next/link";
import { PrivacyExplainer } from "@/components/PrivacyExplainer";
import { PayrollSummaryCards } from "@/components/PayrollSummaryCards";
import { ZecConversionWidget } from "@/components/ZecConversionWidget";
import { kpis } from "@/data/mockData";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <section className="mx-auto max-w-7xl px-6 pb-12 pt-8 lg:px-10 lg:pt-12">
        <div className="panel relative overflow-hidden p-8 lg:p-12">
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-grid bg-[size:24px_24px] opacity-60 lg:block" />
          <div className="relative max-w-3xl">
            <p className="section-label">Hackathon MVP</p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight text-ink lg:text-7xl">
              Contractor payroll ops with private ZEC receipts.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-ink/70">
              A polished prototype for remote teams that need a clean batch payout workflow, private contractor receipts,
              and a ZEC-denominated treasury view without pretending to be full compliance payroll software.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard" className="rounded-full bg-pine px-6 py-3 text-sm font-semibold text-white">
                Open employer dashboard
              </Link>
              <Link
                href="/receipts"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-ink"
              >
                View contractor receipt
              </Link>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-pine p-5 text-white">
                <p className="text-sm text-white/70">Workflow</p>
                <p className="mt-2 text-2xl font-semibold">Import team, batch run, approve, monitor</p>
              </div>
              <div className="rounded-3xl bg-mint p-5">
                <p className="text-sm text-pine/70">Positioning</p>
                <p className="mt-2 text-2xl font-semibold text-pine">Crypto payout ops for remote contractors</p>
              </div>
              <div className="rounded-3xl bg-slate-100 p-5">
                <p className="text-sm text-ink/60">Scope</p>
                <p className="mt-2 text-2xl font-semibold text-ink">Simulated funds flow, strong demo UX</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <PayrollSummaryCards cards={kpis} />
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <PrivacyExplainer />
          <ZecConversionWidget />
        </div>
      </section>
    </div>
  );
}
