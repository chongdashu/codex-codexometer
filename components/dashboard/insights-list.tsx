import type { InsightCard } from "@/lib/metrics";
import { hexToRgba } from "@/lib/color";
import { AlertTriangle, Lightbulb, TrendingUp } from "lucide-react";

interface InsightsListProps {
  insights: InsightCard[];
  accentColor: string;
}

export default function InsightsList({ insights, accentColor }: InsightsListProps) {
  if (insights.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[var(--card)]/85 p-5 text-sm text-slate-300/85">
        No significant spikes detected in this window.
      </div>
    );
  }

  const iconForTone = (tone: InsightCard["tone"]) => {
    switch (tone) {
      case "positive":
        return <TrendingUp className="h-4 w-4" />;
      case "negative":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-[var(--card)]/85 p-5 text-slate-100">
      <h2 className="text-lg font-semibold">Automated insights</h2>
      <div className="flex flex-col gap-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="flex gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-inner"
            style={{
              boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.08), 0 16px 35px -24px ${hexToRgba(accentColor, 0.75)}`,
            }}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10"
              style={{ background: hexToRgba(accentColor, 0.18) }}
            >
              {iconForTone(insight.tone)}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">{insight.title}</p>
              <p className="text-sm text-slate-300/85">{insight.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
