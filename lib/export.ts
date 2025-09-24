import type { DailyMetric } from "@/data/mockMetrics";

function escapeValue(value: string | number): string {
  const stringValue = String(value);
  if (stringValue.includes(",") || stringValue.includes("\"")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function metricsToCsv(metrics: DailyMetric[]): string {
  const headers = [
    "date",
    "average_sentiment",
    "total_volume",
    "positive_count",
    "neutral_count",
    "negative_count",
    "top_keywords",
  ];

  const rows = metrics.map((metric) => {
    const keywords = metric.keywords.slice(0, 5).map((keyword) => keyword.term).join(" |");
    return [
      metric.date,
      metric.avgSentiment.toFixed(1),
      metric.totalVolume,
      metric.positiveCount,
      metric.neutralCount,
      metric.negativeCount,
      keywords,
    ]
      .map(escapeValue)
      .join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

export function triggerCsvDownload(metrics: DailyMetric[], filename: string) {
  if (metrics.length === 0) return;
  const csv = metricsToCsv(metrics);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
