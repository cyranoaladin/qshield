"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { requestWaitlist } from "@/lib/api";

type WaitlistFormProps = {
  readonly copy: {
    readonly apiError: string;
    readonly consent: string;
    readonly duplicate: string;
    readonly emailLabel: string;
    readonly sourceLabel: string;
    readonly submit: string;
    readonly success: string;
    readonly walletHelp: string;
    readonly walletLabel: string;
  };
};

export function WaitlistForm({ copy }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [wallet, setWallet] = useState("");
  const [source, setSource] = useState("");
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      className="grid gap-4 rounded-lg border bg-white p-5 shadow-sm"
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setMessage(null);

        try {
          const response = await requestWaitlist({
            consent,
            email,
            ...(source.trim().length === 0 ? {} : { source: source.trim() }),
            ...(wallet.trim().length === 0 ? {} : { wallet: wallet.trim() }),
          });

          setMessage(response.duplicate ? copy.duplicate : copy.success);
        } catch {
          setMessage(copy.apiError);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <label className="grid gap-2 text-sm font-medium">
        <span>{copy.emailLabel}</span>
        <input
          className="min-h-11 rounded-md border bg-background px-3 outline-none ring-primary/20 transition focus:ring-4"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        <span>{copy.walletLabel}</span>
        <input
          className="min-h-11 rounded-md border bg-background px-3 outline-none ring-primary/20 transition focus:ring-4"
          onChange={(event) => setWallet(event.target.value)}
          value={wallet}
        />
        <span className="text-xs font-normal text-foreground/60">{copy.walletHelp}</span>
      </label>
      <label className="grid gap-2 text-sm font-medium">
        <span>{copy.sourceLabel}</span>
        <input
          className="min-h-11 rounded-md border bg-background px-3 outline-none ring-primary/20 transition focus:ring-4"
          onChange={(event) => setSource(event.target.value)}
          value={source}
        />
      </label>
      <label className="flex items-start gap-3 text-sm leading-6">
        <input
          checked={consent}
          className="mt-1"
          onChange={(event) => setConsent(event.target.checked)}
          required
          type="checkbox"
        />
        <span>{copy.consent}</span>
      </label>
      <Button disabled={submitting} type="submit">
        {copy.submit}
      </Button>
      {message !== null && <p className="text-sm leading-6 text-foreground/70">{message}</p>}
    </form>
  );
}
