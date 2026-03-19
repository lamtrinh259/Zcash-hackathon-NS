import test from "node:test";
import assert from "node:assert/strict";
import {
  buildArtifacts,
  buildBatchSummary,
  convertUsdToZec,
  generateZip321Uri,
  getWorkflowGate,
  parseCsv,
  validateRows
} from "./payroll.ts";

const VALID_CSV = `contractorId,name,role,country,usdAmount,wallet,requiresTestTx,memo
CTR-1,Ada Lovelace,Engineer,UK,100,u1adalovelace1234567890abcdef,true,"Payroll, March"
CTR-2,Grace Hopper,QA,US,50,u1gracehopper1234567890abcdef,false,Second payout`;

test("parseCsv parses quoted comma fields and keeps row numbers aligned to CSV lines", () => {
  const rows = parseCsv(VALID_CSV);

  assert.equal(rows.length, 2);
  assert.equal(rows[0].contractorId, "CTR-1");
  assert.equal(rows[0].memo, "Payroll, March");
  assert.equal(rows[0].rowNumber, 2);
});

test("validateRows reports invalid amounts, wallets, booleans, and duplicate identifiers", () => {
  const csv = `contractorId,name,role,country,usdAmount,wallet,requiresTestTx,memo
CTR-1,Ada Lovelace,Engineer,UK,-5,u1validwallet1234567890abcdef,yes,First
CTR-1,Grace Hopper,QA,US,25,u1validwallet1234567890abcdef,false,Second`;

  const rows = validateRows(csv, 25);
  const firstIssueFields = rows[0].issues.map((issue) => issue.field);
  const secondIssueMessages = rows[1].issues.map((issue) => issue.message);

  assert.ok(firstIssueFields.includes("usdAmount"));
  assert.ok(firstIssueFields.includes("requiresTestTx"));
  assert.ok(secondIssueMessages.includes("Duplicate contractor ID. First seen on row 2."));
  assert.ok(secondIssueMessages.includes("Duplicate wallet. First seen on row 2."));
});

test("convertUsdToZec converts and rounds to 8 decimals", () => {
  assert.equal(convertUsdToZec(100, 31.84), 3.14070352);
});

test("convertUsdToZec returns zero when the rate is not positive", () => {
  assert.equal(convertUsdToZec(100, 0), 0);
});

test("generateZip321Uri builds indexed ZIP-321 params for multi-recipient batches", () => {
  const rows = validateRows(VALID_CSV, 25);
  const uri = generateZip321Uri(rows);

  assert.ok(uri.includes("zcash:?"));
  assert.ok(uri.includes("address=u1adalovelace1234567890abcdef"));
  assert.ok(uri.includes("amount=4.00000000"));
  assert.ok(uri.includes("memo=Payroll%2C%20March"));
  assert.ok(uri.includes("address.1=u1gracehopper1234567890abcdef"));
  assert.ok(uri.includes("amount.1=2.00000000"));
});

test("workflow gating blocks finalization until required test transactions are confirmed", () => {
  const rows = validateRows(VALID_CSV, 25);

  const beforeConfirmation = getWorkflowGate(rows, {});
  assert.equal(beforeConfirmation.readyRows.length, 1);
  assert.equal(beforeConfirmation.heldRows.length, 1);
  assert.equal(beforeConfirmation.canFinalize, false);

  const afterConfirmation = getWorkflowGate(rows, { "CTR-1": true });
  assert.equal(afterConfirmation.readyRows.length, 2);
  assert.equal(afterConfirmation.heldRows.length, 0);
  assert.equal(afterConfirmation.canFinalize, true);
});

test("workflow gating surfaces invalid rows as a finalization blocker", () => {
  const rows = validateRows(`${VALID_CSV}\nCTR-3,,,US,10,bad,false,`, 25);
  const gate = getWorkflowGate(rows, { "CTR-1": true });

  assert.equal(gate.invalidRows.length, 1);
  assert.equal(gate.canFinalize, false);
  assert.ok(gate.blockers[0].includes("still failing validation"));
});

test("artifact helpers build summary totals and a JSON audit artifact from ready rows", () => {
  const rows = validateRows(VALID_CSV, 25);
  const confirmed = { "CTR-1": true };
  const summary = buildBatchSummary(rows, confirmed);
  const readyRows = getWorkflowGate(rows, confirmed).readyRows;
  const artifacts = buildArtifacts(readyRows, 25, "2026-03-19T00:00:00.000Z");
  const audit = JSON.parse(artifacts.auditLog) as {
    approvedAt: string;
    rateUsdPerZec: number;
    recipients: Array<{ contractorId: string; requiresTestTx: boolean }>;
  };

  assert.deepEqual(summary, {
    totalRows: 2,
    validRows: 2,
    invalidRows: 0,
    readyRows: 2,
    heldRows: 0,
    totalUsd: 150,
    totalZec: 6
  });
  assert.equal(audit.approvedAt, "2026-03-19T00:00:00.000Z");
  assert.equal(audit.rateUsdPerZec, 25);
  assert.equal(audit.recipients.length, 2);
  assert.equal(audit.recipients[0].contractorId, "CTR-1");
  assert.equal(audit.recipients[0].requiresTestTx, true);
  assert.equal(audit.recipients[1].contractorId, "CTR-2");
  assert.equal(audit.recipients[1].requiresTestTx, false);
  assert.ok(artifacts.zip321Uri.includes("address.1=u1gracehopper1234567890abcdef"));
  assert.ok(artifacts.handoffText.includes("Zodl mobile signing handoff"));
  assert.ok(artifacts.handoffText.includes(artifacts.zip321Uri));
});
