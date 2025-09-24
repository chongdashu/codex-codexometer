"use client";

import type { SubredditConfig } from "@/data/mockMetrics";
import clsx from "clsx";

interface SubredditTabsProps {
  items: SubredditConfig[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function SubredditTabs({
  items,
  selectedId,
  onSelect,
}: SubredditTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isActive = item.id === selectedId;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={clsx(
              "relative flex min-w-[120px] items-center gap-2 rounded-2xl border px-3 py-2 text-left text-sm transition",
              isActive
                ? "border-white/80 bg-white text-slate-900 shadow-lg"
                : "border-white/10 bg-white/5 text-slate-200/80 hover:border-white/20 hover:bg-white/10"
            )}
            style={{
              boxShadow: isActive
                ? `0 12px 30px -20px ${item.accentColor}`
                : "none",
            }}
            aria-pressed={isActive}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.accentColor }}
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight">{item.name}</span>
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                {item.id === "all" ? "Blended" : "Focused"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
