import { AppShell } from "../../../components/AppShell";
import { PayrollOpsProvider } from "../../../components/PayrollOpsProvider";
import { RunBuilderView } from "../../../components/PayrollViews";

export default function CreatePayrollPage() {
  return (
    <AppShell eyebrow="Run Builder" title="Create a batched payroll run for your next contractor cycle">
      <PayrollOpsProvider>
        <RunBuilderView />
      </PayrollOpsProvider>
    </AppShell>
  );
}
