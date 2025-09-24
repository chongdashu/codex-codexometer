# Codex Sentiment Monitor

A Next.js 15 dashboard that visualizes Reddit sentiment and discussion volume for Codex CLI/IDE communities. The interface mirrors the Supabase + Edge Functions pipeline defined in the PRD and implementation plan and ships with mock data for 90 days so the experience is fully interactive offline.

## Features
- Combined and per-subreddit views for r/ChatGPT, r/OpenAI, r/ChatGPTPro, and r/codex.
- Sentiment/volume chart (line + bar) with drill-down into daily examples.
- Keyword momentum cloud, automated insight cards, and detailed daily activity table.
- CSV export for the selected time window and lightweight API routes for integrations.
- Methodology page describing the ingestion, scoring, and quality guardrails.

## Running locally
```bash
pnpm install
pnpm dev
```

The development server starts on [http://localhost:3000](http://localhost:3000). The dashboard uses deterministic mock data so no external services are required.

## Available scripts
```bash
pnpm lint    # Run Next.js lint checks
pnpm build   # Create a production build
pnpm start   # Start the production server (after build)
```

## Project structure
- `app/(dashboard)` – Main dashboard experience.
- `app/(docs)/methodology` – Methodology landing page built from `content/methodology.md`.
- `app/api` – Mock JSON endpoints for metrics and daily examples.
- `components/dashboard` – Reusable UI building blocks (charts, tabs, drawers, etc.).
- `data/mockMetrics.ts` – Seeded generator providing 90 days of Reddit-like metrics and examples.

## Tech stack
- Next.js App Router (React 19) with TypeScript
- Tailwind CSS (v4) with custom theming
- `@visx/xychart` for performant SVG visualizations
- `@radix-ui/react-dialog` and `lucide-react` for polished UI interactions

Feel free to extend the mock data connectors with real Supabase storage when you are ready to wire up the live pipeline.
