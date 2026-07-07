type ShareBadgeProps = {
  readonly address: string;
  readonly caption: string;
  readonly grade: string | null;
  readonly gradeDisplayed: boolean;
  readonly qci: number;
  readonly qes: number | null;
};

export function ShareBadge({ address, caption, grade, gradeDisplayed, qci, qes }: ShareBadgeProps) {
  const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;
  const params = new URLSearchParams({
    address,
    qci: String(qci),
    qes: String(qes ?? ""),
    ...(gradeDisplayed && grade !== null ? { grade } : {}),
  });

  return (
    <a
      className="inline-flex items-center gap-3 rounded-lg border bg-white px-4 py-3 text-sm font-medium shadow-sm transition hover:border-primary"
      href={`/api/og/score?${params.toString()}`}
    >
      <span>{caption}</span>
      <span className="text-foreground/55">{shortAddress}</span>
    </a>
  );
}
