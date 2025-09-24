export type SentimentCategory = "positive" | "neutral" | "negative";

export interface KeywordMetric {
  term: string;
  weight: number;
}

export interface DailyMetric {
  date: string; // ISO date string without time component
  avgSentiment: number; // -100 to 100 scaled sentiment
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  totalVolume: number;
  keywords: KeywordMetric[];
}

export interface ExampleItem {
  id: string;
  subredditId: string;
  date: string;
  title: string;
  url: string;
  sentiment: SentimentCategory;
  confidence: number;
  author: string;
  score: number;
  snippet: string;
}

export interface SubredditConfig {
  id: string;
  name: string;
  description: string;
  accentColor: string;
  softColor: string;
}

interface InternalMetricAccumulator {
  totalVolume: number;
  weightedSentiment: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  keywords: Map<string, number>;
}

const subredditConfigs: SubredditConfig[] = [
  {
    id: "all",
    name: "All communities",
    description:
      "Combined sentiment across r/ChatGPT, r/OpenAI, r/ChatGPTPro, and r/codex.",
    accentColor: "#f97316",
    softColor: "rgba(249, 115, 22, 0.14)",
  },
  {
    id: "chatgpt",
    name: "r/ChatGPT",
    description: "Main community for everyday Codex users exploring prompts and workflows.",
    accentColor: "#818cf8",
    softColor: "rgba(129, 140, 248, 0.14)",
  },
  {
    id: "openai",
    name: "r/OpenAI",
    description: "News-focused subreddit tracking official releases and policy changes.",
    accentColor: "#38bdf8",
    softColor: "rgba(56, 189, 248, 0.14)",
  },
  {
    id: "chatgptpro",
    name: "r/ChatGPTPro",
    description: "Power users comparing pro tooling, automations, and pro-tier support.",
    accentColor: "#f472b6",
    softColor: "rgba(244, 114, 182, 0.14)",
  },
  {
    id: "codex",
    name: "r/codex",
    description: "Developer-centric conversations about Codex CLI/IDE internals and releases.",
    accentColor: "#34d399",
    softColor: "rgba(52, 211, 153, 0.14)",
  },
];

const subredditKeywordPools: Record<string, string[]> = {
  chatgpt: [
    "workflow",
    "memory",
    "prompting",
    "shortcuts",
    "bug report",
    "update",
    "templates",
    "assistants",
  ],
  openai: [
    "roadmap",
    "policy",
    "release",
    "earnings",
    "labs",
    "preview",
    "pricing",
    "security",
  ],
  chatgptpro: [
    "automation",
    "scripting",
    "workspace",
    "metrics",
    "failover",
    "advanced mode",
    "latency",
    "voice",
  ],
  codex: [
    "compiler",
    "extensions",
    "debugger",
    "beta build",
    "workflow",
    "plugins",
    "release notes",
    "telemetry",
  ],
};

const metricsBySubreddit: Record<string, DailyMetric[]> = {};
const exampleLookup: Record<string, Map<string, ExampleItem[]>> = {};
let generated = false;
let earliestDate = "";
let latestDate = "";

function createSeededRandom(seed: number) {
  return () => {
    seed = Math.imul(seed + 0x6d2b79f5, 1);
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function toISODate(date: Date) {
  const copy = new Date(date);
  copy.setUTCHours(0, 0, 0, 0);
  return copy.toISOString().split("T")[0];
}

function generateMockData() {
  if (generated) {
    return;
  }

  const endDate = new Date();
  endDate.setUTCHours(0, 0, 0, 0);
  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - 89);
  earliestDate = toISODate(startDate);
  latestDate = toISODate(endDate);

  const globalExampleMap = new Map<string, ExampleItem[]>();

  subredditConfigs
    .filter((sub) => sub.id !== "all")
    .forEach((sub, index) => {
      const random = createSeededRandom(73 + index * 31);
      const metrics: DailyMetric[] = [];
      const subExampleMap = new Map<string, ExampleItem[]>();

      for (let day = 0; day < 90; day += 1) {
        const currentDate = new Date(startDate);
        currentDate.setUTCDate(startDate.getUTCDate() + day);
        const isoDate = toISODate(currentDate);
        const seasonality = Math.sin((day + index * 4) / 11) * 28;
        const releaseWave = Math.cos((day + index * 3) / 6) * 10;
        const noise = (random() - 0.5) * 18;
        const avgSentiment = clamp(18 - index * 4 + seasonality + releaseWave + noise, -55, 65);

        const baseVolume = 120 + index * 20;
        const volumeSwing = Math.cos((day + index) / 8) * 35;
        const volumeNoise = random() * 45;
        const spike = day % (13 + index * 2) === 0 ? 90 : 0;
        const totalVolume = Math.max(35, Math.round(baseVolume + volumeSwing + volumeNoise + spike));

        const sentimentFactor = avgSentiment / 100;
        const positiveShare = clamp(0.38 + sentimentFactor * 0.32 + (random() - 0.5) * 0.08, 0.08, 0.78);
        const negativeShare = clamp(0.22 - sentimentFactor * 0.28 + (random() - 0.5) * 0.07, 0.05, 0.55);
        const neutralShare = clamp(1 - positiveShare - negativeShare, 0.05, 0.6);
        const positiveCount = Math.round(totalVolume * positiveShare);
        const negativeCount = Math.round(totalVolume * negativeShare);
        let neutralCount = Math.round(totalVolume * neutralShare);
        const remainder = totalVolume - positiveCount - negativeCount - neutralCount;
        if (remainder !== 0) {
          neutralCount = Math.max(0, neutralCount + remainder);
        }

        const keywordPool = subredditKeywordPools[sub.id] ?? [];
        const keywords = keywordPool
          .map((term, termIndex) => {
            const intensity =
              6 - termIndex * 0.6 + Math.sin((day + termIndex * 2 + index) / 7) * 2 + random() * 1.5;
            return {
              term,
              weight: parseFloat((Math.max(intensity, 0.5) * 12 + random() * 3).toFixed(1)),
            };
          })
          .sort((a, b) => b.weight - a.weight)
          .slice(0, 6);

        const metric: DailyMetric = {
          date: isoDate,
          avgSentiment: Math.round(avgSentiment * 10) / 10,
          positiveCount,
          neutralCount,
          negativeCount,
          totalVolume,
          keywords,
        };
        metrics.push(metric);

        const sentimentOrder: SentimentCategory[] = ["positive", "neutral", "negative"];
        const dailyExamples: ExampleItem[] = sentimentOrder.map((sentiment, exampleIndex) => {
          const keyword = keywords[(exampleIndex + day) % keywords.length]?.term ?? "insight";
          const confidence = parseFloat((0.58 + random() * 0.34).toFixed(2));
          const score = Math.round(10 + random() * 220);
          return {
            id: `${sub.id}-${isoDate}-${exampleIndex}`,
            subredditId: sub.id,
            date: isoDate,
            title: `${sentiment === "positive" ? "Win" : sentiment === "negative" ? "Pain" : "Discussion"}: ${keyword.replace(
              /\b\w/g,
              (char) => char.toUpperCase()
            )}`,
            url: `https://reddit.com/${sub.name}/comments/${sub.id}${day}${exampleIndex}`,
            sentiment,
            confidence,
            author: `u/${sentiment === "positive" ? "optimist" : sentiment === "negative" ? "skeptic" : "analyst"}${
              100 + Math.round(random() * 800)
            }`,
            score,
            snippet:
              sentiment === "positive"
                ? `Community loved the latest ${keyword} improvements and shared upgrade recipes.`
                : sentiment === "negative"
                ? `Thread captured pain points around ${keyword}, with proposals for fixes and support tickets.`
                : `Balanced debate exploring how ${keyword} impacts day-to-day Codex workstreams.`,
          };
        });

        subExampleMap.set(isoDate, dailyExamples);
        globalExampleMap.set(
          isoDate,
          (globalExampleMap.get(isoDate) ?? []).concat(
            dailyExamples.map((item) => ({ ...item, subredditId: sub.id }))
          )
        );
      }

      metricsBySubreddit[sub.id] = metrics;
      exampleLookup[sub.id] = subExampleMap;
    });

  const aggregateMap = new Map<string, InternalMetricAccumulator>();
  subredditConfigs
    .filter((config) => config.id !== "all")
    .forEach((config) => {
      const metrics = metricsBySubreddit[config.id];
      metrics.forEach((metric) => {
        const accumulator = aggregateMap.get(metric.date) ?? {
          totalVolume: 0,
          weightedSentiment: 0,
          positiveCount: 0,
          neutralCount: 0,
          negativeCount: 0,
          keywords: new Map<string, number>(),
        };

        accumulator.totalVolume += metric.totalVolume;
        accumulator.weightedSentiment += metric.avgSentiment * metric.totalVolume;
        accumulator.positiveCount += metric.positiveCount;
        accumulator.neutralCount += metric.neutralCount;
        accumulator.negativeCount += metric.negativeCount;
        metric.keywords.forEach((keyword) => {
          const current = accumulator.keywords.get(keyword.term) ?? 0;
          accumulator.keywords.set(keyword.term, current + keyword.weight);
        });

        aggregateMap.set(metric.date, accumulator);
      });
    });

  const aggregateMetrics: DailyMetric[] = Array.from(aggregateMap.entries())
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .map(([date, accumulator]) => {
      const keywords = Array.from(accumulator.keywords.entries())
        .map(([term, weight]) => ({ term, weight: parseFloat(weight.toFixed(1)) }))
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 8);

      const totalVolume = accumulator.totalVolume || 1;
      return {
        date,
        avgSentiment: Math.round((accumulator.weightedSentiment / totalVolume) * 10) / 10,
        positiveCount: accumulator.positiveCount,
        neutralCount: accumulator.neutralCount,
        negativeCount: accumulator.negativeCount,
        totalVolume,
        keywords,
      };
    });

  metricsBySubreddit.all = aggregateMetrics;
  exampleLookup.all = new Map(globalExampleMap);
  generated = true;
}

function ensureData() {
  if (!generated) {
    generateMockData();
  }
}

export function getSubreddits(): SubredditConfig[] {
  ensureData();
  return subredditConfigs;
}

export function getSubredditConfig(id: string): SubredditConfig | undefined {
  ensureData();
  return subredditConfigs.find((sub) => sub.id === id);
}

export function getAllMetrics(): Record<string, DailyMetric[]> {
  ensureData();
  return metricsBySubreddit;
}

export function getMetricsForSubreddit(id: string): DailyMetric[] {
  ensureData();
  return metricsBySubreddit[id] ?? [];
}

export function getMetricsForRange(
  id: string,
  startDate: string,
  endDate: string
): DailyMetric[] {
  ensureData();
  const metrics = metricsBySubreddit[id] ?? [];
  return metrics.filter((metric) => metric.date >= startDate && metric.date <= endDate);
}

export function getExamplesForDay(
  id: string,
  date: string
): ExampleItem[] {
  ensureData();
  const lookup = exampleLookup[id] ?? new Map<string, ExampleItem[]>();
  return [...(lookup.get(date) ?? [])];
}

export function getKeywordTotalsForRange(
  id: string,
  startDate: string,
  endDate: string,
  limit = 30
): KeywordMetric[] {
  ensureData();
  const keywordTotals = new Map<string, number>();
  const metrics = getMetricsForRange(id, startDate, endDate);
  metrics.forEach((metric) => {
    metric.keywords.forEach((keyword) => {
      const current = keywordTotals.get(keyword.term) ?? 0;
      keywordTotals.set(keyword.term, current + keyword.weight);
    });
  });

  return Array.from(keywordTotals.entries())
    .map(([term, weight]) => ({ term, weight: parseFloat(weight.toFixed(1)) }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);
}

export function getDateExtent() {
  ensureData();
  return { earliestDate, latestDate };
}

export function getLatestMetricDate(id: string): string | undefined {
  ensureData();
  return metricsBySubreddit[id]?.[metricsBySubreddit[id].length - 1]?.date;
}


export function getAllExamples(): Record<string, ExampleItem[]> {
  ensureData();
  const result: Record<string, ExampleItem[]> = {};
  Object.entries(exampleLookup).forEach(([id, lookup]) => {
    result[id] = Array.from(lookup.values()).flat();
  });
  return result;
}
