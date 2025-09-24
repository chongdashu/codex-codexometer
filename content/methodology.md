# Methodology

## Data Sources
- Reddit API with OAuth service credentials scoped to r/ChatGPT, r/OpenAI, r/ChatGPTPro, and r/codex.
- Scheduled pulls every 30 minutes via Supabase Edge Functions with nightly backfills to keep a 90 day window hydrated.

## Ingestion & Storage
- Raw JSON for posts and top level comments is persisted in `reddit_items_raw` alongside the source subreddit and ingest timestamp.
- A normalization job unwraps markdown, applies language detection, removes deleted/bot traffic, and stores curated records in `reddit_items_clean`.
- Each cleaned record links to `sentiment_scores`, populated asynchronously through the Hugging Face Inference API (DistilRoBERTa sentiment) with batched requests and retry logic.

## Aggregation Model
- A rolling procedure `refresh_daily_metrics()` rebuilds the last 7 days nightly to capture late arriving items and ensure the `daily_metrics` table reflects the latest sentiment.
- Weighted sentiment averages rely on upvote score and confidence weighting, while keyword extraction uses `tsvector` with tf-idf style ranking. The front-end consumes the materialized view for fast reads.

## Quality Controls
- Spam detection combines karma checks, posting cadence, and link density heuristics; records that exceed thresholds are excluded from downstream scoring.
- Weekly stratified sampling feeds a human review workflow with exported CSVs for accuracy tuning and bot blacklist updates.
- Monitoring includes freshness checks: dashboards surface a banner when the newest metric is older than six hours.

## Transparency & Governance
- Model versioning, filtering rules, and known limitations are published here so that analysts understand how the score is produced.
- Raw Reddit links remain accessible for every surfaced example to encourage manual validation and context gathering.
