import { AppShell } from "../../components/AppShell";
import { PayrollOpsProvider } from "../../components/PayrollOpsProvider";
import { PayoutsView } from "../../components/PayrollViews";

export default function PayoutsPage() {
  return (
    <AppShell eyebrow="Monitoring" title="Track the simulated payout queue and confirmation timeline">
      <PayrollOpsProvider>
        <PayoutsView />
      </PayrollOpsProvider>
    </AppShell>
  );
}
