"use client";

type Props = {
  label: string;
  filename: string;
  content: string;
  mimeType: string;
  disabled?: boolean;
};

export function DownloadArtifactButton({ label, filename, content, mimeType, disabled = false }: Props) {
  function handleDownload() {
    if (disabled || !content) {
      return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={disabled}
      className={`rounded-full border px-4 py-2 text-sm font-semibold ${
        disabled ? "cursor-not-allowed border-slate-200 bg-slate-100 text-ink/40" : "border-slate-300 bg-white text-ink"
      }`}
    >
      {label}
    </button>
  );
}
