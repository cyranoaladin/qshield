export const messages = {
  en: {
    home: {
      description:
        "Measure Solana migration criticality with QES/QCI before planning post-quantum readiness work.",
      eyebrow: "Post-Quantum Readiness for Solana",
      logoAlt: "QuantaLayer logo",
      primaryAction: "Scan address",
      secondaryAction: "Read the research note",
      title: "QuantaLayer",
    },
    metadata: {
      description: "Post-quantum readiness layer for Solana accounts and authorities.",
      title: "QuantaLayer",
    },
  },
  fr: {
    home: {
      description:
        "Mesurez la criticité de migration Solana avec QES/QCI avant de préparer une stratégie post-quantique.",
      eyebrow: "Post-Quantum Readiness for Solana",
      logoAlt: "Logo QuantaLayer",
      primaryAction: "Scanner une adresse",
      secondaryAction: "Lire la note de recherche",
      title: "QuantaLayer",
    },
    metadata: {
      description: "Couche de préparation post-quantique pour comptes et authorities Solana.",
      title: "QuantaLayer",
    },
  },
} as const;

export type Locale = keyof typeof messages;

export function getMessages(locale: Locale) {
  return messages[locale];
}
