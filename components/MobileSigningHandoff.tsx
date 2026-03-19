"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { DownloadArtifactButton } from "./DownloadArtifactButton";

type Props = {
  zip321Uri: string;
  handoffText: string;
  approvedAt: string | null;
  recipientCount: number;
  totalZec: number;
};

function formatTimestamp(value: string | null) {
  if (!value) {
    return "Pending approval";
  }

  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export function MobileSigningHandoff({ zip321Uri, handoffText, approvedAt, recipientCount, totalZec }: Props) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const hasUri = Boolean(zip321Uri);

  async function handleCopy() {
    if (!zip321Uri) {
      return;
    }

    try {
      await navigator.clipboard.writeText(zip321Uri);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("failed");
      window.setTimeout(() => setCopyState("idle"), 1800);
    }
  }

  return (
    <div className="panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-label">Mobile Signing Handoff</p>
          <h2 className="mt-3 text-2xl font-semibold text-ink">Hand off the ZIP-321 URI to Zodl on mobile</h2>
          <p className="mt-3 text-sm text-ink/65">
            This screen prepares the signing request only. Signing does not happen in the browser. Open Zodl on a phone and
            move the URI there for review and signature.
          </p>
        </div>
        <div className="rounded-2xl bg-sky-100 px-4 py-3 text-sm font-semibold text-sky-700">Zodl signing happens on mobile</div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl bg-slate-50 p-5">
          <p className="text-sm font-semibold text-ink">Demo-ready checks</p>
          <div className="mt-4 space-y-3 text-sm text-ink/70">
            <p>1. ZIP-321 URI generated: {hasUri ? "Yes" : "Not yet"}</p>
            <p>2. Ready recipients included: {recipientCount}</p>
            <p>3. Total value queued: {totalZec.toFixed(8)} ZEC</p>
            <p>4. Approval timestamp: {formatTimestamp(approvedAt)}</p>
          </div>
        </div>
        <div className="rounded-3xl bg-mint p-5 text-sm text-pine">
          <p className="font-semibold">Mobile signing steps</p>
          <div className="mt-4 space-y-3">
            <p>1. Approve the batch to generate the ZIP-321 URI.</p>
            <p>2. Copy the URI or download the handoff `.txt` artifact.</p>
            <p>3. Open Zodl on mobile and paste or transfer the URI into the wallet flow.</p>
            <p>4. Review recipients and amounts in Zodl, then sign in the mobile app.</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCopy}
          disabled={!hasUri}
          className={`rounded-full border px-4 py-2 text-sm font-semibold ${
            hasUri ? "border-slate-300 bg-white text-ink" : "cursor-not-allowed border-slate-200 bg-slate-100 text-ink/40"
          }`}
        >
          {copyState === "copied" ? "URI copied" : copyState === "failed" ? "Copy failed" : "Copy URI"}
        </button>
        <DownloadArtifactButton
          label={hasUri ? "Download handoff .txt" : "Download locked"}
          filename="run-0319-zodl-handoff.txt"
          content={handoffText}
          mimeType="text/plain;charset=utf-8"
          disabled={!hasUri}
        />
      </div>

      <div className="mt-6 rounded-3xl bg-slate-50 p-5">
        <p className="text-sm font-semibold text-ink">ZIP-321 URI</p>
        <p className="mt-2 text-xs text-ink/50">Use this exact URI for the mobile handoff. It is not signed until Zodl handles it on a phone.</p>
        <textarea
          readOnly
          value={zip321Uri || "Approve the ready batch to generate the mobile handoff URI."}
          className="mt-4 h-40 w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 font-mono text-xs text-ink"
        />
      </div>

      <div className="mt-6 rounded-3xl bg-slate-50 p-5">
        <p className="text-sm font-semibold text-ink">Scan with Zodl</p>
        <p className="mt-2 text-xs text-ink/50">Point the Zodl app camera at this QR code to import the ZIP-321 signing request directly.</p>
        <div className="mt-4 flex items-center justify-center">
          {hasUri ? (
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <QRCodeSVG
                value={zip321Uri}
                size={220}
                level="M"
                includeMargin={false}
              />
            </div>
          ) : (
            <div className="flex h-[252px] w-[252px] items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white">
              <p className="px-6 text-center text-sm text-ink/40">QR code will appear here after batch approval</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
