const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const preciseNumberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

export function formatNumber(value: number): string {
  return numberFormatter.format(Math.round(value));
}

export function formatPreciseNumber(value: number): string {
  return preciseNumberFormatter.format(value);
}

export function formatPercent(value: number): string {
  return percentFormatter.format(value);
}

export function formatDateLabel(date: string, options?: Intl.DateTimeFormatOptions) {
  const base: Intl.DateTimeFormatOptions = options?.dateStyle
    ? {}
    : { month: "short", day: "numeric" };
  const formatter = new Intl.DateTimeFormat("en-US", {
    ...base,
    ...options,
  });
  return formatter.format(new Date(date));
}

export function sentimentToneLabel(score: number): string {
  if (score >= 30) return "Strongly positive";
  if (score >= 10) return "Positive";
  if (score > -10) return "Balanced";
  if (score > -30) return "Cautious";
  return "Negative";
}

export function describeChange(change: number): string {
  if (change > 8) return "sharp upswing";
  if (change > 3) return "steady improvement";
  if (change < -8) return "sharp drop";
  if (change < -3) return "slight decline";
  return "holding steady";
}
