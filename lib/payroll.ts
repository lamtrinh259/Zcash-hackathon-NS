export type CsvRow = {
  contractorId: string;
  name: string;
  role: string;
  country: string;
  usdAmount: string;
  wallet: string;
  requiresTestTx: string;
  memo: string;
};

export type ValidationIssue = {
  field: keyof CsvRow;
  message: string;
};

export type ValidatedRow = CsvRow & {
  rowNumber: number;
  usdAmountNumber: number;
  requiresTestTxBoolean: boolean;
  zecAmount: number;
  issues: ValidationIssue[];
};

export type BatchSummary = {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  readyRows: number;
  heldRows: number;
  totalUsd: number;
  totalZec: number;
};

export type BatchArtifact = {
  zip321Uri: string;
  handoffText: string;
  auditLog: string;
};

export type WorkflowGate = {
  validRows: ValidatedRow[];
  readyRows: ValidatedRow[];
  heldRows: ValidatedRow[];
  invalidRows: ValidatedRow[];
  canFinalize: boolean;
  blockers: string[];
};

export const SAMPLE_RATE = 31.84;

export const SAMPLE_CSV = `contractorId,name,role,country,usdAmount,wallet,requiresTestTx,memo
CTR-301,Maya Thompson,Product Designer,United Kingdom,4200,u1mayathompson8kzt9q2l0p4x6s7v8w1y2z3a4b5c6d7e8f9g,true,March design sprint payout
CTR-302,Leonardo Costa,Frontend Engineer,Brazil,5800,u1leonardocosta1fca9q2l0p4x6s7v8w1y2z3a4b5c6d7e8f9g,false,March frontend delivery payout
CTR-303,Amaka Eze,QA Lead,Nigeria,3200,u1amakaeze4ade9q2l0p4x6s7v8w1y2z3a4b5c6d7e8f9g,true,Regression release validation payout
CTR-304,Ryo Nishida,Data Analyst,Japan,4700,u1ryonishida6pwm9q2l0p4x6s7v8w1y2z3a4b5c6d7e8f9g,false,Analytics reporting cycle
CTR-305,Sara Ben Youssef,Content Strategist,Morocco,2600,u1sarabenyoussef0qez9q2l0p4x6s7v8w1y2z3a4b5c6d7e8f9g,true,March content strategy payout
CTR-306,Noah Kim,Growth Lead,South Korea,3900,u1noahkim2z8r9q2l0p4x6s7v8w1y2z3a4b5c6d7e8f9g,false,Growth experiments payout`;

export const REVIEW_SAMPLE_CSV = `contractorId,name,role,country,usdAmount,wallet,requiresTestTx,memo
CTR-301,Maya Thompson,Product Designer,United Kingdom,4200,u1mayathompson8kzt9q2l0p4x6s7v8w1y2z3a4b5c6d7e8f9g,true,March design sprint payout
CTR-302,Leonardo Costa,Frontend Engineer,Brazil,5800,u1leonardocosta1fca9q2l0p4x6s7v8w1y2z3a4b5c6d7e8f9g,false,March frontend delivery payout
CTR-303,Amaka Eze,QA Lead,Nigeria,3200,invalid_wallet,true,Manual address confirmation needed
CTR-304,Ryo Nishida,Data Analyst,Japan,4700,u1ryonishida6pwm9q2l0p4x6s7v8w1y2z3a4b5c6d7e8f9g,false,Analytics reporting cycle
CTR-305,Sara Ben Youssef,Content Strategist,Morocco,-2600,u1sarabenyoussef0qez9q2l0p4x6s7v8w1y2z3a4b5c6d7e8f9g,true,Negative amount should fail validation
CTR-306,Noah Kim,Growth Lead,South Korea,3900,u1noahkim2z8r9q2l0p4x6s7v8w1y2z3a4b5c6d7e8f9g,false,Growth experiments payout`;

const HEADERS: Array<keyof CsvRow> = [
  "contractorId",
  "name",
  "role",
  "country",
  "usdAmount",
  "wallet",
  "requiresTestTx",
  "memo"
];

function parseLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === "\"") {
      const nextCharacter = line[index + 1];

      if (inQuotes && nextCharacter === "\"") {
        current += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (character === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  values.push(current.trim());

  return values;
}

function isLikelyShieldedAddress(wallet: string) {
  return /^u[0-9a-z]{24,}$/i.test(wallet);
}

function toBoolean(value: string) {
  return value.trim().toLowerCase() === "true";
}

export function convertUsdToZec(usdAmount: number, rate: number) {
  if (rate <= 0) {
    return 0;
  }

  return Number((usdAmount / rate).toFixed(8));
}

export function parseCsv(csvText: string) {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  const rows = lines.slice(1);

  return rows.map((line, rowIndex) => {
    const values = parseLine(line);
    const row = HEADERS.reduce(
      (record, header, valueIndex) => {
        record[header] = values[valueIndex] ?? "";
        return record;
      },
      {} as CsvRow
    );

    return {
      ...row,
      rowNumber: rowIndex + 2
    };
  });
}

export function validateRows(csvText: string, rate: number) {
  const rows = parseCsv(csvText);
  const contractorIdSeen = new Map<string, number>();
  const walletSeen = new Map<string, number>();

  return rows.map((row) => {
    const issues: ValidationIssue[] = [];
    const usdAmountNumber = Number(row.usdAmount);
    const requiresTestTxBoolean = toBoolean(row.requiresTestTx);

    if (!row.contractorId) {
      issues.push({ field: "contractorId", message: "Contractor ID is required." });
    }
    if (!row.name) {
      issues.push({ field: "name", message: "Contractor name is required." });
    }
    if (!row.role) {
      issues.push({ field: "role", message: "Role is required." });
    }
    if (!row.country) {
      issues.push({ field: "country", message: "Country is required." });
    }
    if (!Number.isFinite(usdAmountNumber) || usdAmountNumber <= 0) {
      issues.push({ field: "usdAmount", message: "USD amount must be greater than zero." });
    }
    if (!isLikelyShieldedAddress(row.wallet)) {
      issues.push({ field: "wallet", message: "Wallet must look like a shielded ZEC address." });
    }
    if (!["true", "false"].includes(row.requiresTestTx.trim().toLowerCase())) {
      issues.push({ field: "requiresTestTx", message: "Requires test tx must be true or false." });
    }
    if (!row.memo) {
      issues.push({ field: "memo", message: "Memo is required for the payout note." });
    }
    if (rate <= 0) {
      issues.push({ field: "usdAmount", message: "Admin ZEC rate must be greater than zero." });
    }

    const existingContractorId = contractorIdSeen.get(row.contractorId);
    if (row.contractorId && existingContractorId) {
      issues.push({
        field: "contractorId",
        message: `Duplicate contractor ID. First seen on row ${existingContractorId}.`
      });
    }

    const existingWallet = walletSeen.get(row.wallet);
    if (row.wallet && existingWallet) {
      issues.push({
        field: "wallet",
        message: `Duplicate wallet. First seen on row ${existingWallet}.`
      });
    }

    if (row.contractorId && !existingContractorId) {
      contractorIdSeen.set(row.contractorId, row.rowNumber);
    }
    if (row.wallet && !existingWallet) {
      walletSeen.set(row.wallet, row.rowNumber);
    }

    return {
      ...row,
      usdAmountNumber,
      requiresTestTxBoolean,
      zecAmount: convertUsdToZec(usdAmountNumber, rate),
      issues
    } satisfies ValidatedRow;
  });
}

export function getWorkflowGate(rows: ValidatedRow[], testTxConfirmed: Record<string, boolean>): WorkflowGate {
  const validRows = rows.filter((row) => row.issues.length === 0);
  const readyRows = validRows.filter((row) => !row.requiresTestTxBoolean || testTxConfirmed[row.contractorId]);
  const heldRows = validRows.filter((row) => row.requiresTestTxBoolean && !testTxConfirmed[row.contractorId]);
  const invalidRows = rows.filter((row) => row.issues.length > 0);
  const blockers: string[] = [];

  if (invalidRows.length > 0) {
    blockers.push(`${invalidRows.length} row${invalidRows.length === 1 ? "" : "s"} still failing validation.`);
  }

  if (heldRows.length > 0) {
    blockers.push(`${heldRows.length} required test transaction${heldRows.length === 1 ? "" : "s"} still unconfirmed.`);
  }

  if (readyRows.length === 0) {
    blockers.push("At least one ready recipient is required before finalizing.");
  }

  return {
    validRows,
    readyRows,
    heldRows,
    invalidRows,
    canFinalize: blockers.length === 0,
    blockers
  };
}

export function buildBatchSummary(rows: ValidatedRow[], testTxConfirmed: Record<string, boolean>) {
  const { validRows, readyRows, heldRows, invalidRows } = getWorkflowGate(rows, testTxConfirmed);

  return {
    totalRows: rows.length,
    validRows: validRows.length,
    invalidRows: invalidRows.length,
    readyRows: readyRows.length,
    heldRows: heldRows.length,
    totalUsd: readyRows.reduce((sum, row) => sum + row.usdAmountNumber, 0),
    totalZec: Number(readyRows.reduce((sum, row) => sum + row.zecAmount, 0).toFixed(8))
  } satisfies BatchSummary;
}

export function generateZip321Uri(rows: ValidatedRow[]) {
  if (rows.length === 0) {
    return "";
  }

  const params = rows.flatMap((row, index) => {
    const suffix = index === 0 ? "" : `.${index}`;
    return [
      `address${suffix}=${encodeURIComponent(row.wallet)}`,
      `amount${suffix}=${row.zecAmount.toFixed(8)}`,
      `memo${suffix}=${encodeURIComponent(row.memo)}`
    ];
  });

  return `zcash:?${params.join("&")}`;
}

export function generateAuditLog(rows: ValidatedRow[], rate: number, approvedAt: string | null) {
  return JSON.stringify(
    {
      batchId: "RUN-0319-MVP",
      approvedAt,
      mode: "mocked",
      rateUsdPerZec: rate,
      recipients: rows.map((row, index) => ({
        sequence: index + 1,
        contractorId: row.contractorId,
        name: row.name,
        country: row.country,
        usdAmount: row.usdAmountNumber,
        zecAmount: row.zecAmount,
        wallet: row.wallet,
        memo: row.memo,
        requiresTestTx: row.requiresTestTxBoolean
      }))
    },
    null,
    2
  );
}

export function generateZip321HandoffText(rows: ValidatedRow[], rate: number, approvedAt: string | null) {
  const zip321Uri = generateZip321Uri(rows);
  const totalUsd = rows.reduce((sum, row) => sum + row.usdAmountNumber, 0);
  const totalZec = Number(rows.reduce((sum, row) => sum + row.zecAmount, 0).toFixed(8));

  return [
    "ZEC Payroll Tool: Zodl mobile signing handoff",
    "",
    "This artifact is for mobile wallet handoff only.",
    "Generate the ZIP-321 URI in the demo, then move it to the Zodl mobile app for signing.",
    "",
    `Approved at: ${approvedAt ?? "Not approved"}`,
    `Recipients: ${rows.length}`,
    `Total USD: ${totalUsd.toFixed(2)}`,
    `Total ZEC: ${totalZec.toFixed(8)}`,
    `Rate USD/ZEC: ${rate.toFixed(2)}`,
    "",
    "Mobile steps:",
    "1. Open Zodl on a mobile device.",
    "2. Transfer the URI below by copy/paste, AirDrop, email, chat, or QR from another device.",
    "3. Review the recipients and amounts in Zodl, then sign there.",
    "",
    "ZIP-321 URI:",
    zip321Uri
  ].join("\n");
}

export function buildArtifacts(rows: ValidatedRow[], rate: number, approvedAt: string | null): BatchArtifact {
  return {
    zip321Uri: generateZip321Uri(rows),
    handoffText: generateZip321HandoffText(rows, rate, approvedAt),
    auditLog: generateAuditLog(rows, rate, approvedAt)
  };
}

export function payoutStatusForIndex(index: number, approvedAt: string | null) {
  if (!approvedAt) {
    return "Queued" as const;
  }

  const statuses = ["Receipt shared", "Confirmed", "Broadcasting"] as const;
  return statuses[index % statuses.length];
}
