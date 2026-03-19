import test from "node:test";
import assert from "node:assert/strict";
import {
  buildArtifacts,
  buildBatchSummary,
  convertUsdToZec,
  generateZip321HandoffText,
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

test("generateZip321Uri preserves ZIP-321 parameter grouping and index order", () => {
  const rows = validateRows(VALID_CSV, 25);
  const uri = generateZip321Uri(rows);

  assert.match(uri, /^zcash:\?/);

  const query = uri.slice("zcash:?".length);
  const params = query.split("&");

  assert.deepEqual(params, [
    "address=u1adalovelace1234567890abcdef",
    "amount=4.00000000",
    "memo=Payroll%2C%20March",
    "address.1=u1gracehopper1234567890abcdef",
    "amount.1=2.00000000",
    "memo.1=Second%20payout"
  ]);
});

test("generateZip321Uri percent-encodes memo edge cases without changing recipient order", () => {
  const csv = `contractorId,name,role,country,usdAmount,wallet,requiresTestTx,memo
CTR-1,Ada Lovelace,Engineer,UK,100,u1adalovelace1234567890abcdef,false,"Ops & payroll / March? #1 + coffee"
CTR-2,Grace Hopper,QA,US,50,u1gracehopper1234567890abcdef,false,"Quoted ""memo"" with % and emoji rocket"`;
  const rows = validateRows(csv, 25);
  const uri = generateZip321Uri(rows);

  assert.ok(uri.includes("memo=Ops%20%26%20payroll%20%2F%20March%3F%20%231%20%2B%20coffee"));
  assert.ok(uri.includes("memo.1=Quoted%20%22memo%22%20with%20%25%20and%20emoji%20rocket"));
  assert.ok(uri.indexOf("address=u1adalovelace1234567890abcdef") < uri.indexOf("address.1=u1gracehopper1234567890abcdef"));
});

test("generateZip321Uri formats decimal amounts to exactly 8 places", () => {
  const csv = `contractorId,name,role,country,usdAmount,wallet,requiresTestTx,memo
CTR-1,Ada Lovelace,Engineer,UK,1,u1adalovelace1234567890abcdef,false,Small amount
CTR-2,Grace Hopper,QA,US,2,u1gracehopper1234567890abcdef,false,Second payout`;
  const rows = validateRows(csv, 3);
  const uri = generateZip321Uri(rows);

  assert.ok(uri.includes("amount=0.33333333"));
  assert.ok(uri.includes("amount.1=0.66666667"));
  assert.equal(uri.includes("amount=0.333333333"), false);
});

test("generateZip321Uri returns an empty string for empty recipient batches", () => {
  assert.equal(generateZip321Uri([]), "");
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

test("generateZip321HandoffText includes required mobile signing instructions and manual validation caveat", () => {
  const rows = validateRows(VALID_CSV, 25);
  const handoffText = generateZip321HandoffText(rows, 25, "2026-03-19T00:00:00.000Z");

  assert.ok(handoffText.includes("This artifact is for mobile wallet handoff only."));
  assert.ok(handoffText.includes("Zodl mainnet validation remains a manual mobile-wallet check before signing."));
  assert.ok(handoffText.includes("1. Open Zodl on a mobile device."));
  assert.ok(handoffText.includes("2. Transfer the URI below by copy/paste, AirDrop, email, chat, or QR from another device."));
  assert.ok(handoffText.includes("3. Review every recipient, amount, and memo in Zodl on mainnet."));
  assert.ok(handoffText.includes("4. Sign in Zodl only after that manual mobile validation."));
  assert.ok(handoffText.includes("ZIP-321 URI:"));
  assert.ok(handoffText.includes(generateZip321Uri(rows)));
});

test("buildArtifacts keeps empty-batch handoff artifacts explicit without emitting a malformed URI", () => {
  const artifacts = buildArtifacts([], 25, null);

  assert.equal(artifacts.zip321Uri, "");
  assert.ok(artifacts.handoffText.includes("Approved at: Not approved"));
  assert.ok(artifacts.handoffText.includes("Recipients: 0"));
  assert.ok(artifacts.handoffText.includes("Total USD: 0.00"));
  assert.ok(artifacts.handoffText.includes("Total ZEC: 0.00000000"));
  assert.match(artifacts.auditLog, /"recipients": \[\]/);
});
