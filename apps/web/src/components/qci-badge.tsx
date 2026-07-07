type QciBadgeProps = {
  readonly label: string;
  readonly qci: number;
};

export function QciBadge({ label, qci }: QciBadgeProps) {
  const tone =
    qci >= 80 ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${tone}`}
    >
      <span>{label}</span>
      <span className="tabular-nums">{qci}</span>
    </div>
  );
}
