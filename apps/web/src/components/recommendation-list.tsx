type RecommendationListProps = {
  readonly items: readonly string[];
  readonly title: string;
};

export function RecommendationList({ items, title }: RecommendationListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <ul className="mt-4 grid gap-2 text-sm leading-6 text-foreground/75">
        {items.map((item) => (
          <li className="rounded-md bg-background p-3" key={item}>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
