import { NextResponse } from "next/server";
import {
  getDateExtent,
  getMetricsForRange,
  getMetricsForSubreddit,
} from "@/data/mockMetrics";

const VALID_RANGE = new Set(["7", "30", "90"]);

function toISO(date: Date) {
  return date.toISOString().slice(0, 10);
}

function computeRange(range: string | null, latest: string, earliest: string) {
  if (!range || !VALID_RANGE.has(range)) {
    return { startDate: earliest, endDate: latest };
  }
  const days = Number(range);
  const end = new Date(`${latest}T00:00:00Z`);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  const earliestDate = new Date(`${earliest}T00:00:00Z`);
  if (start < earliestDate) {
    start.setTime(earliestDate.getTime());
  }
  return { startDate: toISO(start), endDate: toISO(end) };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const subreddit = url.searchParams.get("subreddit") ?? "all";
  const { earliestDate, latestDate } = getDateExtent();
  const { startDate: presetStart, endDate: presetEnd } = computeRange(
    url.searchParams.get("range"),
    latestDate,
    earliestDate
  );

  const startDate = url.searchParams.get("start") ?? presetStart;
  const endDate = url.searchParams.get("end") ?? presetEnd;

  const metrics = getMetricsForRange(subreddit, startDate, endDate);
  const available = getMetricsForSubreddit(subreddit);

  return NextResponse.json({
    subreddit,
    startDate,
    endDate,
    totalDays: metrics.length,
    availableDays: available.length,
    data: metrics,
  });
}
