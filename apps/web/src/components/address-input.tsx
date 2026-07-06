"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type AddressInputProps = {
  readonly copy: {
    readonly inputHelp: string;
    readonly inputLabel: string;
    readonly inputPlaceholder: string;
    readonly primaryAction: string;
  };
  readonly initialAddress?: string;
};

export function AddressInput({ copy, initialAddress = "" }: AddressInputProps) {
  const router = useRouter();
  const [address, setAddress] = useState(initialAddress);

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const nextAddress = address.trim();

        if (nextAddress.length > 0) {
          router.push(`/scan/${encodeURIComponent(nextAddress)}`);
        }
      }}
    >
      <label className="text-sm font-medium text-foreground" htmlFor="address">
        {copy.inputLabel}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          className="min-h-11 flex-1 rounded-md border bg-background px-3 text-sm outline-none ring-primary/20 transition focus:ring-4"
          id="address"
          inputMode="text"
          onChange={(event) => setAddress(event.target.value)}
          placeholder={copy.inputPlaceholder}
          value={address}
        />
        <Button className="min-h-11 shrink-0" type="submit">
          {copy.primaryAction}
        </Button>
      </div>
      <p className="text-sm leading-6 text-foreground/65">{copy.inputHelp}</p>
    </form>
  );
}
