import Link from "next/link";
import { ReactNode } from "react";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/team", label: "Team Import" },
  { href: "/payroll/create", label: "Create Run" },
  { href: "/payroll/review", label: "Review" },
  { href: "/payouts", label: "Payouts" },
  { href: "/receipts", label: "Receipts" }
];

export function AppShell({
  title,
  eyebrow,
  children
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pine text-lg font-semibold text-lime">
            ZP
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pine/60">ZEC Payroll Tool</p>
            <p className="text-sm text-ink/70">Private payout ops for global contractors</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-2 rounded-full border border-white/70 bg-white/70 p-2 text-sm font-medium text-ink/70 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 transition hover:bg-pine hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-6 pb-12 lg:px-10">
        <div className="mb-8">
          <p className="section-label">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink lg:text-5xl">{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
}
