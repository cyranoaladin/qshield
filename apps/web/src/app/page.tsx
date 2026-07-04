import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getMessages } from "@/i18n/messages";

export default function HomePage() {
  const messages = getMessages("fr");

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-8 px-6 py-16">
        <div className="flex items-center gap-3 text-sm font-medium text-primary">
          <ShieldCheck aria-hidden="true" className="h-5 w-5" />
          <span>{messages.home.eyebrow}</span>
        </div>
        <div className="max-w-3xl space-y-5">
          <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-6xl">
            {messages.home.title}
          </h1>
          <p className="text-lg leading-8 text-foreground/70">{messages.home.description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <a href="#scan">{messages.home.primaryAction}</a>
          </Button>
          <Button asChild variant="secondary">
            <a href="#learn">{messages.home.secondaryAction}</a>
          </Button>
        </div>
      </section>
    </main>
  );
}
