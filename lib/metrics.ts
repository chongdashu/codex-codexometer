import type { DailyMetric } from "@/data/mockMetrics";

export interface SummaryStats {
  weightedSentiment: number;
  totalVolume: number;
  positiveShare: number;
  neutralShare: number;
  negativeShare: number;
  change: number;
  firstSentiment?: number;
  lastSentiment?: number;
  strongestPositiveDay?: DailyMetric;
  strongestNegativeDay?: DailyMetric;
  busiestDay?: DailyMetric;
}

export interface InsightCard {
  id: string;
  title: string;
  description: string;
  tone: "positive" | "negative" | "neutral";
}

export function computeSummaryStats(metrics: DailyMetric[]): SummaryStats {
  if (metrics.length === 0) {
    return {
      weightedSentiment: 0,
      totalVolume: 0,
      positiveShare: 0,
      neutralShare: 0,
      negativeShare: 0,
      change: 0,
    };
  }

  let totalVolume = 0;
  let weightedSentiment = 0;
  let positiveTotal = 0;
  let neutralTotal = 0;
  let negativeTotal = 0;
  let strongestPositiveDay = metrics[0];
  let strongestNegativeDay = metrics[0];
  let busiestDay = metrics[0];

  metrics.forEach((metric) => {
    const volume = Math.max(metric.totalVolume, 0);
    totalVolume += volume;
    weightedSentiment += metric.avgSentiment * volume;
    positiveTotal += metric.positiveCount;
    neutralTotal += metric.neutralCount;
    negativeTotal += metric.negativeCount;

    if (metric.avgSentiment > strongestPositiveDay.avgSentiment) {
      strongestPositiveDay = metric;
    }

    if (metric.avgSentiment < strongestNegativeDay.avgSentiment) {
      strongestNegativeDay = metric;
    }

    if (metric.totalVolume > busiestDay.totalVolume) {
      busiestDay = metric;
    }
  });

  const firstSentiment = metrics[0].avgSentiment;
  const lastSentiment = metrics[metrics.length - 1].avgSentiment;
  const change = lastSentiment - firstSentiment;
  const denominator = totalVolume || 1;

  return {
    weightedSentiment: weightedSentiment / denominator,
    totalVolume,
    positiveShare: positiveTotal / Math.max(totalVolume, 1),
    neutralShare: neutralTotal / Math.max(totalVolume, 1),
    negativeShare: negativeTotal / Math.max(totalVolume, 1),
    change,
    firstSentiment,
    lastSentiment,
    strongestPositiveDay,
    strongestNegativeDay,
    busiestDay,
  };
}

export function buildInsights(metrics: DailyMetric[]): InsightCard[] {
  if (metrics.length === 0) return [];

  const summary = computeSummaryStats(metrics);
  const averageVolume = summary.totalVolume / metrics.length;

  const volumeLift = summary.busiestDay
    ? Math.round(((summary.busiestDay.totalVolume - averageVolume) / Math.max(averageVolume, 1)) * 100)
    : 0;

  const insights: InsightCard[] = [];

  if (summary.busiestDay) {
    insights.push({
      id: "volume", 
      title: "Volume spike detected",
      tone: volumeLift >= 0 ? "positive" : "neutral",
      description: volumeLift >= 0
        ? `${summary.busiestDay.date} saw mentions surge ${Math.abs(volumeLift)}% above the period baseline.`
        : `${summary.busiestDay.date} dipped ${Math.abs(volumeLift)}% below typical mention volume.`,
    });
  }

  if (summary.strongestPositiveDay) {
    const positiveKeywords = summary.strongestPositiveDay.keywords
      .slice(0, 2)
      .map((k) => k.term)
      .join(" & ") || "community themes";
    insights.push({
      id: "positive",
      title: "Highest positive sentiment",
      tone: "positive",
      description: `${summary.strongestPositiveDay.date} hit a sentiment score of ${summary.strongestPositiveDay.avgSentiment.toFixed(1)}, driven by ${positiveKeywords}.`,
    });
  }

  if (summary.strongestNegativeDay) {
    const cautionKeywords = summary.strongestNegativeDay.keywords
      .slice(0, 2)
      .map((k) => k.term)
      .join(" & ") || "pain points";
    insights.push({
      id: "negative",
      title: "Watch list",
      tone: "negative",
      description: `${summary.strongestNegativeDay.date} skewed negative (${summary.strongestNegativeDay.avgSentiment.toFixed(1)}) with conversations around ${cautionKeywords}.`,
    });
  }

  return insights;
}

