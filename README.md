# ZEC Payroll Tool

Hackathon MVP for privacy-preserving contractor payout ops using ZEC. The app turns contractor payout data into a reviewable batch, validates recipients and amounts, converts USD-denominated obligations into ZEC at an admin-entered rate, enforces per-recipient test transactions, and generates a spec-compliant ZIP-321 multi-payment URI plus exportable audit artifacts — including a scannable QR code for direct Zodl mobile handoff.

## Framing

This is crypto payout ops for contractor batches.
It is not payroll compliance software, HRIS, tax tooling, or live chain infrastructure.

For this hackathon prototype, the strongest implemented path is:

1. import a CSV or paste payout rows
2. validate recipients and amounts
3. preview the batch and ZEC totals at an admin-entered rate (default: $250 / ZEC)
4. gate final approval on required test transactions
5. generate a spec-compliant ZIP-321 multi-payment URI
6. scan the QR code in **Zodl mobile** or copy/paste the URI for signing

## What is implemented now

### Core workflow

- CSV upload or paste import
- row-level validation errors
- duplicate contractor and wallet detection
- admin-entered USD to ZEC conversion (default rate: $250 / ZEC)
- payroll batch preview
- per-recipient test transaction gating
- ZIP-321 multi-recipient URI generation, spec-compliant:
  - first recipient address as the URI path component (`zcash:<addr>?...`)
  - subsequent recipients as indexed query params (`address.N=`, `amount.N=`, `memo.N=`)
  - memo values base64url-encoded per RFC 4648 §5 (no padding), as required by Zodl
- QR code rendered from the ZIP-321 URI for direct Zodl mobile scanning
- exportable URI text and JSON audit log
- mocked payout monitor and contractor receipt views

### Product surfaces

- landing page
- employer dashboard
- team import/review flow
- payroll create flow (with treasury planner conversion widget)
- payroll review / approval flow
- payouts view with ZIP-321 QR code and artifact export
- receipts view

### Verification

The repo includes automated tests for the core logic:

- CSV parsing
- validation failures
- duplicate detection
- USD to ZEC conversion
- ZIP-321 generation and parameter ordering
- base64url memo encoding (spec compliance)
- approval gating
- audit artifact generation

Run them with:

```
npm test
```

## Zodl signing handoff

Zodl wallet is treated as a **mobile-only signing target**.
This prototype does **not** pretend signing happens inside the browser.

The intended demo flow is:

1. approve the batch on `/payroll/review`
2. go to `/payouts` — the ZIP-321 URI is generated immediately
3. **scan the QR code** with the Zodl app on mobile, or copy/paste the URI
4. review recipients and amounts in Zodl, then sign on the mobile device

The QR code encodes the full ZIP-321 URI with base64url-encoded memos, which Zodl can parse directly.

## Setup

Use Node `22` or newer. The repo includes `.nvmrc`, `.npmrc`, and a committed `package-lock.json` so fresh installs resolve the same toolchain and still pull dev dependencies even if `NODE_ENV=production` is set in the shell.

1. Run `npm install`.
2. Run `npm test`.
3. Run `npm run build`.
4. Run `npm run dev`.
5. Open `http://localhost:3000`.

## Demo data

- `Load happy-path sample` seeds a clean run that can move from import to approval and export without edits.
- `Load validation edge cases` restores intentionally broken rows for validation demos.
- On the `/team` page: **Continue to batch preview** (green) advances the workflow; other buttons are secondary actions.

## Demo script

1. On `/`, frame the product as private contractor payout ops using ZEC.
2. On `/team`, upload the sample CSV or edit the pasted seed data and point out row-level validation issues. Click **Continue to batch preview** when ready.
3. On `/payroll/create`, adjust the admin USD/ZEC rate (default $250) and show the batch totals recalculate live in the conversion widget.
4. On `/payroll/review`, confirm required test transactions per recipient and show that approval is blocked until required confirmations exist.
5. On `/payouts`, show the generated ZIP-321 QR code — scan it with Zodl on a phone. Also show the JSON audit log export.
6. On `/receipts`, show the contractor-facing receipt language and payout history.

## What is mocked or intentionally simplified

- Zodl signing is represented as a QR/handoff flow, not in-browser wallet execution
- Zodl + NEAR intents for USDC payouts are not fully implemented yet
- biweekly reminder / scheduler flow is not fully implemented yet
- server-side end-to-end encryption is not fully implemented yet
- ZEC price discovery and FX inputs are admin-entered
- wallet validation goes only as deep as a lightweight format sanity check
- payout approval effects, queueing, confirmations, and receipts are prototype-level
- payroll tax, withholding, classification, and local compliance logic are out of scope

## Why this still fits the track

The core Earn use case is paying people for digital work with shielded ZEC while reducing payout mistakes and adding low-trust operational safeguards.

This prototype already demonstrates the most important proof point:

- a payroll batch can be generated from CSV
- validated and reviewed
- gated on test transactions
- converted into a spec-compliant ZIP-321 multi-payment request
- handed off to Zodl mobile via QR code scan

That is a solid functional prototype for the track.
