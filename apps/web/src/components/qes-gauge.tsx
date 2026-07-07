type QesGaugeProps = {
  readonly grade: string | null;
  readonly gradeDisplayed: boolean;
  readonly hiddenCopy: string;
  readonly label: string;
  readonly qes: number | null;
};

export function QesGauge({ grade, gradeDisplayed, hiddenCopy, label, qes }: QesGaugeProps) {
  const value = qes ?? 0;
  const displayedGrade = gradeDisplayed ? grade : grade === "N/A" ? "N/A" : "-";

  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-foreground/65">{label}</span>
        <span className="rounded-full border px-3 py-1 text-sm font-semibold">
          {displayedGrade}
        </span>
      </div>
      <div className="mt-5 flex items-end gap-3">
        <span className="text-5xl font-semibold tabular-nums text-foreground">
          {qes === null ? "-" : value}
        </span>
        <span className="pb-2 text-sm text-foreground/55">/100</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-border">
        <div className="h-full bg-primary" style={{ width: `${value}%` }} />
      </div>
      {!gradeDisplayed && <p className="mt-3 text-sm leading-6 text-foreground/65">{hiddenCopy}</p>}
    </div>
  );
}
