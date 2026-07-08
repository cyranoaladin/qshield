# QuantaLayer

Post-Quantum Readiness for Solana.

QuantaLayer mesure, priorise et prépare la migration post-quantique des comptes et authorities Solana. Le projet ne remplace pas la migration protocolaire de Solana et ne revendique aucune certification NIST, ANSSI, Solana Foundation, Anza, Jump Crypto ou Superteam Balkan.

- **QuantaLayer Scan** : scanner read-only de criticité de migration avec QES/QCI.
- **Authority Exposure** : futur module B2B pour upgrade, mint, freeze, stake, vote, validator, multisig, DAO et treasury authorities.
- **QuantaLayer Vault** : coffre hash-based expérimental, opt-in, non-custodial, non mainnet-ready.
- **QuantaLayer Notary** : ancrage documentaire hybride Ed25519 + ML-DSA.

## Documentation

| Fichier                                  | Rôle                                                                   |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| `docs/cahier_des_charges_quantalayer.md` | Source de vérité produit (vision, specs, roadmap, GTM)                 |
| `AGENTS.md`                              | Instructions pour les agents de codage (Codex CLI) — à lire en premier |
| `SKILLS.md`                              | Connaissances métier normatives (Solana, Helius, QES/QCI, PQ crypto)   |
| `TASKS.md`                               | Backlog en LOTs, phase 0 → phase 1                                     |
| `.env.example`                           | Variables d'environnement (validées fail-closed au boot)               |

### Internal research notes

| Fichier                                               | Rôle                                                                                             |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `docs/research/quantalayer_macro_context_addendum.md` | Addendum interne macro / CBOM / risques institutionnels. Non-public release material.            |
| `docs/reports/aybars_article_comparison_audit.md`     | Audit interne de comparaison de l’article LinkedIn d’Aybars Dorman. Non-public release material. |

## Démarrage rapide

```bash
pnpm install
cp .env.example .env   # renseigner HELIUS_API_KEY, DATABASE_URL, REDIS_URL
pnpm dev               # web :3000 · api :3001
pnpm lint && pnpm typecheck && pnpm test
```

## Validation staging locale

PostgreSQL et Redis peuvent être lancés localement sans secrets réels :

```bash
pnpm staging:local:up
DATABASE_URL=postgresql://quantalayer:quantalayer@localhost:55432/quantalayer pnpm staging:local:migrate
DATABASE_URL=postgresql://quantalayer:quantalayer@localhost:55432/quantalayer pnpm db:validate
```

Le Compose local expose PostgreSQL sur `localhost:55432` et Redis sur `localhost:56379` pour éviter
les conflits avec des services déjà installés sur les ports standards.

La passe RC complète est scriptée :

```bash
bash scripts/validate-staging-readiness.sh
```

Le script écrit `docs/reports/staging_validation_run.md`. Les smoke tests live sont sautés tant que
les variables nécessaires ne sont pas fournies.

Arrêt local :

```bash
pnpm staging:local:down
```

## Principes non négociables

1. Lecture seule en phase 1 : aucune clé privée ne transite par le système.
2. Fail-closed partout : env invalide, réponse RPC non conforme ou score partiel → erreur explicite, jamais de résultat deviné.
3. `packages/scoring` reste pur (zéro I/O) ; pondérations QES/QCI versionnées.
4. Pas de crypto maison ; primitives NIST via bibliothèques auditées uniquement.
5. Aucune affirmation « ça marche » sans sortie d'exécution qui le prouve.

## Licence

Propriétaire — © 2026 Money Factory AI LLC. Tous droits réservés. La stratégie open-source sera définie module par module.
