"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  SAMPLE_CSV,
  SAMPLE_RATE,
  buildArtifacts,
  buildBatchSummary,
  payoutStatusForIndex,
  validateRows
} from "@/lib/payroll";

const STORAGE_KEY = "zec-payroll-tool-state";

type StoredState = {
  csvText: string;
  rate: number;
  testTxConfirmed: Record<string, boolean>;
  approvedAt: string | null;
};

type PayrollOpsContextValue = {
  csvText: string;
  rate: number;
  approvedAt: string | null;
  rows: ReturnType<typeof validateRows>;
  validRows: ReturnType<typeof validateRows>;
  readyRows: ReturnType<typeof validateRows>;
  heldRows: ReturnType<typeof validateRows>;
  invalidRows: ReturnType<typeof validateRows>;
  summary: ReturnType<typeof buildBatchSummary>;
  artifacts: ReturnType<typeof buildArtifacts>;
  testTxConfirmed: Record<string, boolean>;
  payoutRows: Array<ReturnType<typeof validateRows>[number] & { payoutStatus: ReturnType<typeof payoutStatusForIndex> }>;
  setCsvText: (value: string) => void;
  setRate: (value: number) => void;
  loadSampleCsv: () => void;
  toggleTestTx: (contractorId: string) => void;
  approveBatch: () => void;
  resetBatch: () => void;
};

const PayrollOpsContext = createContext<PayrollOpsContextValue | null>(null);

function defaultState(): StoredState {
  return {
    csvText: SAMPLE_CSV,
    rate: SAMPLE_RATE,
    testTxConfirmed: { "CTR-301": true },
    approvedAt: null
  };
}

function readStoredState(): StoredState {
  if (typeof window === "undefined") {
    return defaultState();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return defaultState();
  }

  try {
    return JSON.parse(raw) as StoredState;
  } catch {
    return defaultState();
  }
}

export function PayrollOpsProvider({ children }: { children: ReactNode }) {
  const [csvText, setCsvTextState] = useState(SAMPLE_CSV);
  const [rate, setRateState] = useState(SAMPLE_RATE);
  const [testTxConfirmed, setTestTxConfirmed] = useState<Record<string, boolean>>({ "CTR-301": true });
  const [approvedAt, setApprovedAt] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const stored = readStoredState();
    setCsvTextState(stored.csvText);
    setRateState(stored.rate);
    setTestTxConfirmed(stored.testTxConfirmed);
    setApprovedAt(stored.approvedAt);
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    const stored: StoredState = {
      csvText,
      rate,
      testTxConfirmed,
      approvedAt
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }, [approvedAt, csvText, hasLoaded, rate, testTxConfirmed]);

  const rows = validateRows(csvText, rate);
  const validRows = rows.filter((row) => row.issues.length === 0);
  const readyRows = validRows.filter((row) => !row.requiresTestTxBoolean || testTxConfirmed[row.contractorId]);
  const heldRows = validRows.filter((row) => row.requiresTestTxBoolean && !testTxConfirmed[row.contractorId]);
  const invalidRows = rows.filter((row) => row.issues.length > 0);
  const summary = buildBatchSummary(rows, testTxConfirmed);
  const artifacts = buildArtifacts(readyRows, rate, approvedAt);
  const payoutRows = readyRows.map((row, index) => ({
    ...row,
    payoutStatus: payoutStatusForIndex(index, approvedAt)
  }));

  const value = useMemo(
    () => ({
      csvText,
      rate,
      approvedAt,
      rows,
      validRows,
      readyRows,
      heldRows,
      invalidRows,
      summary,
      artifacts,
      testTxConfirmed,
      payoutRows,
      setCsvText(value: string) {
        setApprovedAt(null);
        setCsvTextState(value);
      },
      setRate(value: number) {
        setApprovedAt(null);
        setRateState(value);
      },
      loadSampleCsv() {
        setApprovedAt(null);
        setCsvTextState(SAMPLE_CSV);
      },
      toggleTestTx(contractorId: string) {
        setApprovedAt(null);
        setTestTxConfirmed((current) => ({
          ...current,
          [contractorId]: !current[contractorId]
        }));
      },
      approveBatch() {
        setApprovedAt(new Date().toISOString());
      },
      resetBatch() {
        setApprovedAt(null);
      }
    }),
    [approvedAt, artifacts, csvText, heldRows, invalidRows, payoutRows, rate, readyRows, rows, summary, testTxConfirmed, validRows]
  );

  return <PayrollOpsContext.Provider value={value}>{children}</PayrollOpsContext.Provider>;
}

export function usePayrollOps() {
  const context = useContext(PayrollOpsContext);

  if (!context) {
    throw new Error("usePayrollOps must be used within PayrollOpsProvider");
  }

  return context;
}
