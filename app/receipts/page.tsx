import { AppShell } from "@/components/AppShell";
import { PayrollOpsProvider } from "@/components/PayrollOpsProvider";
import { ReceiptsView } from "@/components/PayrollViews";

export default function ReceiptsPage() {
  return (
    <AppShell eyebrow="Contractor Receipt" title="Give contractors a clean private record of their latest payout">
      <PayrollOpsProvider>
        <ReceiptsView />
      </PayrollOpsProvider>
    </AppShell>
  );
}
