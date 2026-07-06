import { RiskDisclaimer } from "@/components/risk-disclaimer";
import { Button } from "@/components/ui/button";
import { WaitlistForm } from "@/components/waitlist-form";
import { getMessages } from "@/i18n/messages";

export default function WaitlistPage() {
  const messages = getMessages("fr");

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto grid max-w-3xl gap-8">
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
            {messages.waitlist.title}
          </h1>
          <p className="text-base leading-7 text-foreground/70">{messages.waitlist.description}</p>
        </header>
        <RiskDisclaimer text={messages.home.readOnly} />
        <WaitlistForm
          copy={{
            apiError: messages.common.apiError,
            ...messages.waitlist,
          }}
        />
      </div>
    </main>
  );
}
