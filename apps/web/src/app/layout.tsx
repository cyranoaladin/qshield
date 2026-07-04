import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import { getMessages } from "@/i18n/messages";

const messages = getMessages("fr");

export const metadata: Metadata = {
  description: messages.metadata.description,
  title: messages.metadata.title,
};

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
