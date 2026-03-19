# ZEC Payroll Tool

Hackathon MVP for privacy-preserving contractor payout ops using ZEC. The app focuses on importing contractor payout data, validating it, converting USD obligations into ZEC at an admin-entered rate, generating a mocked ZIP-321 batch, and exporting demo-ready artifacts.

## Framing

This is crypto payout ops for contractor batches.
It is not payroll compliance software, HRIS, tax tooling, or live chain infrastructure.

## Implemented MVP flow

- CSV upload or paste import
- row-level validation errors
- admin-entered USD to ZEC conversion
- payroll batch preview
- per-recipient test transaction gating
- ZIP-321 URI generation
- exportable URI text and JSON audit log
- mocked payout monitor and contractor receipt views

## Setup

Use Node `22` or newer. The repo includes `.nvmrc`, `.npmrc`, and a committed `package-lock.json` so fresh installs resolve the same toolchain and still pull dev dependencies even if `NODE_ENV=production` is set in the shell.

1. Run `npm install`.
2. Run `npm test`.
3. Run `npm run build`.
4. Run `npm run dev`.
5. Open `http://localhost:3000`.

## Demo data

- `Load happy-path sample` seeds a clean run that can move from import to approval and export without edits.
- `Load validation edge cases` restores the intentionally broken rows for row-level validation demos.

## Demo script

1. On `/`, frame the product as private contractor payout ops using ZEC.
2. On `/team`, upload the sample CSV or edit the pasted seed data and point out the row-level errors.
3. On `/payroll/create`, adjust the admin USD/ZEC rate and show the batch totals recalculate.
4. On `/payroll/review`, confirm required test transactions per recipient and approve the mocked batch.
5. On `/payouts`, show the generated ZIP-321 text artifact and JSON audit log export.
6. On `/receipts`, show the contractor-facing receipt language and payout history.

## What is mocked

- ZEC price discovery and FX inputs
- wallet validation depth beyond simple formatting checks
- payout approval effects, queueing, confirmations, and receipts
- any real chain broadcast, wallet signing, or custody flow
- payroll tax, withholding, classification, and local compliance logic
