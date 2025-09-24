"use client";

import type { DailyMetric } from "@/data/mockMetrics";
import { formatDateLabel, formatNumber, formatPercent } from "@/lib/format";

interface DailyActivityProps {
  metrics: DailyMetric[];
  onSelect: (metric: DailyMetric) => void;
  selectedDate: string | null;
  accentColor: string;
}

export default function DailyActivity({
  metrics,
  onSelect,
  selectedDate,
  accentColor,
}: DailyActivityProps) {
  const sorted = [...metrics].sort((a, b) => (a.date > b.date ? -1 : 1));

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-[var(--card)]/85 p-5 text-slate-100">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Daily activity</h2>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Click a day for examples</span>
      </div>
      <div className="max-h-[340px] overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/60">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-slate-950/90 text-xs uppercase tracking-[0.2em] text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Sentiment</th>
              <th className="px-4 py-3 text-left">Volume</th>
              <th className="px-4 py-3 text-left">Positive</th>
              <th className="px-4 py-3 text-left">Negative</th>
              <th className="px-4 py-3 text-right">Explore</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((metric) => {
              const total = metric.totalVolume || 1;
              const positiveShare = metric.positiveCount / total;
              const negativeShare = metric.negativeCount / total;
              const isSelected = selectedDate === metric.date;
              return (
                <tr
                  key={metric.date}
                  className={isSelected ? "bg-white/10" : "odd:bg-white/[0.03]"}
                >
                  <td className="px-4 py-3 font-medium text-white">
                    {formatDateLabel(metric.date, { month: "short", day: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-slate-200">
                    {metric.avgSentiment.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-slate-200">
                    {formatNumber(metric.totalVolume)}
                  </td>
                  <td className="px-4 py-3 text-emerald-300">
                    {formatPercent(positiveShare)}
                  </td>
                  <td className="px-4 py-3 text-rose-300">
                    {formatPercent(negativeShare)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onSelect(metric)}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-900"
                      style={{ background: isSelected ? accentColor : "rgba(255,255,255,0.85)" }}
                    >
                      {isSelected ? "Viewing" : "Open"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
