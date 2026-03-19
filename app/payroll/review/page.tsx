import { AppShell } from "@/components/AppShell";
import { PayrollOpsProvider } from "@/components/PayrollOpsProvider";
import { ReviewView } from "@/components/PayrollViews";

export default function PayrollReviewPage() {
  return (
    <AppShell eyebrow="Approval" title="Review the run, confirm exceptions, and approve the payout batch">
      <PayrollOpsProvider>
        <ReviewView />
      </PayrollOpsProvider>
    </AppShell>
  );
}
