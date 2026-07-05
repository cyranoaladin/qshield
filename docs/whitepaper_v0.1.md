# Whitepaper Q-Shield v0.1

Version: 0.1  
Statut: brouillon normatif public  
Langue source: francais

## Resume executif

Q-Shield est une suite de securite post-quantique pour Solana. Sa premiere
brique, Q-Scan, est un scanner read-only qui estime la difficulte de migration
et la valeur a risque d'une adresse Solana publique. Les briques suivantes,
Q-Vault et Q-Notary, visent respectivement un coffre non-custodial experimental
a signatures hash-based et une notarisation documentaire a double signature.

Le projet part d'un constat simple: une adresse Solana utilisateur peut etre la
cle publique Ed25519 elle-meme. Cette propriete rend la pedagogie post-quantique
concrete, mais elle ne signifie pas qu'un wallet est compromis aujourd'hui.
Q-Shield doit donc mesurer, expliquer et preparer la migration sans promesse
absolue.

## Probleme

La cryptographie a cle publique classique repose souvent sur des problemes
mathematiques que les ordinateurs classiques ne savent pas resoudre efficacement
a grande echelle. Shor a montre que la factorisation et le logarithme discret
peuvent etre resolus en temps polynomial sur un ordinateur quantique
hypothetique. Cela menace les signatures basees sur les courbes elliptiques,
dont Ed25519, si un ordinateur quantique cryptographiquement pertinent devient
disponible.

Le risque pratique n'est pas seulement cryptographique. Les migrations prennent
du temps: inventaire des usages, remplacement des primitives, tests,
compatibilite avec les wallets, audits et education utilisateur. NIST et l'ANSSI
recommandent de preparer cette transition avant que l'urgence ne soit
operationnelle.

## Contexte PQC

En 2024, NIST a publie ses premiers standards principaux de cryptographie
post-quantique:

- FIPS 203 pour ML-KEM, mecanisme d'encapsulation de cle.
- FIPS 204 pour ML-DSA, signature numerique a base de reseaux module-lattice.
- FIPS 205 pour SLH-DSA, signature hash-based sans etat.

Ces standards ne suppriment pas le besoin d'audit, d'integration prudente et de
crypto-agilite. Ils donnent un vocabulaire et des primitives de reference pour
planifier la transition. Les signatures hash-based, comme SLH-DSA et les
constructions WOTS+/XMSS, restent interessantes parce qu'elles reposent sur des
fonctions de hachage plutot que sur le logarithme discret. Grover impose une
analyse de parametres prudente, mais son acceleration quadratique ne produit pas
le meme type de rupture que Shor pour les signatures Ed25519.

## Specificite Solana

Solana represente les comptes par des adresses de 32 octets encodees en base58.
Les docs Solana distinguent les adresses qui correspondent a une cle publique
Ed25519 et les Program Derived Addresses, qui sont hors courbe et controlees par
un programme.

Cette specificite rend Solana pedagogiquement differente de chaines ou l'adresse
utilisateur peut ajouter une couche de hachage ou d'abstraction. Pour un compte
utilisateur Ed25519, la cle publique est une donnee visible et durable. Pour une
PDA, le modele de risque est different: l'attention se porte sur le programme,
ses autorites et sa gouvernance.

## Q-Scan

Q-Scan est la brique Phase 1. Elle accepte une adresse publique, valide son
format, collecte des donnees publiques via la data layer, puis calcule un
Quantum Exposure Score. Le QES v1 doit mesurer:

- la valeur totale estimee;
- la part stakee ou difficile a migrer rapidement;
- la concentration;
- l'anciennete;
- le nombre de token accounts actifs;
- l'activite recente.

Le score ne mesure pas la probabilite qu'une attaque se produise. Il mesure une
difficulte de migration et une valeur a risque dans le modele documente. Un
score eleve signale une priorite de migration plus forte; un score bas ne
remplace pas une analyse de securite globale.

Q-Scan est volontairement read-only: aucune seed phrase, aucune cle privee,
aucune transaction et aucun transfert de fonds ne sont demandes.

## Q-Vault

Q-Vault est la brique Phase 2 envisagee. L'objectif est un coffre non-custodial
utilisant des signatures hash-based de type WOTS+ pour autoriser les retraits.
Une cle WOTS+ ne doit servir qu'une fois; chaque ouverture de coffre doit donc
entrainer une rotation vers un nouveau coffre.

Ce design cherche a reduire la dependance a une signature Ed25519 exposee, sans
modifier le protocole Solana. Il reste experimental tant qu'il n'a pas recu
d'audits independants, de limites de depot documentees, de tests devnet publics
et de procedures de recuperation verifiees.

## Q-Notary

Q-Notary est la brique Phase 3 envisagee pour les usages B2B. Le principe est
d'ancrer le hash d'un document avec une signature Ed25519 pour la compatibilite
actuelle et une signature ML-DSA pour preparer une verification post-quantique.
Le document lui-meme ne doit pas etre publie on-chain; seule une empreinte et
les preuves necessaires a la verification sont conservees selon le design final.

## Architecture

Q-Shield est organise en monorepo:

- `apps/web`: interface Next.js, i18n FR/EN, pages pedagogiques et parcours scan;
- `apps/api`: API Fastify, validation Zod, rate limiting, cache et serialization
  problem+json;
- `packages/scoring`: moteur QES pur, sans I/O et sans dependance RPC;
- `packages/solana`: couche data Helius/Jupiter, schemas Zod et retries bornes;
- `packages/shared`: schemas, erreurs, constantes et tests transverses.

L'invariant architectural est que le scoring reste une fonction pure. Toutes les
donnees externes sont validees avant d'entrer dans le calcul, et toute erreur de
donnee necessaire doit produire une erreur plutot qu'un score partiel.

## Limitations

- Le calendrier de Q-Day est inconnu. NIST indique que les estimations peuvent
  aller de quelques annees a quelques decennies; Q-Shield ne doit pas presenter
  une date comme certaine.
- Les signatures hash-based sont considerees resistantes aux attaques quantiques
  connues dans l'etat actuel de la recherche, mais cela ne constitue pas une
  preuve mathematique qu'aucune attaque future n'existera.
- QES mesure la difficulte de migration et la valeur a risque, pas la
  probabilite d'une attaque ni la securite complete d'un wallet.
- Q-Vault reste experimental jusqu'a audits independants, limites de depot,
  bug bounty, tests publics et runbook de recuperation.
- Q-Scan lit des donnees publiques; il ne protege pas contre phishing, malware,
  compromission locale, erreur utilisateur ou bug de programme tiers.
- Les prix, soldes et metadonnees fournis par des services externes peuvent etre
  incomplets ou indisponibles; le produit doit echouer ferme plutot que publier
  un score partiel.

## Roadmap

1. Phase 0: fondations monorepo, CI, validation d'environnement, docs
   normatives.
2. Phase 1: Q-Scan MVP, scoring v1, API `/scan`, waitlist, page pedagogique,
   badges OG tronques et dashboard en agregats.
3. Phase 2: Q-Vault devnet, UX de rotation, audits, limites de depot et
   documentation operationnelle.
4. Phase 3: Q-Notary B2B, double signature et verification publique.

Chaque phase doit conserver le ton factuel: sources pour les affirmations
sensibles, pas de chiffres fabriques, pas de leaderboard nominatif en MVP.

## Risques

| Risque                                     | Impact                              | Reponse                                               |
| ------------------------------------------ | ----------------------------------- | ----------------------------------------------------- |
| Surinterpretation du QES                   | Phishing ou panique inutile         | Limitations visibles, claims_matrix, badge OG tronque |
| Scraping de l'API                          | Creation de listes de wallets       | Rate limiting, cache, pas de stockage d'adresse brute |
| Donnee RPC invalide                        | Score faux                          | Validation Zod et fail-closed                         |
| Mauvaise gestion WOTS+                     | Perte de garanties cryptographiques | Rotation obligatoire, audits, tests devnet            |
| Retard des standards ou nouvelles attaques | Obsolescence                        | Crypto-agilite, versioning, veille NIST/ANSSI         |
| Confusion PDA vs wallet utilisateur        | Mauvaise priorisation               | Detection off-curve et message dedie                  |

## Sources

- [NIST PQC project](https://csrc.nist.gov/projects/post-quantum-cryptography)
- [NIST FIPS 203 - ML-KEM](https://csrc.nist.gov/pubs/fips/203/final)
- [NIST FIPS 204 - ML-DSA](https://csrc.nist.gov/pubs/fips/204/final)
- [NIST FIPS 205 - SLH-DSA](https://csrc.nist.gov/pubs/fips/205/final)
- [NIST - What Is Post-Quantum Cryptography?](https://www.nist.gov/cybersecurity-and-privacy/what-post-quantum-cryptography)
- [ANSSI - Cryptographie post-quantique](https://cyber.gouv.fr/enjeux-technologiques/cryptographie-post-quantique/)
- [Shor - Polynomial-Time Algorithms for Prime Factorization and Discrete Logarithms](https://doi.org/10.1137/S0097539795293172)
- [Grover - A fast quantum mechanical algorithm for database search](https://arxiv.org/abs/quant-ph/9605043)
- [RFC 8391 - XMSS and WOTS+](https://datatracker.ietf.org/doc/html/rfc8391)
- [Solana account structure](https://solana.com/docs/core/accounts/account-structure)
- [Solana PDA docs](https://solana.com/docs/core/pda)
