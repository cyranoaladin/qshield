import { Button } from "@/components/ui/button";
import { AddressInput } from "@/components/address-input";
import { RiskDisclaimer } from "@/components/risk-disclaimer";
import { getMessages } from "@/i18n/messages";
import Image from "next/image";

export default function HomePage() {
  const messages = getMessages("fr");

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto grid min-h-screen max-w-5xl content-center gap-8 px-6 py-16">
        <div className="flex items-center gap-4">
          <Image
            alt={messages.home.logoAlt}
            className="h-12 w-auto"
            height={80}
            src="/images/logo_nom.png"
            width={240}
          />
        </div>
        <div className="text-sm font-medium text-primary">
          <span>{messages.home.eyebrow}</span>
        </div>
        <div className="max-w-3xl space-y-5">
          <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-6xl">
            {messages.home.title}
          </h1>
          <p className="text-lg leading-8 text-foreground/70">{messages.home.description}</p>
        </div>
        <div className="max-w-3xl">
          <AddressInput copy={messages.home} />
        </div>
        <div className="max-w-3xl">
          <RiskDisclaimer text={messages.home.readOnly} />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="secondary">
            <a href="/articles/research-note-1.pdf">{messages.home.secondaryAction}</a>
          </Button>
          <Button asChild variant="secondary">
            <a href="/learn/why-solana">{messages.learn.title}</a>
          </Button>
          <Button asChild variant="secondary">
            <a href="/waitlist">{messages.waitlist.title}</a>
          </Button>
        </div>
      </section>
    </main>
  );
}
