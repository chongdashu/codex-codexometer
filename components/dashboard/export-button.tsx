"use client";

import { Download } from "lucide-react";
import clsx from "clsx";

interface ExportButtonProps {
  onExport: () => void;
  disabled?: boolean;
}

export default function ExportButton({ onExport, disabled }: ExportButtonProps) {
  return (
    <button
      type="button"
      onClick={onExport}
      disabled={disabled}
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] transition",
        disabled
          ? "cursor-not-allowed border-white/10 bg-white/10 text-slate-400"
          : "border-white/80 bg-white text-slate-900 shadow-lg hover:shadow-xl"
      )}
    >
      <Download className="h-4 w-4" /> Export CSV
    </button>
  );
}
