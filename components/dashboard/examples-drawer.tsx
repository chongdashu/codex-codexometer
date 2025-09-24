"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { DailyMetric, ExampleItem } from "@/data/mockMetrics";
import {
  formatDateLabel,
  formatNumber,
  formatPercent,
  formatPreciseNumber,
} from "@/lib/format";
import { hexToRgba } from "@/lib/color";

interface ExamplesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metric: DailyMetric | null;
  examples: ExampleItem[];
  accentColor: string;
}

export default function ExamplesDrawer({
  open,
  onOpenChange,
  metric,
  examples,
  accentColor,
}: ExamplesDrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col gap-4 border-l border-white/10 bg-slate-950/95 p-6 shadow-2xl outline-none">
          <header className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <Dialog.Title className="text-xl font-semibold text-slate-50">
                {metric
                  ? `Highlights for ${formatDateLabel(metric.date, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}`
                  : "Select a day"}
              </Dialog.Title>
              {metric && (
                <Dialog.Description className="mt-1 text-sm text-slate-300/85">
                  Sentiment {formatPreciseNumber(metric.avgSentiment)} • Volume {formatNumber(metric.totalVolume)} • Pos {formatPercent(
                    metric.positiveCount / Math.max(metric.totalVolume, 1)
                  )}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300 hover:border-white/30 hover:text-white">
              Close
            </Dialog.Close>
          </header>

          <div className="flex-1 overflow-y-auto pr-2">
            {examples.length === 0 ? (
              <p className="text-sm text-slate-300/85">
                We didn’t capture examples for this day yet. Try a different date to explore community posts and comments.
              </p>
            ) : (
              <ul className="flex flex-col gap-4">
                {examples.map((example) => (
                  <li
                    key={example.id}
                    className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow"
                    style={{ boxShadow: `0 18px 45px -30px ${hexToRgba(accentColor, 0.8)}` }}
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                      <span
                        className="rounded-full px-2 py-0.5"
                        style={{ backgroundColor: hexToRgba(accentColor, 0.2) }}
                      >
                        {example.sentiment}
                      </span>
                      <span>Confidence {formatPreciseNumber(example.confidence * 100)}%</span>
                      <span>Score {example.score}</span>
                      <span>{example.author}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-white">{example.title}</h3>
                    <p className="mt-2 text-sm text-slate-300/90">{example.snippet}</p>
                    <a
                      href={example.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center text-xs font-medium uppercase tracking-[0.2em] text-slate-200 hover:text-white"
                    >
                      View on Reddit ↗
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
