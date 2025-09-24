import type { KeywordMetric } from "@/data/mockMetrics";
import { hexToRgba } from "@/lib/color";

interface KeywordCloudProps {
  keywords: KeywordMetric[];
  accentColor: string;
}

export default function KeywordCloud({ keywords, accentColor }: KeywordCloudProps) {
  const maxWeight = keywords.length
    ? Math.max(...keywords.map((keyword) => keyword.weight))
    : 1;

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-[var(--card)]/85 p-5 text-slate-100 backdrop-blur">
      <div>
        <h2 className="text-lg font-semibold">Keyword momentum</h2>
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Top phrases weighted by tf-idf</p>
      </div>
      {keywords.length === 0 ? (
        <p className="text-sm text-slate-300/80">No keywords available for this window.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword) => {
            const intensity = keyword.weight / maxWeight;
            const background = hexToRgba(accentColor, 0.2 + intensity * 0.45);
            const textSize = 0.85 + intensity * 0.75;
            return (
              <span
                key={keyword.term}
                className="rounded-2xl border border-white/10 px-3 py-1 font-medium text-slate-900 shadow"
                style={{
                  background,
                  fontSize: `${textSize}rem`,
                  boxShadow: `0 12px 30px -18px ${hexToRgba(accentColor, 0.6)}`,
                }}
              >
                {keyword.term}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
