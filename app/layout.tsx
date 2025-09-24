import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Codex Sentiment Monitor",
  description:
    "Daily Reddit sentiment and volume trends for Codex CLI/IDE across r/ChatGPT, r/OpenAI, r/ChatGPTPro, and r/codex.",
  openGraph: {
    title: "Codex Sentiment Monitor",
    description:
      "Track Reddit mood swings, keyword momentum, and community highlights for Codex CLI/IDE.",
    type: "website",
  },
  metadataBase: new URL("https://codexometer.example"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
