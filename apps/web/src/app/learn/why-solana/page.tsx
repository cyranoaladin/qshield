import { RiskDisclaimer } from "@/components/risk-disclaimer";
import { Button } from "@/components/ui/button";
import { getMessages } from "@/i18n/messages";

export default function WhySolanaPage() {
  const messages = getMessages("fr");

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
            {messages.learn.title}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-foreground/70">
            {messages.learn.description}
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {messages.learn.cards.map((card) => (
            <article className="rounded-lg border bg-white p-5 shadow-sm" key={card.title}>
              <h2 className="text-lg font-semibold">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-foreground/70">{card.body}</p>
            </article>
          ))}
        </div>
        <RiskDisclaimer text={messages.learn.sources} />
      </div>
    </main>
  );
}
