"use client";

import { useMemo, useState } from "react";
import type {
  DailyMetric,
  ExampleItem,
  KeywordMetric,
  SubredditConfig,
} from "@/data/mockMetrics";
import { hexToRgba } from "@/lib/color";
import {
  describeChange,
  formatDateLabel,
  formatPercent,
  sentimentToneLabel,
} from "@/lib/format";
import { buildInsights, computeSummaryStats } from "@/lib/metrics";
import { triggerCsvDownload } from "@/lib/export";
import DateRangePicker, { RangePreset } from "./date-range-picker";
import SubredditTabs from "./subreddit-tabs";
import MetricsSummary from "./metrics-summary";
import SentimentVolumeChart from "./sentiment-volume-chart";
import KeywordCloud from "./keyword-cloud";
import ExamplesDrawer from "./examples-drawer";
import InsightsList from "./insights-list";
import DailyActivity from "./daily-activity";
import ExportButton from "./export-button";

interface DashboardProps {
  subreddits: SubredditConfig[];
  metricsBySubreddit: Record<string, DailyMetric[]>;
  exampleIndex: Record<string, ExampleItem[]>;
  dateExtent: { earliestDate: string; latestDate: string };
}

interface DateRange {
  startDate: string;
  endDate: string;
}

function toDate(value: string) {
  return new Date(`${value}T00:00:00Z`);
}

function clampRange(range: DateRange, bounds: DateRange): DateRange {
  const start = toDate(range.startDate);
  const end = toDate(range.endDate);
  const min = toDate(bounds.startDate);
  const max = toDate(bounds.endDate);
  if (start > max) {
    start.setTime(max.getTime());
  }
  if (end < min) {
    end.setTime(min.getTime());
  }
  if (start > end) {
    start.setTime(end.getTime());
  }
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

function computePresetRange(
  preset: RangePreset,
  latestDate: string,
  earliestDate: string
): DateRange {
  const end = toDate(latestDate);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (preset - 1));
  const earliest = toDate(earliestDate);
  if (start < earliest) {
    start.setTime(earliest.getTime());
  }
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

function aggregateKeywords(metrics: DailyMetric[]): KeywordMetric[] {
  const totals = new Map<string, number>();
  metrics.forEach((metric) => {
    metric.keywords.forEach((keyword) => {
      totals.set(keyword.term, (totals.get(keyword.term) ?? 0) + keyword.weight);
    });
  });
  return Array.from(totals.entries())
    .map(([term, weight]) => ({ term, weight: parseFloat(weight.toFixed(1)) }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 40);
}

export default function DashboardShell({
  subreddits,
  metricsBySubreddit,
  exampleIndex,
  dateExtent,
}: DashboardProps) {
  const sortedTabs = useMemo(() => {
    const all = subreddits.find((item) => item.id === "all");
    const rest = subreddits.filter((item) => item.id !== "all");
    return all ? [all, ...rest] : rest;
  }, [subreddits]);

  const defaultSubreddit = sortedTabs[0]?.id ?? "";

  const [selectedSubreddit, setSelectedSubreddit] = useState(defaultSubreddit);
  const [rangePreset, setRangePreset] = useState<RangePreset | "custom">(30);
  const initialRange = useMemo(() => {
    const latest = dateExtent.latestDate;
    const earliest = dateExtent.earliestDate;
    return computePresetRange(30, latest, earliest);
  }, [dateExtent.earliestDate, dateExtent.latestDate]);
  const [customRange, setCustomRange] = useState<DateRange>(initialRange);

  const activeConfig =
    sortedTabs.find((tab) => tab.id === selectedSubreddit) ?? sortedTabs[0];

  const currentRange = useMemo(() => {
    if (rangePreset === "custom") {
      return clampRange(customRange, {
        startDate: dateExtent.earliestDate,
        endDate: dateExtent.latestDate,
      });
    }
    return computePresetRange(
      rangePreset,
      dateExtent.latestDate,
      dateExtent.earliestDate
    );
  }, [rangePreset, customRange, dateExtent.earliestDate, dateExtent.latestDate]);

  const { startDate, endDate } = currentRange;

  const filteredMetrics = useMemo(() => {
    const source = metricsBySubreddit[selectedSubreddit] ?? [];
    return source.filter((metric) => metric.date >= startDate && metric.date <= endDate);
  }, [metricsBySubreddit, selectedSubreddit, startDate, endDate]);

  const summary = useMemo(
    () => computeSummaryStats(filteredMetrics),
    [filteredMetrics]
  );
  const insights = useMemo(() => buildInsights(filteredMetrics), [filteredMetrics]);
  const keywords = useMemo(
    () => aggregateKeywords(filteredMetrics),
    [filteredMetrics]
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<DailyMetric | null>(null);

  const examplesForSelected = useMemo(() => {
    if (!selectedMetric) return [];
    const pool = exampleIndex[selectedSubreddit] ?? [];
    return pool
      .filter((item) => item.date === selectedMetric.date)
      .sort((a, b) => b.confidence - a.confidence);
  }, [exampleIndex, selectedMetric, selectedSubreddit]);

  const totalDays = filteredMetrics.length;
  const rangeLabel = `${formatDateLabel(startDate, {
    month: "short",
    day: "numeric",
  })} — ${formatDateLabel(endDate, { month: "short", day: "numeric" })}`;

  const volumePerDay = totalDays
    ? Math.round(summary.totalVolume / totalDays)
    : 0;

  const shareDisplay = {
    positive: formatPercent(summary.positiveShare || 0),
    neutral: formatPercent(summary.neutralShare || 0),
    negative: formatPercent(summary.negativeShare || 0),
  };

  const sentimentDescriptor = sentimentToneLabel(summary.weightedSentiment);
  const sentimentChange = describeChange(summary.change);

  const handleSelectMetric = (metric: DailyMetric) => {
    setSelectedMetric(metric);
    setIsDrawerOpen(true);
  };

  const handleExport = () => {
    if (filteredMetrics.length === 0) return;
    const filename = `codex-sentiment-${selectedSubreddit}-${startDate}-to-${endDate}.csv`;
    triggerCsvDownload(filteredMetrics, filename);
  };

  const accent = activeConfig?.accentColor ?? "#f97316";
  const softAccent = activeConfig?.softColor ?? hexToRgba(accent, 0.2);

  return (
    <div className="mx-auto flex max-w-[1240px] flex-col gap-8 px-6 pb-24 pt-12 sm:px-8">
      <header className="flex flex-col gap-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-300/80">
            Codex Sentiment Monitor
          </span>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-slate-50 sm:text-4xl">
                {activeConfig?.name ?? "Codex communities"}
              </h1>
              <p className="max-w-2xl text-sm text-slate-300/80 sm:text-base">
                {activeConfig?.description ??
                  "Track Reddit mood, volume, and key discussion topics across the Codex ecosystem."}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right text-xs text-slate-300/75">
              <p className="font-medium text-slate-200">Last refreshed</p>
              <p>{formatDateLabel(dateExtent.latestDate, { dateStyle: "medium" })}</p>
              <p className="text-xs">Range: {rangeLabel}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-[var(--card)]/80 p-4 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:gap-6">
            <SubredditTabs
              items={sortedTabs}
              selectedId={selectedSubreddit}
              onSelect={setSelectedSubreddit}
            />
            <DateRangePicker
              preset={rangePreset}
              startDate={startDate}
              endDate={endDate}
              minDate={dateExtent.earliestDate}
              maxDate={dateExtent.latestDate}
              onPresetChange={setRangePreset}
              onCustomChange={(range) => {
                setCustomRange(range);
                setRangePreset("custom");
              }}
            />
          </div>
          <ExportButton onExport={handleExport} disabled={filteredMetrics.length === 0} />
        </div>
      </header>

      <MetricsSummary
        summary={summary}
        accentColor={accent}
        rangeLabel={rangeLabel}
        sentimentDescriptor={sentimentDescriptor}
        sentimentChange={sentimentChange}
        totalDays={totalDays}
        averageDailyVolume={volumePerDay}
        shareDisplay={shareDisplay}
      />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="rounded-3xl border border-white/10 bg-[var(--card)]/90 p-5 shadow-2xl shadow-sky-500/10">
          <SentimentVolumeChart
            metrics={filteredMetrics}
            accentColor={accent}
            softAccent={softAccent}
            onSelectDay={handleSelectMetric}
            selectedDate={selectedMetric?.date ?? null}
          />
        </div>
        <div className="flex flex-col gap-6">
          <KeywordCloud keywords={keywords} accentColor={accent} />
          <InsightsList insights={insights} accentColor={accent} />
        </div>
      </section>

      <DailyActivity
        metrics={filteredMetrics}
        onSelect={handleSelectMetric}
        selectedDate={selectedMetric?.date ?? null}
        accentColor={accent}
      />

      <ExamplesDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        metric={selectedMetric}
        examples={examplesForSelected}
        accentColor={accent}
      />
    </div>
  );
}
