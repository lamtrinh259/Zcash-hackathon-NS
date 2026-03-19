import { AppShell } from "@/components/AppShell";
import { PayrollOpsProvider } from "@/components/PayrollOpsProvider";
import { DashboardView } from "@/components/PayrollViews";

export default function DashboardPage() {
  return (
    <AppShell eyebrow="Employer View" title="Run global contractor payroll with one private review flow">
      <PayrollOpsProvider>
        <DashboardView />
      </PayrollOpsProvider>
    </AppShell>
  );
}
