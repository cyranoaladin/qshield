export const messages = {
  en: {
    common: {
      apiError: "Scan unavailable. Please try again later.",
      backHome: "Back to scan",
      researchNote: "Research Note #1",
    },
    home: {
      description:
        "Measure Solana migration criticality with QES/QCI before planning post-quantum readiness work.",
      eyebrow: "Post-Quantum Readiness for Solana",
      inputHelp: "Paste a public Solana address. No wallet connection is required.",
      inputLabel: "Solana address",
      inputPlaceholder: "11111111111111111111111111111111",
      logoAlt: "QuantaLayer logo",
      primaryAction: "Scan address",
      readOnly: "Read-only - we never ask for a seed phrase.",
      secondaryAction: "Read the research note",
      statsAction: "View aggregate stats",
      title: "QuantaLayer",
    },
    learn: {
      cards: [
        {
          body: "Solana keypair-controlled accounts use an Ed25519 public key as the address. Program Derived Addresses are off-curve and controlled by program logic, not by a private key.",
          title: "Address model",
        },
        {
          body: "Shor's algorithm would threaten elliptic-curve signatures if a cryptographically relevant quantum computer existed. Grover's algorithm gives only a quadratic search speedup against hashes.",
          title: "Cryptographic background",
        },
        {
          body: "QuantaLayer Scan estimates migration criticality and confidence from observable assets, stake, age, recent activity and data completeness. It is not a security audit.",
          title: "What Scan measures",
        },
        {
          body: "Scan does not migrate accounts, does not sign transactions, does not custody assets and does not perform Solana's protocol migration.",
          title: "What Scan does not measure",
        },
        {
          body: "QuantaLayer Vault remains experimental and must not be used for real funds until public devnet testing, audits, caps and recovery documentation are published.",
          title: "Vault status",
        },
      ],
      description:
        "A concise explanation of why Solana post-quantum readiness involves wallets, authorities, programs, token accounts and data quality.",
      sources:
        "Sources include the public Research Note, Solana documentation and cited ecosystem research.",
      title: "Why Solana readiness is different",
    },
    metadata: {
      description: "Post-quantum readiness layer for Solana accounts and authorities.",
      title: "QuantaLayer",
    },
    results: {
      breakdownLabels: {
        concentration: "Concentration",
        observableAge: "Observable age",
        observableAssetValue: "Observable asset value",
        recentActivity: "Recent activity",
        significantTokenAccounts: "Significant token accounts",
        stakedOrLockedAssets: "Staked or locked assets",
      },
      breakdownTitle: "Score breakdown",
      cacheHit: "Served from cache",
      cacheMiss: "Fresh scan",
      empty: "No scan result yet.",
      gradeHidden: "Grade hidden because QCI is below 40.",
      loading: "Scanning public data...",
      qci: "QCI",
      qes: "QES",
      recommendationsTitle: "Recommendations",
      retry: "Retry scan",
      shareCaption: "Migration Readiness Score",
      value: "Estimated migration exposure value",
      warningsTitle: "Limitations",
    },
    scan: {
      description:
        "This page scans public Solana data and returns QES/QCI with confidence-aware display rules.",
      title: "Scan result",
    },
    stats: {
      averageQci: "Average QCI",
      averageQes: "Average QES",
      description:
        "Aggregate QuantaLayer Scan metrics. No raw addresses or public rankings are shown.",
      gradeDistribution: "Grade distribution",
      lastScanTimestamp: "Last scan",
      title: "Aggregate dashboard",
      totalEstimatedMigrationExposureValueUsd: "Total observable asset value",
      totalScans: "Total scans",
    },
    waitlist: {
      consent: "I agree to be contacted about QuantaLayer updates.",
      description: "Join the private beta list for QuantaLayer Scan.",
      duplicate: "This email is already on the waitlist.",
      emailLabel: "Email",
      sourceLabel: "Source",
      submit: "Join waitlist",
      success: "Waitlist registration recorded.",
      title: "Waitlist",
      walletHelp: "Optional. Public Solana address only.",
      walletLabel: "Wallet",
    },
  },
  fr: {
    common: {
      apiError: "Scan indisponible. Réessayez plus tard.",
      backHome: "Retour au scan",
      researchNote: "Research Note #1",
    },
    home: {
      description:
        "Mesurez la criticité de migration Solana avec QES/QCI avant de préparer une stratégie post-quantique.",
      eyebrow: "Post-Quantum Readiness for Solana",
      inputHelp: "Collez une adresse publique Solana. Aucune connexion wallet n'est requise.",
      inputLabel: "Adresse Solana",
      inputPlaceholder: "11111111111111111111111111111111",
      logoAlt: "Logo QuantaLayer",
      primaryAction: "Scanner une adresse",
      readOnly: "Lecture seule - nous ne demandons jamais de seed phrase.",
      secondaryAction: "Lire la note de recherche",
      statsAction: "Voir les statistiques agrégées",
      title: "QuantaLayer",
    },
    learn: {
      cards: [
        {
          body: "Les comptes Solana contrôlés par keypair utilisent une clé publique Ed25519 comme adresse. Les Program Derived Addresses sont hors courbe et contrôlées par la logique d'un programme, pas par une clé privée.",
          title: "Modèle d'adresse",
        },
        {
          body: "L'algorithme de Shor menacerait les signatures sur courbes elliptiques si un ordinateur quantique cryptographiquement pertinent existait. Grover n'apporte qu'une accélération quadratique contre les hashes.",
          title: "Contexte cryptographique",
        },
        {
          body: "QuantaLayer Scan estime la criticité de migration et la confiance à partir des actifs observables, du stake, de l'ancienneté, de l'activité récente et de la complétude des données. Ce n'est pas un audit de sécurité.",
          title: "Ce que Scan mesure",
        },
        {
          body: "Scan ne migre pas les comptes, ne signe pas de transactions, ne garde pas d'actifs et n'effectue pas la migration protocolaire de Solana.",
          title: "Ce que Scan ne mesure pas",
        },
        {
          body: "QuantaLayer Vault reste expérimental et ne doit pas être utilisé avec de vrais fonds avant tests devnet publics, audits, plafonds et documentation de recovery.",
          title: "Statut du Vault",
        },
      ],
      description:
        "Une explication concise des raisons pour lesquelles la préparation post-quantique Solana implique wallets, authorities, programmes, token accounts et qualité des données.",
      sources:
        "Sources principales : Research Note publique, documentation Solana et travaux écosystème cités.",
      title: "Pourquoi la readiness Solana est différente",
    },
    metadata: {
      description: "Couche de préparation post-quantique pour comptes et authorities Solana.",
      title: "QuantaLayer",
    },
    results: {
      breakdownLabels: {
        concentration: "Concentration",
        observableAge: "Ancienneté observable",
        observableAssetValue: "Valeur observable",
        recentActivity: "Activité récente",
        significantTokenAccounts: "Token accounts significatifs",
        stakedOrLockedAssets: "Actifs stakés ou verrouillés",
      },
      breakdownTitle: "Détail du score",
      cacheHit: "Servi depuis le cache",
      cacheMiss: "Scan frais",
      empty: "Aucun résultat de scan.",
      gradeHidden: "Grade masqué car le QCI est inférieur à 40.",
      loading: "Scan des données publiques...",
      qci: "QCI",
      qes: "QES",
      recommendationsTitle: "Recommandations",
      retry: "Relancer le scan",
      shareCaption: "Migration Readiness Score",
      value: "Valeur d'exposition estimée",
      warningsTitle: "Limites",
    },
    scan: {
      description:
        "Cette page analyse des données publiques Solana et retourne QES/QCI avec règles d'affichage liées à la confiance.",
      title: "Résultat du scan",
    },
    stats: {
      averageQci: "QCI moyen",
      averageQes: "QES moyen",
      description:
        "Métriques agrégées QuantaLayer Scan. Aucune adresse brute ni classement public n'est affiché.",
      gradeDistribution: "Distribution des grades",
      lastScanTimestamp: "Dernier scan",
      title: "Dashboard agrégé",
      totalEstimatedMigrationExposureValueUsd: "Valeur observable totale",
      totalScans: "Scans totaux",
    },
    waitlist: {
      consent: "J'accepte d'être contacté au sujet des mises à jour QuantaLayer.",
      description: "Rejoindre la liste beta privée de QuantaLayer Scan.",
      duplicate: "Cet email est déjà inscrit.",
      emailLabel: "Email",
      sourceLabel: "Source",
      submit: "Rejoindre la waitlist",
      success: "Inscription enregistrée.",
      title: "Waitlist",
      walletHelp: "Optionnel. Adresse publique Solana uniquement.",
      walletLabel: "Wallet",
    },
  },
} as const;

export type Locale = keyof typeof messages;

export function getMessages(locale: Locale) {
  return messages[locale];
}
