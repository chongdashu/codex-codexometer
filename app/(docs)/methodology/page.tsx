import React from "react";
import Link from "next/link";
import fs from "node:fs";
import path from "node:path";

function parseMarkdown(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let list: string[] = [];

  const formatInline = (text: string) =>
    text
      .replace(/`([^`]+)`/g, "<code class=\\\"rounded bg-slate-900/80 px-1 text-xs text-sky-300\\\">$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  const flushList = () => {
    if (list.length === 0) return;
    elements.push(
      <ul key={`list-${elements.length}`} className="list-disc space-y-2 pl-6 text-slate-200/90">
        {list.map((item, index) => (
          <li key={index} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
        ))}
      </ul>
    );
    list = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    if (trimmed.startsWith("- ")) {
      list.push(trimmed.slice(2));
      return;
    }

    flushList();

    if (trimmed.startsWith("# ")) {
      elements.push(
        <h1 key={`h1-${elements.length}`} className="text-3xl font-semibold text-white">
          {trimmed.replace(/^#\s*/, "")}
        </h1>
      );
      return;
    }

    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2 key={`h2-${elements.length}`} className="pt-6 text-xl font-semibold text-white">
          {trimmed.replace(/^##\s*/, "")}
        </h2>
      );
      return;
    }

    elements.push(
      <p
        key={`p-${elements.length}`}
        className="text-sm leading-relaxed text-slate-200/90"
        dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
      />
    );
  });

  flushList();
  return elements;
}

export default function MethodologyPage() {
  const markdown = fs.readFileSync(
    path.join(process.cwd(), "content", "methodology.md"),
    "utf-8"
  );
  const nodes = parseMarkdown(markdown);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12 text-slate-100">
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300 hover:border-white/30 hover:text-white"
      >
        ← Back to dashboard
      </Link>
      <article className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-[var(--card)]/85 p-6 backdrop-blur">
        {nodes}
      </article>
    </div>
  );
}
