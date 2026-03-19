"use client";

type Props = {
  label: string;
  filename: string;
  content: string;
  mimeType: string;
};

export function DownloadArtifactButton({ label, filename, content, mimeType }: Props) {
  function handleDownload() {
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
      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-ink"
    >
      {label}
    </button>
  );
}
