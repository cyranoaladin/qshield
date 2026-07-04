export const messages = {
  en: {
    home: {
      description:
        "Measure a Solana address exposure to future quantum attacks before moving assets into safer flows.",
      eyebrow: "Q-Scan MVP foundation",
      primaryAction: "Scan address",
      secondaryAction: "Learn why",
      title: "Q-Shield",
    },
    metadata: {
      description: "Quantum exposure scanning foundation for Solana accounts.",
      title: "Q-Shield",
    },
  },
  fr: {
    home: {
      description:
        "Mesurez l'exposition d'une adresse Solana aux futures attaques quantiques avant de déplacer les actifs vers des parcours plus sûrs.",
      eyebrow: "Fondation MVP Q-Scan",
      primaryAction: "Scanner une adresse",
      secondaryAction: "Comprendre le risque",
      title: "Q-Shield",
    },
    metadata: {
      description: "Fondation du scanner d'exposition quantique pour les comptes Solana.",
      title: "Q-Shield",
    },
  },
} as const;

export type Locale = keyof typeof messages;

export function getMessages(locale: Locale) {
  return messages[locale];
}
