# Q-Shield

Suite de protection post-quantique sur Solana.
**P1 — Q-Scan** : scanner d'exposition quantique (QES 0–100). **P2 — Q-Vault** : coffre non-custodial à signatures hash-based (WOTS+). **P3 — Q-Notary** : ancrage de documents à double signature Ed25519 + ML-DSA.

## Documentation

| Fichier                              | Rôle                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------ |
| `docs/cahier_des_charges_qshield.md` | Source de vérité produit (vision, specs, roadmap, GTM)                   |
| `AGENTS.md`                          | Instructions pour les agents de codage (Codex CLI) — à lire en premier   |
| `SKILLS.md`                          | Connaissances métier normatives (Solana, Helius, spec QES v1, PQ crypto) |
| `TASKS.md`                           | Backlog en LOTs, phase 0 → phase 1                                       |
| `.env.example`                       | Variables d'environnement (validées fail-closed au boot)                 |

## Démarrage rapide

```bash
pnpm install
cp .env.example .env   # renseigner HELIUS_API_KEY, DATABASE_URL, REDIS_URL
pnpm dev               # web :3000 · api :3001
pnpm lint && pnpm typecheck && pnpm test
```

## Principes non négociables

1. Lecture seule en phase 1 : aucune clé privée ne transite par le système.
2. Fail-closed partout : env invalide, réponse RPC non conforme ou score partiel → erreur explicite, jamais de résultat deviné.
3. `packages/scoring` reste pur (zéro I/O) ; pondérations QES versionnées.
4. Pas de crypto maison ; primitives NIST via bibliothèques auditées uniquement.
5. Aucune affirmation « ça marche » sans sortie d'exécution qui le prouve.

## Licence

Propriétaire — © 2026 Q-Shield. Tous droits réservés (à réévaluer avant open-sourcing éventuel du programme vault).
