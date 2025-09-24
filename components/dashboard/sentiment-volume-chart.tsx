"use client";

import { useMemo, useState } from "react";
import {
  AnimatedAreaSeries,
  AnimatedAxis,
  AnimatedGrid,
  AnimatedLineSeries,
  Tooltip,
  XYChart,
  buildChartTheme,
} from "@visx/xychart";
import type { DailyMetric } from "@/data/mockMetrics";
import { hexToRgba } from "@/lib/color";
import { formatDateLabel, formatNumber, formatPreciseNumber } from "@/lib/format";

interface SentimentVolumeChartProps {
  metrics: DailyMetric[];
  accentColor: string;
  softAccent: string;
  onSelectDay: (metric: DailyMetric) => void;
  selectedDate: string | null;
}

const xAccessor = (metric: DailyMetric) => new Date(`${metric.date}T00:00:00Z`);
const sentimentAccessor = (metric: DailyMetric) => metric.avgSentiment;
export default function SentimentVolumeChart({
  metrics,
  accentColor,
  softAccent,
  onSelectDay,
  selectedDate,
}: SentimentVolumeChartProps) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const sentimentDomain = useMemo(() => {
    if (metrics.length === 0) return [-10, 10];
    const min = Math.min(...metrics.map((metric) => metric.avgSentiment), -60);
    const max = Math.max(...metrics.map((metric) => metric.avgSentiment), 60);
    return [Math.floor(min - 5), Math.ceil(max + 5)];
  }, [metrics]);

  const maxVolume = useMemo(() => {
    if (metrics.length === 0) return 1;
    return Math.max(...metrics.map((metric) => metric.totalVolume));
  }, [metrics]);

  const { volumeBaseline, volumeScale } = useMemo(() => {
    const [min, max] = sentimentDomain;
    const span = Math.max(max - min, 1);
    return {
      volumeBaseline: min,
      volumeScale: (span * 0.55) / Math.max(maxVolume, 1),
    };
  }, [sentimentDomain, maxVolume]);

  const theme = useMemo(
    () =>
      buildChartTheme({
        backgroundColor: "transparent",
        colors: [accentColor, softAccent],
        gridColor: "rgba(148, 163, 184, 0.18)",
        gridColorDark: "rgba(148, 163, 184, 0.18)",
        tickLength: 6,
        svgLabelSmall: { fill: "#cbd5f5", fontSize: 11 },
        svgLabelBig: { fill: "#cbd5f5", fontSize: 12 },
      }),
    [accentColor, softAccent]
  );

  const activeDate = hoveredDate ?? selectedDate ?? null;

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Sentiment vs. volume</h2>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Daily averages</p>
        </div>
        <div className="text-xs text-slate-300/80">
          <span className="mr-3 flex items-center gap-1">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            Sentiment
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-slate-500/70" />
            Volume (scaled)
          </span>
        </div>
      </div>
      <div className="relative h-[320px] w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
        <XYChart
          height={320}
          margin={{ top: 16, right: 64, bottom: 48, left: 56 }}
          xScale={{ type: "time" }}
          yScale={{ type: "linear", domain: sentimentDomain }}
          theme={theme}
          pointerEventsDataKey="nearest"
          onPointerMove={({ datum }) => {
            const daily = datum as DailyMetric | null;
            if (daily) {
              setHoveredDate(daily.date);
            }
          }}
          onPointerOut={() => setHoveredDate(null)}
          onPointerUp={({ datum }) => {
            const daily = datum as DailyMetric | null;
            if (daily) {
              onSelectDay(daily);
            }
          }}
        >
          <AnimatedGrid columns={false} numTicks={5} strokeDasharray="4 6" />
          <AnimatedAxis
            orientation="bottom"
            tickFormat={(value) => {
              const iso = new Date(value as Date | number).toISOString().slice(0, 10);
              return formatDateLabel(iso);
            }}
            numTicks={6}
          />
          <AnimatedAxis
            orientation="left"
            label="Sentiment"
            labelProps={{ fill: "#cbd5f5", fontSize: 12 }}
          />
          <AnimatedAreaSeries
            dataKey="Volume"
            data={metrics}
            xAccessor={xAccessor}
            yAccessor={(metric) => volumeBaseline + metric.totalVolume * volumeScale}
            y0Accessor={() => volumeBaseline}
            fill={softAccent}
            stroke={hexToRgba(accentColor, 0.55)}
          />

          <AnimatedLineSeries
            dataKey="Sentiment"
            data={metrics}
            xAccessor={xAccessor}
            yAccessor={sentimentAccessor}
            stroke={accentColor}
            strokeWidth={2.5}
          />

          <Tooltip<DailyMetric>
            snapTooltipToDatumX
            snapTooltipToDatumY
            showVerticalCrosshair
            renderTooltip={({ tooltipData }) => {
              const datum = tooltipData?.nearestDatum?.datum;
              if (!datum) return null;
              return (
                <div className="flex min-w-[180px] flex-col gap-1 rounded-xl border border-white/10 bg-slate-900/90 px-3 py-2 text-xs text-slate-100 shadow-xl">
                  <span className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
                    {formatDateLabel(datum.date, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    Sentiment {formatPreciseNumber(datum.avgSentiment)}
                  </span>
                  <span className="text-slate-300">
                    Volume {formatNumber(datum.totalVolume)}
                  </span>
                </div>
              );
            }}
          />
        </XYChart>
        {activeDate && (
          <div className="pointer-events-none absolute bottom-3 left-4 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200">
            Focused on {formatDateLabel(activeDate, { month: "short", day: "numeric" })}
          </div>
        )}
      </div>
    </div>
  );
}
