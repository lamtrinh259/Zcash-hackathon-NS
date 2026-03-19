import { AppShell } from "@/components/AppShell";
import { PayrollOpsProvider } from "@/components/PayrollOpsProvider";
import { TeamImportView } from "@/components/PayrollViews";

export default function TeamPage() {
  return (
    <AppShell eyebrow="Team Import" title="Upload or stage contractor records before payroll review">
      <PayrollOpsProvider>
        <TeamImportView />
      </PayrollOpsProvider>
    </AppShell>
  );
}
