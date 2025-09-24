import DashboardShell from "@/components/dashboard/dashboard";
import {
  getAllExamples,
  getAllMetrics,
  getDateExtent,
  getSubreddits,
} from "@/data/mockMetrics";

export default function DashboardPage() {
  const subreddits = getSubreddits();
  const metrics = getAllMetrics();
  const examples = getAllExamples();
  const dateExtent = getDateExtent();

  return (
    <DashboardShell
      subreddits={subreddits}
      metricsBySubreddit={metrics}
      exampleIndex={examples}
      dateExtent={dateExtent}
    />
  );
}
