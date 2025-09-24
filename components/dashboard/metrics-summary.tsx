import type { SummaryStats } from "@/lib/metrics";
import {
  formatNumber,
  formatPreciseNumber,
} from "@/lib/format";

interface MetricsSummaryProps {
  summary: SummaryStats;
  accentColor: string;
  rangeLabel: string;
  sentimentDescriptor: string;
  sentimentChange: string;
  totalDays: number;
  averageDailyVolume: number;
  shareDisplay: {
    positive: string;
    neutral: string;
    negative: string;
  };
}

export default function MetricsSummary({
  summary,
  accentColor,
  rangeLabel,
  sentimentDescriptor,
  sentimentChange,
  totalDays,
  averageDailyVolume,
  shareDisplay,
}: MetricsSummaryProps) {
  return (
    <section className="grid gap-4 rounded-3xl border border-white/10 bg-[var(--card)]/85 p-6 text-slate-100 backdrop-blur-md sm:grid-cols-3">
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/50 p-4 shadow-inner">
        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Mood index</span>
        <div className="flex items-end gap-3">
          <span className="text-4xl font-semibold text-white">
            {formatPreciseNumber(summary.weightedSentiment)}
          </span>
          <span className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-xs uppercase tracking-[0.2em] text-slate-200">
            {sentimentDescriptor}
          </span>
        </div>
        <p className="text-sm text-slate-300/85">
          Sentiment {sentimentChange} over {rangeLabel.toLowerCase()}.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/50 p-4 shadow-inner">
        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Volume</span>
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-semibold text-white">
            {formatNumber(summary.totalVolume)}
          </span>
          <span className="text-sm text-slate-400">mentions</span>
        </div>
        <p className="text-sm text-slate-300/85">
          ~{formatNumber(averageDailyVolume)} per day across {totalDays} tracked days.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/50 p-4 shadow-inner">
        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Sentiment mix</span>
        <div className="flex items-center gap-3 text-xs text-slate-200">
          <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-2 py-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            Pos {shareDisplay.positive}
          </span>
          <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-2 py-1 text-slate-300">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            Neu {shareDisplay.neutral}
          </span>
          <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-2 py-1 text-rose-200">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            Neg {shareDisplay.negative}
          </span>
        </div>
        {summary.busiestDay && (
          <p className="text-sm text-slate-300/85">
            Peak volume on {summary.busiestDay.date} with {formatNumber(summary.busiestDay.totalVolume)} mentions.
          </p>
        )}
      </div>
    </section>
  );
}
