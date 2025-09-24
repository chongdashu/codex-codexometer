"use client";

import clsx from "clsx";

export type RangePreset = 7 | 30 | 90;

const PRESETS: { label: string; value: RangePreset }[] = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
];

interface DateRangePickerProps {
  preset: RangePreset | "custom";
  startDate: string;
  endDate: string;
  minDate: string;
  maxDate: string;
  onPresetChange: (preset: RangePreset | "custom") => void;
  onCustomChange: (range: { startDate: string; endDate: string }) => void;
}

export default function DateRangePicker({
  preset,
  startDate,
  endDate,
  minDate,
  maxDate,
  onPresetChange,
  onCustomChange,
}: DateRangePickerProps) {
  const handleCustomStart = (value: string) => {
    if (!value) return;
    onCustomChange({ startDate: value, endDate });
  };

  const handleCustomEnd = (value: string) => {
    if (!value) return;
    onCustomChange({ startDate, endDate: value });
  };

  return (
    <div className="flex flex-col gap-3 text-sm text-slate-200">
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onPresetChange(option.value)}
            className={clsx(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
              preset === option.value
                ? "border-white/80 bg-white/90 text-slate-900 shadow"
                : "border-white/10 bg-white/5 text-slate-200/80 hover:border-white/20 hover:bg-white/10"
            )}
          >
            {option.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPresetChange("custom")}
          className={clsx(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition",
            preset === "custom"
              ? "border-white/80 bg-white/90 text-slate-900 shadow"
              : "border-white/10 bg-white/5 text-slate-200/80 hover:border-white/20 hover:bg-white/10"
          )}
        >
          Custom
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2">
        <label className="flex items-center gap-2 text-xs text-slate-300">
          <span className="uppercase tracking-[0.2em] text-[10px] text-slate-400">Start</span>
          <input
            type="date"
            value={startDate}
            min={minDate}
            max={endDate}
            onChange={(event) => handleCustomStart(event.target.value)}
            className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-1 text-sm text-slate-100 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-slate-200/30"
          />
        </label>
        <span className="text-slate-400">—</span>
        <label className="flex items-center gap-2 text-xs text-slate-300">
          <span className="uppercase tracking-[0.2em] text-[10px] text-slate-400">End</span>
          <input
            type="date"
            value={endDate}
            min={startDate}
            max={maxDate}
            onChange={(event) => handleCustomEnd(event.target.value)}
            className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-1 text-sm text-slate-100 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-slate-200/30"
          />
        </label>
        <div className="ml-auto hidden rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-400 sm:flex">
          {preset === "custom" ? "Custom window" : `${preset}-day window`}
        </div>
      </div>
    </div>
  );
}
