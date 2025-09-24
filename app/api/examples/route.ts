import { NextResponse } from "next/server";
import { getExamplesForDay } from "@/data/mockMetrics";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const subreddit = url.searchParams.get("subreddit") ?? "all";
  const date = url.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }
  const sentiment = url.searchParams.get("sentiment");
  let examples = getExamplesForDay(subreddit, date);
  if (sentiment) {
    examples = examples.filter((example) => example.sentiment === sentiment);
  }
  return NextResponse.json({
    subreddit,
    date,
    count: examples.length,
    data: examples,
  });
}
