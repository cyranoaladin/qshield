type ScoreBreakdownProps = {
  readonly breakdown: Record<string, number>;
  readonly labels: Record<string, string>;
  readonly title: string;
};

export function ScoreBreakdown({ breakdown, labels, title }: ScoreBreakdownProps) {
  return (
    <section className="rounded-lg border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4 grid gap-3">
        {Object.entries(breakdown).map(([key, value]) => (
          <div className="grid gap-2" key={key}>
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-foreground/70">{labels[key] ?? key}</span>
              <span className="font-medium tabular-nums">{value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border">
              <div
                className="h-full bg-primary"
                style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
