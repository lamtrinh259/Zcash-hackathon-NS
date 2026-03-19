export type Contractor = {
  id: string;
  name: string;
  role: string;
  country: string;
  fiatAmount: number;
  zecAmount: number;
  wallet: string;
  status: "Ready" | "Needs review" | "Pending docs";
  lastPaid: string;
};

export type PayrollRun = {
  id: string;
  period: string;
  executionDate: string;
  contractors: number;
  totalUsd: number;
  totalZec: number;
  status: "Draft" | "Awaiting approval" | "Broadcasting" | "Settled";
};

export type PayoutEvent = {
  id: string;
  contractor: string;
  amountUsd: number;
  amountZec: number;
  destination: string;
  status: "Queued" | "Broadcasting" | "Confirmed" | "Receipt shared";
  eta: string;
};

export const kpis = [
  { label: "Monthly payout volume", value: "$84,920", note: "42 contractors across 11 countries" },
  { label: "Current ZEC treasury", value: "171.82 ZEC", note: "Auto-buffer for the next 2 payroll runs" },
  { label: "Average receipt delivery", value: "4 min", note: "Private payout receipt after confirmation" }
];

export const contractors: Contractor[] = [
  {
    id: "CTR-201",
    name: "Maya Thompson",
    role: "Product Designer",
    country: "United Kingdom",
    fiatAmount: 4200,
    zecAmount: 29.58,
    wallet: "u1may...8kzt",
    status: "Ready",
    lastPaid: "Mar 05"
  },
  {
    id: "CTR-202",
    name: "Leonardo Costa",
    role: "Frontend Engineer",
    country: "Brazil",
    fiatAmount: 5800,
    zecAmount: 40.86,
    wallet: "u1leo...1fca",
    status: "Ready",
    lastPaid: "Mar 05"
  },
  {
    id: "CTR-203",
    name: "Amaka Eze",
    role: "QA Lead",
    country: "Nigeria",
    fiatAmount: 3200,
    zecAmount: 22.53,
    wallet: "u1ama...4ade",
    status: "Needs review",
    lastPaid: "Feb 20"
  },
  {
    id: "CTR-204",
    name: "Ryo Nishida",
    role: "Data Analyst",
    country: "Japan",
    fiatAmount: 4700,
    zecAmount: 33.11,
    wallet: "u1ryo...6pwm",
    status: "Ready",
    lastPaid: "Mar 05"
  },
  {
    id: "CTR-205",
    name: "Sara Ben Youssef",
    role: "Content Strategist",
    country: "Morocco",
    fiatAmount: 2600,
    zecAmount: 18.31,
    wallet: "u1sar...0qez",
    status: "Pending docs",
    lastPaid: "Feb 20"
  }
];

export const payrollRuns: PayrollRun[] = [
  {
    id: "RUN-0319-A",
    period: "Mar 1 - Mar 15, 2026",
    executionDate: "Mar 19, 2026",
    contractors: 42,
    totalUsd: 84920,
    totalZec: 598.17,
    status: "Awaiting approval"
  },
  {
    id: "RUN-0305-A",
    period: "Feb 16 - Feb 29, 2026",
    executionDate: "Mar 05, 2026",
    contractors: 39,
    totalUsd: 80240,
    totalZec: 563.82,
    status: "Settled"
  },
  {
    id: "RUN-0220-A",
    period: "Feb 1 - Feb 15, 2026",
    executionDate: "Feb 20, 2026",
    contractors: 38,
    totalUsd: 77500,
    totalZec: 545.49,
    status: "Settled"
  }
];

export const payoutEvents: PayoutEvent[] = [
  {
    id: "PAYOUT-881",
    contractor: "Maya Thompson",
    amountUsd: 4200,
    amountZec: 29.58,
    destination: "u1may...8kzt",
    status: "Confirmed",
    eta: "Receipt available"
  },
  {
    id: "PAYOUT-882",
    contractor: "Leonardo Costa",
    amountUsd: 5800,
    amountZec: 40.86,
    destination: "u1leo...1fca",
    status: "Receipt shared",
    eta: "Viewed 2 min ago"
  },
  {
    id: "PAYOUT-883",
    contractor: "Amaka Eze",
    amountUsd: 3200,
    amountZec: 22.53,
    destination: "u1ama...4ade",
    status: "Broadcasting",
    eta: "1 confirmation pending"
  },
  {
    id: "PAYOUT-884",
    contractor: "Ryo Nishida",
    amountUsd: 4700,
    amountZec: 33.11,
    destination: "u1ryo...6pwm",
    status: "Queued",
    eta: "Batched for next shielded send"
  }
];

export const receiptHistory = [
  {
    id: "RCPT-1905",
    period: "Feb 16 - Feb 29, 2026",
    amountUsd: 4200,
    amountZec: 30.01,
    status: "Confirmed",
    note: "Receipt link opened from London"
  },
  {
    id: "RCPT-1919",
    period: "Mar 1 - Mar 15, 2026",
    amountUsd: 4200,
    amountZec: 29.58,
    status: "Pending",
    note: "Confirmation expected within the next block window"
  }
];

export const conversionScenarios = [
  { label: "$5,000", usd: 5000, zec: 35.21, fee: "$8.40", arrival: "Same day" },
  { label: "$12,500", usd: 12500, zec: 88.02, fee: "$18.70", arrival: "Same day" },
  { label: "$40,000", usd: 40000, zec: 281.67, fee: "$52.10", arrival: "< 24 hours" }
];
