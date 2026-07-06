import { AddressInput } from "@/components/address-input";
import { RiskDisclaimer } from "@/components/risk-disclaimer";
import { ScanResultClient } from "@/components/scan-result-client";
import { Button } from "@/components/ui/button";
import { getMessages } from "@/i18n/messages";

type ScanPageProps = {
  readonly params: Promise<{
    readonly address: string;
  }>;
};

export default async function ScanPage({ params }: ScanPageProps) {
  const messages = getMessages("fr");
  const { address } = await params;
  const decodedAddress = decodeURIComponent(address);

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto grid max-w-5xl gap-8">
        <nav className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="secondary">
            <a href="/">{messages.common.backHome}</a>
          </Button>
          <Button asChild variant="secondary">
            <a href="/articles/research-note-1.pdf">{messages.common.researchNote}</a>
          </Button>
        </nav>
        <header className="grid gap-3">
          <p className="text-sm font-medium text-primary">{messages.home.eyebrow}</p>
          <h1 className="text-3xl font-semibold tracking-normal sm:text-5xl">
            {messages.scan.title}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-foreground/70">
            {messages.scan.description}
          </p>
        </header>
        <AddressInput copy={messages.home} initialAddress={decodedAddress} />
        <RiskDisclaimer text={messages.home.readOnly} />
        <ScanResultClient
          address={decodedAddress}
          copy={{
            commonError: messages.common.apiError,
            results: messages.results,
          }}
        />
      </div>
    </main>
  );
}
