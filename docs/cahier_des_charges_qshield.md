# CAHIER DES CHARGES — PROJET « Q-SHIELD »

## Suite de protection post-quantique sur Solana

**Version :** 1.0 — Juillet 2026
**Statut :** Draft de lancement
**Chef de projet :** Alaeddine Ben Rhouma
**Confidentialité :** Interne

---

## 1. CONTEXTE ET OPPORTUNITÉ

### 1.1 Contexte réglementaire et marché

- L'ANSSI (France) cesse de certifier les produits de sécurité non résistants au quantique à partir de 2027 ; obligation d'achat « quantum-safe » pour les entreprises d'ici 2030.
- Les États-Unis imposent la migration post-quantique aux agences fédérales d'ici 2031 (NSM-10, CNSA 2.0).
- Le NIST a standardisé ML-KEM (FIPS 203), ML-DSA/Dilithium (FIPS 204) et SLH-DSA/SPHINCS+ (FIPS 205) en août 2024.
- Algorand occupe seule la narrative « blockchain quantum-ready ». Solana n'a pas de roadmap PQ officielle.

### 1.2 La faille narrative exploitable sur Solana

Sur Solana, **l'adresse d'un compte EST la clé publique Ed25519** (pas de hachage intermédiaire comme sur Bitcoin). Conséquence :

> **100 % des comptes Solana ont leur clé publique exposée on-chain dès leur création.** Face à un ordinateur quantique exécutant l'algorithme de Shor, la totalité des fonds non protégés est théoriquement récupérable (« harvest now, decrypt later »).

C'est un argument marketing d'une puissance rare : vérifiable, honnête, anxiogène juste ce qu'il faut, et aucun concurrent ne l'exploite.

### 1.3 Précédent technique

Le **Solana Winternitz Vault** (Dean Little / Zeus Network, janvier 2025, open-source) prouve qu'un coffre à signatures hash-based (WOTS+, réputées quantum-résistantes) est implémentable **sans modification du protocole Solana**. Aucun produit grand public n'a été construit dessus. Le terrain est libre.

---

## 2. VISION PRODUIT

**Q-Shield** = la première suite de protection post-quantique grand public sur Solana, en trois briques progressives :

| Brique | Produit      | Rôle                                                                           |
| ------ | ------------ | ------------------------------------------------------------------------------ |
| **P1** | **Q-Scan**   | Scanner d'exposition quantique — acquisition virale, coût quasi nul            |
| **P2** | **Q-Vault**  | Coffre non-custodial à signatures hash-based — le produit sérieux, monétisable |
| **P3** | **Q-Notary** | Ancrage de documents à double signature (Ed25519 + ML-DSA) — B2B institutions  |

**Proposition de valeur en une phrase :** « Mesurez votre exposition au risque quantique, puis protégez vos actifs — dès aujourd'hui, sur Solana. »

---

## 3. SPÉCIFICATIONS FONCTIONNELLES — PHASE 1 : Q-SCAN

### 3.1 Parcours utilisateur

1. L'utilisateur saisit une adresse Solana (ou connecte son wallet — Phantom, Solflare, Backpack).
2. Le moteur analyse le compte et calcule un **Quantum Exposure Score (QES)** de 0 à 100.
3. Restitution : jauge visuelle, montant en USD « à risque », badge partageable (image OG générée dynamiquement pour X/Twitter).
4. CTA : rapport détaillé premium + inscription à la waitlist Q-Vault.

### 3.2 Moteur de scoring QES

Le score agrège des facteurs pondérés. Honnêteté technique : sur Solana toute clé est exposée, donc le score mesure **la valeur à risque et la difficulté de migration**, pas l'exposition binaire.

| Facteur                                                    | Poids | Détail                                                               |
| ---------------------------------------------------------- | ----- | -------------------------------------------------------------------- |
| Valeur totale (SOL + SPL + NFT floor)                      | 35 %  | Paliers logarithmiques                                               |
| Ancienneté du compte                                       | 10 %  | Plus le compte est vieux, plus la fenêtre « harvest now » est longue |
| SOL staké / verrouillé (vesting, LP)                       | 20 %  | Fonds difficiles à migrer rapidement le jour J                       |
| Nombre de token accounts actifs                            | 10 %  | Complexité de migration                                              |
| Activité récente                                           | 10 %  | Compte dormant = migration improbable à temps                        |
| Concentration (part du portefeuille sur une seule adresse) | 15 %  | Absence de compartimentage                                           |

Sortie JSON du moteur :

```json
{
  "address": "…",
  "qes": 78,
  "grade": "D",
  "value_at_risk_usd": 45230.12,
  "breakdown": {
    "value": 31,
    "age": 8,
    "staked": 17,
    "tokens": 6,
    "activity": 4,
    "concentration": 12
  },
  "recommendations": ["…"],
  "scanned_at": "2026-07-04T12:00:00Z"
}
```

### 3.3 Fonctionnalités MVP (sprint 1–2)

- [F1] Scan par adresse publique (sans connexion wallet)
- [F2] Score QES + jauge + montant à risque
- [F3] Image OG dynamique partageable (« Mon score quantique : 78/100 😱 »)
- [F4] Dashboard global public : « X M$ scannés, exposition moyenne du réseau »
- [F5] Waitlist Q-Vault (email + wallet)
- [F6] Page pédagogique « Pourquoi Solana est exposée » (SEO)

### 3.4 Fonctionnalités v1.1 (sprint 3–4)

- [F7] Connexion wallet + scan multi-comptes
- [F8] Rapport PDF premium (paiement en SOL/USDC via Solana Pay)
- [F9] Monitoring : alerte email si le profil de risque change
- [F10] API publique (freemium) — les médias crypto adorent citer des chiffres
- [F11] Leaderboard anonymisé des plus grosses expositions (whales)

### 3.5 Ce que Q-Scan ne fait PAS (anti-scope)

- Pas de custody, pas de clés privées manipulées, jamais.
- Pas de promesse de « protection » en phase 1 — uniquement de la mesure.
- Pas de FUD mensonger : chaque affirmation technique sourcée (NIST, papers Shor/Grover) sur la page pédagogique.

---

## 4. SPÉCIFICATIONS FONCTIONNELLES — PHASE 2 : Q-VAULT

### 4.1 Principe

Coffre non-custodial dont l'ouverture exige une **signature Winternitz One-Time (WOTS+)**, basée uniquement sur des fonctions de hachage (résistantes à Shor, affaiblies mais non cassées par Grover).

### 4.2 Mécanique (héritée du Winternitz Vault open-source)

1. **Création** : génération locale (client-side, WASM) d'une paire WOTS+. L'adresse du vault (PDA) est dérivée du hash de la clé publique WOTS → la clé publique n'est jamais exposée avant l'ouverture.
2. **Dépôt** : transfert de SOL vers le PDA. Opération standard.
3. **Ouverture** : deux instructions —
   - `split` : signature WOTS+ vérifiée on-chain, envoi d'un montant vers une adresse cible, solde vers un nouveau vault (les clés WOTS étant à usage unique).
   - `refund` : fermeture complète vers une adresse de secours définie à la création.
4. **Rotation** : chaque ouverture régénère automatiquement un nouveau vault (UX invisible pour l'utilisateur).

### 4.3 Exigences

- Programme Anchor audité (2 audits indépendants avant mainnet).
- Génération de clés 100 % client-side ; seed WOTS chiffré localement (Argon2id + AES-256-GCM), export papier/fichier obligatoire à la création.
- Support SOL natif au lancement ; SPL tokens en v2.
- Frais protocole : 0,1–0,3 % au retrait (modèle économique principal).

---

## 5. SPÉCIFICATIONS FONCTIONNELLES — PHASE 3 : Q-NOTARY (B2B)

- Ancrage on-chain du hash SHA-256 d'un document + **double signature** : Ed25519 (compatibilité) + ML-DSA-65 (post-quantique, off-chain, stockée sur IPFS/Arweave avec le certificat).
- Vérificateur public web + API.
- Cibles : établissements scolaires (diplômes, relevés — synergie directe Korrigo/Nexus Réussite), notaires, RH, propriété intellectuelle.
- Argument commercial : conformité anticipée ANSSI 2027 / échéances 2030.

---

## 6. ARCHITECTURE TECHNIQUE

### 6.1 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                     │
│   Next.js 15 App Router · Tailwind · wallet-adapter      │
│   Génération OG images (@vercel/og) · i18n FR/EN         │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS / tRPC ou REST
┌────────────────────▼────────────────────────────────────┐
│                 API BACKEND (VPS Hetzner)                │
│   Node.js (Fastify) ou Next API routes                   │
│   ├── Scoring Engine (service TypeScript pur, testable)  │
│   ├── Queue BullMQ (scans lourds, monitoring)            │
│   └── Auth (SIWS — Sign-In With Solana) + rate limiting  │
└──────┬─────────────────────────┬─────────────────────────┘
       │                         │
┌──────▼──────────┐   ┌──────────▼──────────────────────────┐
│  DATA LAYER     │   │  BLOCKCHAIN LAYER                    │
│  PostgreSQL 16  │   │  RPC Helius (getAssetsByOwner, DAS)  │
│  (Prisma)       │   │  Jupiter Price API (valorisation)     │
│  Redis (cache   │   │  Stake accounts via getProgramAccounts│
│  scans 1h, rate │   │  ── Phase 2 ──                        │
│  limit, queue)  │   │  Programme Anchor Q-Vault (mainnet)   │
└─────────────────┘   │  SDK client WOTS+ (Rust→WASM)         │
                      └───────────────────────────────────────┘
```

### 6.2 Flux d'un scan

1. `POST /api/scan { address }` → vérification cache Redis (TTL 1 h).
2. Cache miss → fetch parallèle : solde SOL, token accounts (DAS Helius), stake accounts, historique (signatures récentes), prix (Jupiter).
3. Scoring Engine (fonction pure, zéro I/O) → QES + breakdown.
4. Persistance Postgres (agrégats anonymisés pour le dashboard global) + retour JSON.
5. Génération OG image à la volée côté edge.

### 6.3 Choix structurants et justifications

| Décision          | Choix                                                     | Justification                                                          |
| ----------------- | --------------------------------------------------------- | ---------------------------------------------------------------------- |
| RPC               | Helius (plan Developer)                                   | DAS API indispensable pour NFT/cNFT ; webhooks pour le monitoring v1.1 |
| Scoring           | Service TS pur, découplé                                  | Testable unitairement, pondérations versionnées (QES v1, v2…)          |
| Hébergement front | Vercel                                                    | OG images edge, déploiement continu                                    |
| Hébergement back  | VPS Hetzner existant                                      | Coût maîtrisé, infra déjà opérée (Docker, pipeline connu de Korrigo)   |
| Crypto PQ (P2/P3) | WOTS+ via crate Rust compilée en WASM ; ML-DSA via liboqs | Standards NIST, pas de crypto maison                                   |
| Paiements         | Solana Pay + webhook Helius                               | Natif, sans PSP                                                        |

### 6.4 Sécurité

- Aucune clé privée ne transite par le backend, jamais (phase 1 : lecture seule ; phase 2 : signatures client-side).
- Rate limiting par IP + par wallet (Redis).
- Programme Anchor : audits (OtterSec ou Neodyme) + bug bounty avant tout dépôt réel.
- Secrets via variables d'environnement chiffrées (SOPS), images Docker digest-pinned (réutilisation des standards Korrigo).
- RGPD : emails waitlist opt-in, adresses publiques = données pseudonymes, politique de rétention documentée.

---

## 7. STACK COMPLÈTE

| Couche              | Technologie                                                                |
| ------------------- | -------------------------------------------------------------------------- |
| Frontend            | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion             |
| Wallet              | @solana/wallet-adapter (Phantom, Solflare, Backpack)                       |
| Backend             | Node.js 22, Fastify (ou API routes), tRPC, Zod                             |
| Base de données     | PostgreSQL 16 + Prisma                                                     |
| Cache / Queue       | Redis 7 + BullMQ                                                           |
| Blockchain          | @solana/web3.js v2, Helius RPC + DAS + webhooks, Jupiter Price API         |
| Smart contract (P2) | Rust, Anchor 0.31+, tests Bankrun/LiteSVM                                  |
| Crypto PQ           | winternitz (Rust→WASM), liboqs (ML-DSA), @noble/hashes                     |
| Paiements           | Solana Pay (USDC/SOL)                                                      |
| Infra               | Vercel (front), VPS Hetzner + Docker Compose (back), Cloudflare (DNS/WAF)  |
| CI/CD               | GitHub Actions (lint, tests, audit deps, build, deploy), branch protection |
| Observabilité       | Sentry, Grafana + Prometheus (VPS), Plausible (analytics sans cookies)     |
| Tests               | Vitest (scoring engine ≥ 90 % coverage), Playwright (e2e), cargo test      |

---

## 8. FEUILLE DE ROUTE

### Phase 0 — Fondations (S1–S2, juillet 2026)

- Repo monorepo (`qshield`) : `apps/web`, `apps/api`, `packages/scoring`, `programs/qvault` (placeholder).
- CI/CD, environnements dev/staging, conventions (Conventional Commits, branch protection).
- Spike technique : validation des endpoints Helius nécessaires + benchmark coût RPC par scan.
- **Jalon J0 : scan CLI fonctionnel sur 10 adresses de test.**

### Phase 1 — Q-Scan MVP (S3–S6, août 2026)

- Sprint 1 : Scoring Engine v1 + API `/scan` + cache.
- Sprint 2 : Frontend (landing, résultat, jauge, OG images, waitlist).
- Sprint 3 : page pédagogique sourcée, dashboard global, QA, tests de charge.
- Sprint 4 : beta privée (20 testeurs), corrections, **lancement public**.
- **Jalon J1 : lancement public + thread X de lancement (fin août — avant la rentrée crypto de septembre).**

### Phase 2 — Monétisation + Q-Vault devnet (S7–S14, sept.–oct. 2026)

- Rapport premium PDF + Solana Pay ; API publique freemium ; monitoring.
- Fork et durcissement du Winternitz Vault ; SDK WASM ; UI vault sur devnet.
- Lancement audit #1.
- **Jalon J2 : Q-Vault public sur devnet + campagne « teste le premier coffre quantum-safe ».**

### Phase 3 — Q-Vault mainnet (S15–S22, nov.–déc. 2026)

- Audit #2, bug bounty, plafonds de dépôt progressifs (caps).
- Lancement mainnet avec frais protocole.
- **Jalon J3 : mainnet + objectif 1 000 SOL en TVL sous 30 jours.**

### Phase 4 — Q-Notary B2B (T1 2027)

- Pilote avec un établissement (levier réseau AEFE), puis offre commerciale calée sur l'échéance ANSSI 2027.

---

## 9. PLAN D'ACTION HYPE / GO-TO-MARKET

### 9.1 Séquence de lancement Q-Scan

1. **J-14** : compte X du projet, teasing (« Combien de SOL sont récupérables par un ordinateur quantique ? Réponse bientôt »).
2. **J-7** : article pédagogique long format (Solana = clé publique exposée par design) + version anglaise sur Mirror.
3. **J0** : lancement + thread X avec les stats globales issues d'un pré-scan des 1 000 plus gros wallets (« Nous avons scanné les whales : X Md$ exposés »). C'est LE chiffre que les médias reprendront.
4. **J+3** : pitch presse ciblé — BeInCrypto FR (l'article Algorand prouve leur appétence), Journal du Coin, Cryptoast : « Et Solana dans tout ça ? Un Français a construit la réponse. »
5. **J+7** : soumission Product Hunt + forum Solana + candidature hackathon/grant Colosseum ou Solana Foundation.

### 9.2 Boucles virales intégrées au produit

- Badge score partageable (OG image) — chaque scan est une pub.
- Dashboard public « exposition du réseau » — citable par les journalistes en continu.
- Leaderboard whales anonymisé — engagement CT (Crypto Twitter) garanti.

### 9.3 Positionnement éditorial

Ton : **factuel et sourcé, jamais catastrophiste gratuit**. La crédibilité (références NIST, ANSSI, papers) est le différenciateur face aux projets « quantum » opportunistes. Le profil enseignant/chercheur est un atout d'autorité à assumer publiquement.

### 9.4 Financement

- Grant Solana Foundation (catégorie sécurité/infra) — dossier dès J1 avec les métriques du scanner.
- Hackathon Colosseum (visibilité + prize pool).
- Le token éventuel n'est PAS dans ce cahier des charges : décision différée post-J3, uniquement si utilité réelle (gouvernance des pondérations QES, staking d'assurance). Risque réglementaire trop élevé pour la phase de crédibilisation.

---

## 10. BUDGET PRÉVISIONNEL (Phases 0–2)

| Poste                                | Estimation                      |
| ------------------------------------ | ------------------------------- |
| RPC Helius (Developer plan)          | ~50 $/mois                      |
| Vercel Pro                           | ~20 $/mois                      |
| VPS (mutualisé avec infra existante) | ~0–30 $/mois                    |
| Domaine + Cloudflare                 | ~30 $/an                        |
| Audit smart contract #1              | 10–25 k$ (négociable via grant) |
| Design (logo, identité)              | 300–800 $ (ou IA + retouches)   |
| **Total cash phase 1 (Q-Scan seul)** | **< 150 $/mois**                |

Le MVP Q-Scan est volontairement dimensionné pour être autofinancé ; l'audit du vault est conditionné à l'obtention du grant ou aux revenus premium.

---

## 11. RISQUES ET PARADES

| Risque                                          | Impact                      | Parade                                                                                 |
| ----------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------- |
| Accusation de FUD                               | Réputation                  | Sourçage systématique, page « limites de la menace » honnête (horizon Q-Day incertain) |
| Coût RPC si viralité                            | Financier                   | Cache agressif, rate limiting, dégradation gracieuse                                   |
| Clés WOTS à usage unique mal comprises          | Perte de fonds utilisateurs | Rotation automatique invisible + refund address obligatoire + simulateur devnet        |
| Solana annonce sa propre roadmap PQ             | Concurrence                 | C'est en réalité un accélérateur : Q-Shield devient l'outil de migration de référence  |
| Faille dans le programme vault                  | Critique                    | 2 audits + caps progressifs + bug bounty                                               |
| Réglementation (MiCA, offre de services crypto) | Juridique                   | Phase 1 = pur SaaS d'analyse (hors périmètre) ; avis juridique avant mainnet vault     |

---

## 12. KPIs

| Phase | KPI                        | Cible                   |
| ----- | -------------------------- | ----------------------- |
| P1    | Scans uniques / 30 j       | 10 000                  |
| P1    | Partages de badge          | 1 000                   |
| P1    | Waitlist Q-Vault           | 2 000 emails            |
| P1    | Retombées presse           | ≥ 3 médias crypto FR/EN |
| P2    | Conversion rapport premium | 2 % des scans           |
| P3    | TVL vault à J+30           | 1 000 SOL               |
| P3    | Incidents sécurité         | 0                       |

---

## 13. ÉQUIPE ET GOUVERNANCE

- **Chef de projet / produit / crypto :** Alaeddine Ben Rhouma
- **Dev full-stack (P1) :** 1 personne (profil Next.js/Node — rôle potentiellement interne)
- **Dev Rust/Anchor (P2) :** freelance spécialisé ou montée en compétence interne, encadré par les audits
- **Rituel :** sprint hebdo, revue de jalon à chaque J*, definition of done incluant tests + doc

---

_Annexes à produire au démarrage : glossaire PQ vulgarisé (réutilisable en contenu marketing), matrice de tests du Scoring Engine, dossier de candidature grant Solana Foundation._
