# ZEC Payroll Tool

## Demo Video

[![Watch the demo video](https://img.youtube.com/vi/gP2z371wl1s/maxresdefault.jpg)](https://youtu.be/gP2z371wl1s)

**Watch the demo:** https://youtu.be/gP2z371wl1s

**Demo transaction (from the video):** https://cipherscan.app/tx/2c1ad1e0a459d0401b7165ab81fc2f1b08acd5bc4c775d695740211837a1c7ac

ZEC Payroll Tool is a hackathon MVP for paying people for digital work with shielded ZEC while reducing payout mistakes and adding low-trust operational safeguards. The app turns contractor payout data into a reviewable batch, validates recipients and amounts, converts USD-denominated obligations into ZEC at an admin-entered rate, enforces per-recipient test transactions, and generates a spec-compliant ZIP-321 multi-payment URI plus exportable audit artifacts — including a scannable QR code for direct Zodl mobile handoff.

## Problem Statement

Paying contractors with crypto still breaks down at the ops layer.
Teams may want the privacy and settlement properties of shielded ZEC, but they still need a practical way to:

- prepare payout batches from real tabular data
- catch formatting and amount errors before funds move
- require lightweight test transactions when needed
- hand off a final payment request into a wallet that can actually sign it

This project focuses on that operational layer.
It is not payroll compliance software, HRIS, tax tooling, or live chain infrastructure.

## What the app does

The current product flow is:

1. import a CSV or paste payout rows
2. validate recipients and amounts
3. preview the batch and ZEC totals at an admin-entered rate (default: $250 / ZEC)
4. gate final approval on required test transactions
5. generate a spec-compliant ZIP-321 multi-payment URI
6. scan the QR code in **Zodl mobile** or copy/paste the URI for signing

## Implemented Features

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

```bash
npm test
```

## Zodl signing handoff

Zodl wallet is treated as a **mobile-only signing target**.
This prototype does **not** pretend signing happens inside the browser.

The live handoff flow is:

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

## Current limitations

- Zodl signing is represented as a QR/handoff flow, not in-browser wallet execution
- Zodl + NEAR intents for USDC payouts are not fully implemented yet
- biweekly reminder / scheduler flow is not fully implemented yet
- server-side end-to-end encryption is not fully implemented yet
- ZEC price discovery and FX inputs are admin-entered
- wallet validation goes only as deep as a lightweight format sanity check
- payout approval effects, queueing, confirmations, and receipts are prototype-level
- payroll tax, withholding, classification, and local compliance logic are out of scope
