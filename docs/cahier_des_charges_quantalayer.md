# Cahier Des Charges — QuantaLayer

**Sous-titre :** Post-Quantum Readiness for Solana
**Version :** 1.1 — Juillet 2026
**Statut :** source de vérité produit, publication-safe
**Éditeur :** Money Factory AI Lab
**Founder / Research Lead :** Alaeddine Ben Rhouma

QuantaLayer est une couche applicative et analytique de préparation post-quantique pour Solana. Elle mesure la criticité de migration, améliore la visibilité, priorise les comptes et authorities, soutient l'expérimentation responsable et publie des benchmarks reproductibles. Elle ne remplace pas la migration protocolaire de Solana.

## 1. Principes

- Solana utilise principalement Ed25519 ; pour les comptes contrôlés par clé, l'adresse est la clé publique.
- Un CRQC capable d'exécuter Shor à l'échelle cryptographique casserait Ed25519, mais aucune machine publique ne démontre aujourd'hui cette capacité.
- QES mesure une criticité de migration, pas une probabilité de piratage.
- QCI mesure la qualité et la complétude des données ; il contrôle l'affichage du QES.
- QuantaLayer Vault est expérimental, opt-in, non-custodial et non mainnet-ready.
- QuantaLayer Notary n'est ni une signature électronique qualifiée, ni un horodatage qualifié.
- Aucune certification NIST, ANSSI, Solana Foundation, Anza, Jump Crypto ou Superteam Balkan ne doit être revendiquée.

## 2. Architecture Produit

| Module               | Rôle                                                                    | Statut                        |
| -------------------- | ----------------------------------------------------------------------- | ----------------------------- |
| QuantaLayer Scan     | Scanner read-only de criticité de migration Solana                      | Priorité court terme          |
| Authority Exposure   | Inventaire et criticité des clés de contrôle protocoles/DAO/validateurs | Futur module B2B              |
| QuantaLayer Vault    | Coffre hash-based expérimental lié aux benchmarks QES/QCI               | Devnet seulement avant audits |
| QuantaLayer Notary   | Ancrage documentaire hybride Ed25519 + ML-DSA                           | Piste B2B                     |
| QuantaLayer Research | Notes, benchmarks, limites, rapports agrégés                            | Actif                         |

## 3. QuantaLayer Scan

QuantaLayer Scan est read-only. Le service ne demande jamais de seed phrase, clé privée ou signature pour scanner une adresse publique.

### 3.1 QES

`QES_VERSION = "1.1.0"`.

```text
QES(a) = round(100 × Σ w_i × f_i(a))
```

Si certains facteurs ne sont pas observables :

```text
QES(a) = round(100 × Σ_{i∈O(a)} w_i' × f_i(a))
w_i' = w_i / Σ_{j∈O(a)} w_j
```

| Facteur                             | Poids nominal | Rôle                               |
| ----------------------------------- | ------------: | ---------------------------------- |
| valeur observable à migrer          |          0,35 | ampleur des actifs visibles        |
| actifs stakés/verrouillés           |          0,20 | lenteur de migration               |
| concentration si observable         |          0,15 | absence de compartimentage         |
| ancienneté observable               |          0,10 | durée d'exposition visible         |
| token accounts actifs significatifs |          0,10 | complexité opérationnelle          |
| activité récente                    |          0,10 | probabilité de migration proactive |

L'ancienneté est une ancienneté observable : première activité on-chain indexée, première signature connue ou première apparition détectée par l'indexer. Elle n'est pas nécessairement la date exacte de création du compte.

Le facteur token accounts doit ignorer ou sous-pondérer les spam tokens, appliquer un seuil de valeur minimale, distinguer token account actif et poussière reçue, pondérer par actifs significatifs et réduire le QCI si la pollution dust/spam empêche une lecture fiable.

### 3.2 QCI

```text
QCI(a) = round(100 × Σ v_k × c_k(a))
```

| Dimension             | Poids | Méthode                              |
| --------------------- | ----: | ------------------------------------ |
| prix résolus          |  0,30 | part de la valeur avec prix fiable   |
| réponses RPC/DAS      |  0,20 | pagination complète, schémas valides |
| positions DeFi        |  0,15 | LP/lending/perps décodés             |
| NFT/cNFT              |  0,10 | indexation + valorisation            |
| stake accounts        |  0,10 | montants et authorities              |
| fraîcheur des données |  0,10 | âge cache / TTL                      |
| classification compte |  0,05 | system, PDA, multisig, program       |

|   QCI | Affichage utilisateur                |
| ----: | ------------------------------------ |
|  ≥ 80 | QES affiché normalement              |
| 60–79 | QES affiché avec avertissement       |
| 40–59 | QES affiché comme estimation fragile |
|  < 40 | pas de grade ; données insuffisantes |

Aucun grade A/B/C/D/E ne doit être affiché si `QCI < 40`.

### 3.3 Sortie API Cible

```json
{
  "address": "synthetic-public-address",
  "qes": 78,
  "qci": 84,
  "grade": "D",
  "estimatedMigrationExposureValueUsd": 45230.12,
  "breakdown": {
    "observableAssetValue": 31,
    "observableAge": 8,
    "stakedOrLockedAssets": 17,
    "significantTokenAccounts": 6,
    "recentActivity": 4,
    "concentration": 12
  },
  "recommendations": ["..."],
  "scannedAt": "2026-07-05T12:00:00Z",
  "qesVersion": "1.1.0"
}
```

## 4. Solana Surfaces À Couvrir

QuantaLayer Scan et Authority Exposure doivent tenir compte du System Program, PDA, BPFUpgradeableLoader, ProgramData accounts, fee payer, first signature as transaction id, versioned transactions, Address Lookup Tables, compute budget, SPL Token, Token-2022, Associated Token Accounts, Metaplex Token Metadata, Bubblegum/cNFT, stake accounts, vote accounts, validator identity, mint authority, freeze authority, close authority, Squads multisig, Realms governance et protocol treasuries.

Les données on-chain et prix doivent passer par des frontières validées par Zod. `packages/scoring` reste une bibliothèque pure sans I/O. Les appels Helius RPC/DAS, Jupiter Price API et Pyth éventuels restent dans `packages/solana`.

## 5. QuantaLayer Vault

QuantaLayer Vault is an experimental, non-custodial, opt-in vault. It protects only assets actually deposited into it. It does not protect the Solana account model, validators, consensus, fee payers or external authorities.

QuantaLayer reconnaît l'antériorité de Dean Little / Blueshift et du Solana Winternitz Vault. Le projet ne revendique pas l'invention d'une primitive nouvelle ; il propose un chemin expérimental benchmarké, audité et intégré à l'UX QES/QCI.

Aucun mainnet QuantaLayer Vault sans devnet public, Bankrun, LiteSVM, fuzzing, property-based tests, deux audits indépendants, bug bounty, caps, documentation recovery, incident monitoring, revue juridique et stratégie d'upgrade authority.

Le scénario de refund address est obligatoire dans le threat model : une refund address Ed25519 classique peut redevenir une exposition résiduelle. L'interface doit afficher QES/QCI de la refund address et recommander un nouveau vault ou une stratégie compatible PQ quand la criticité est élevée.

## 6. QuantaLayer Notary

Flux cible :

```text
document
→ canonicalization
→ document hash
→ Ed25519 signature
→ ML-DSA-65 signature
→ off-chain certificate
→ certificate hash
→ Solana anchor
→ public verifier
```

Le certificat public ne doit contenir aucune donnée personnelle du sujet du document. Les métadonnées d'émetteur doivent être minimisées ; si elles identifient une personne physique, elles doivent être traitées comme données personnelles.

La canonicalisation JSON doit utiliser RFC 8785/JCS ou un profil interne versionné `json-c14n-v1`. Pour PDF, le hash porte sur les octets finaux, les métadonnées sont figées avant signature, aucune normalisation implicite n'est appliquée, et toute modification change le hash.

## 7. Roadmap

| Horizon           | Livrables                                                           | Conditions                                         |
| ----------------- | ------------------------------------------------------------------- | -------------------------------------------------- |
| 2026 T3           | QuantaLayer Scan, QES/QCI, docs, premiers rapports agrégés          | constantes versionnées, sources, limites affichées |
| 2026 T4 – 2027 S1 | Authority Exposure, devnet Vault, benchmark protocol                | Bankrun, LiteSVM, fuzzing, comparaison Blueshift   |
| 2027+             | Notary B2B, rapports périodiques, Vault limité si audits concluants | revue juridique, audits publics, bug bounty        |

## 8. Open Source

QuantaLayer publiera au minimum la spécification QES/QCI, les pondérations versionnées, les invariants, les jeux de tests synthétiques et des exemples de calcul reproductibles. La publication du pipeline complet d'indexation, de scoring et de valorisation dépendra de la stratégie open-source, anti-abus, sécurité et propriété intellectuelle.

## 9. Claims Interdits

- Ne pas prétendre que QuantaLayer apporte une protection globale à Solana.
- Ne pas présenter Solana comme rendue sûre face au quantique par QuantaLayer.
- Ne pas présenter Vault comme sûr ou audité avant audits publics réels.
- Ne pas revendiquer de certification NIST ou ANSSI.
- Ne pas présenter FIPS 206 comme final sans source primaire NIST.
- Ne pas présenter SIMD-0461 comme actif, fusionné, adopté ou trajectoire protocolaire confirmée.
- Ne pas présenter QES comme une probabilité de piratage.
- Ne pas présenter QCI comme une garantie d'exactitude.
- Ne pas présenter Authority Exposure comme un substitut à un audit.
