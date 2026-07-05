# Threat Model Q-Scan

Statut: normatif pour Phase 1. Ce document couvre Q-Scan, le scanner public et
read-only de Q-Shield. Q-Vault et Q-Notary ont besoin de modeles separes avant
production.

## Scope

Q-Scan accepte une adresse Solana publique, collecte des donnees publiques via
des fournisseurs RPC/prix, calcule un QES et retourne un resultat pedagogique.
Le produit ne collecte pas de seed phrase, ne signe pas de transaction, ne
detient pas de fonds et ne demande aucun secret.

## Protected Assets

| Asset                            | Protection goal                                                               |
| -------------------------------- | ----------------------------------------------------------------------------- |
| Disponibilite de l'API scan      | Eviter qu'un usage abusif rende le service inutilisable.                      |
| Cout RPC et prix                 | Limiter la consommation Helius/Jupiter provoquee par des acteurs automatises. |
| Integrite du QES                 | Eviter les scores partiels, modifies ou non reproductibles.                   |
| Confidentialite des utilisateurs | Ne pas creer de base nominative reliant IP, email et adresse scannee.         |
| Reputation editoriale            | Eviter les messages alarmistes ou non sources.                                |
| Donnees waitlist                 | Proteger les emails opt-in et les chemins de suppression RGPD.                |
| Statistiques publiques           | Publier seulement des agregats anonymises, jamais des listes de wallets.      |

## Assumptions

- Les adresses et soldes Solana lus par Q-Scan sont deja publics sur la chaine.
- Les reponses RPC et prix sont non fiables jusqu'a validation Zod dans la data
  layer.
- Le cache et la base peuvent tomber en panne; le service doit echouer ferme sur
  une donnee partielle.
- Les screenshots, badges et liens partages peuvent etre sortis de leur contexte.
- La menace quantique est prospective; le calendrier de Q-Day reste incertain.

## Explicit Non-Threats

- Q-Scan n'augmente pas l'exposition cryptographique d'un wallet: il lit des
  donnees publiques deja accessibles.
- Scanner une adresse ne donne pas a Q-Shield la capacite de deplacer des fonds.
- Un QES eleve ne signifie pas qu'une attaque est en cours.
- Un QES bas ne certifie pas qu'un wallet est sur dans tous les modeles de
  menace.
- Les PDA ne sont pas traitees comme des wallets utilisateurs Ed25519; leur
  risque principal depend du programme qui les controle.
- Q-Scan ne protege pas contre phishing, malware local, compromission de seed,
  erreur de gouvernance ou bug de programme tiers.

## STRIDE-Lite

| Category               | Threat                                                               | Impact                                                         | Mitigations                                                                                                               |
| ---------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Spoofing               | Un attaquant presente un site clone ou un faux badge QES.            | Phishing, perte de confiance, confusion publique.              | Domaine canonique, wording claims_matrix, badges OG tronques en LOT-09, liens officiels dans l'UI LOT-08.                 |
| Tampering              | Reponse RPC, prix ou cache modifiee avant scoring.                   | QES incorrect ou recommandations trompeuses.                   | Validation Zod des frontieres externes LOT-05, erreurs upstream fail-closed LOT-06, provenance dans RawWalletScan LOT-05. |
| Repudiation            | Un utilisateur conteste un score partage hors contexte.              | Support difficile, risque reputational.                        | Version QES dans chaque resultat LOT-04, timestamp, sources, limitations visibles LOT-08.                                 |
| Information disclosure | Logs ou base stockent adresses brutes, IP ou emails non necessaires. | Constitution de listes exploitables et risque RGPD.            | Logs minimaux LOT-06, hash d'adresse et retention documentee LOT-07, pas de leaderboard nominatif LOT-09.                 |
| Denial of service      | Scans automatises consomment RPC, CPU, Redis ou quota CI/CD.         | Cout, latence, indisponibilite.                                | Rate limiting Redis LOT-06, cache 1 h LOT-06, retries bornes LOT-05, load test LOT-10.                                    |
| Elevation of privilege | Une future integration wallet demande une signature excessive.       | Autorisation non voulue ou confusion avec une action on-chain. | Phase 1 read-only, pas de transaction, SIWS separe si ajoute plus tard, revue securite avant P2.                          |

## Abuse Cases

| Abuse case                                       | Scenario                                                                                          | Risk                                                         | Required mitigation and LOT mapping                                                                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Third-party wallet scanning for victim targeting | Un acteur scanne beaucoup d'adresses publiques appartenant a autrui pour prioriser des victimes.  | Facilitation de ciblage social ou phishing.                  | Rate limiting par IP et cache LOT-06; wording qui rappelle que le scan est public; pas d'enrichissement nominatif.                                   |
| API scraping to build whale lists                | Un bot utilise l'API pour produire une liste de gros wallets et de scores.                        | Creation d'un dataset exploitable hors contexte.             | Ne jamais stocker ni retourner de donnees nominatives inutiles; stockage hash d'adresse LOT-07; statistiques publiques en agregats seulement LOT-09. |
| QES screenshots as phishing pretexts             | Un attaquant envoie un screenshot alarmiste pour pousser l'utilisateur vers une fausse migration. | Perte de fonds via phishing.                                 | OG avec adresse tronquee et wording factuel LOT-09; limitations et disclaimer visibles LOT-08; claims_matrix appliquee partout LOT-3.5.              |
| FUD amplification via global dashboard           | Des chiffres globaux sont presentes comme preuve d'une crise immediate.                           | Dommage reputational pour Q-Shield et information trompeuse. | Claims_matrix comme source editoriale LOT-3.5; dashboard limite aux agregats anonymises LOT-09; pas de leaderboard nominatif en MVP.                 |
| Cache poisoning                                  | Un acteur cherche a faire persister un resultat faux pour une adresse.                            | Score errone servi pendant le TTL.                           | Cle cache derivee de l'adresse normalisee LOT-06; validation complete avant mise en cache LOT-05/LOT-06; TTL borne.                                  |
| Provider quota exhaustion                        | Un acteur force des scans cache-miss sur adresses aleatoires.                                     | Cout RPC et degradation du service.                          | Validation d'adresse avant RPC LOT-05/LOT-06; rate limiting LOT-06; circuit-breaker et runbook LOT-10.                                               |
| Waitlist correlation                             | Une adresse scannee et un email waitlist sont rapproches sans base legale.                        | Risque RGPD et perte de confiance.                           | Consentement explicite LOT-07; separation logique des tables; politique de retention LOT-07.                                                         |

## Fail-Closed Rules

- Aucun score partiel: si une source necessaire echoue ou ne parse pas, l'API
  retourne une erreur problem+json.
- Aucun secret dans les logs: pas de body complet, pas de seed phrase, pas de
  signature utilisateur hors SIWS si ajoute plus tard.
- Aucun enrichissement nominatif: pas de resolution identitaire, pas de
  leaderboard par wallet en MVP.
- Aucune affirmation sensible sans source: claims_matrix est la reference avant
  publication.

## Review Triggers

Mettre a jour ce document avant de livrer:

- LOT-06 si le contrat API `/scan` change.
- LOT-07 si le schema de donnees ou la retention changent.
- LOT-08 si la pedagogie publique ajoute une nouvelle affirmation sensible.
- LOT-09 si les badges OG ou le dashboard changent de format.
- LOT-10 apres les tests de charge et le runbook de securite MVP.
