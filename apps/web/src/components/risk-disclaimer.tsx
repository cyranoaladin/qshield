type RiskDisclaimerProps = {
  readonly text: string;
};

export function RiskDisclaimer({ text }: RiskDisclaimerProps) {
  return (
    <p className="rounded-lg border bg-white p-4 text-sm leading-6 text-foreground/70 shadow-sm">
      {text}
    </p>
  );
}
