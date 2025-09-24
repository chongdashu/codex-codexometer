export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-sky-500/15 via-fuchsia-500/10 to-transparent blur-3xl" />
      <main className="relative z-0">{children}</main>
    </div>
  );
}
