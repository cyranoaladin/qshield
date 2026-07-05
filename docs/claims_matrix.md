# Claims Matrix Q-Shield

Ce document est normatif pour les pages produit, les messages i18n, les images
OG, les communiques et les documents pedagogiques. Toute affirmation sensible
doit reprendre une formulation approuvee ci-dessous ou ajouter une ligne sourcee
avant publication.

## Banned Words

```banned-words
quantum-proof
unhackable
100% secure
100% sécurisé
garanti inviolable
inviolable
preuve quantique
impossible à pirater
hack-proof
future-proof security
sécurité absolue
securite absolue
protection garantie
attaque quantique impossible
fonds impossible à voler
```

## Phrasing Rules

| Banned phrasing                     | Why                                                                                                        | Approved replacement FR                                                       | Approved replacement EN                                                  |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| quantum-proof                       | Implique une certitude technique que les standards et la recherche ne donnent pas.                         | resistant aux attaques quantiques connues                                     | quantum-resistant against known quantum attacks                          |
| unhackable                          | Nie les risques d'implementation, d'exploitation et de gouvernance.                                        | concu pour reduire une classe de risques identifiee                           | designed to reduce an identified class of risk                           |
| 100% secure                         | Promesse absolue incompatible avec une analyse de risque.                                                  | securite dependante du modele de menace et de l'implementation                | security depends on the threat model and implementation                  |
| 100% sécurisé                       | Promesse absolue incompatible avec une analyse de risque.                                                  | securite dependante du modele de menace et de l'implementation                | security depends on the threat model and implementation                  |
| garanti inviolable                  | Garantie impossible a soutenir sans audit, preuve formelle et hypothese parfaite.                          | garanties limitees au modele documente                                        | guarantees limited to the documented model                               |
| inviolable                          | Mot absolu qui masque les hypotheses de securite.                                                          | robuste sous les hypotheses documentees                                       | robust under documented assumptions                                      |
| preuve quantique                    | Confond communication marketing et garantie cryptographique.                                               | resistance post-quantique selon l'etat actuel de la recherche                 | post-quantum resistance under current research knowledge                 |
| impossible à pirater                | Ignore les attaques hors crypto et les erreurs humaines.                                                   | reduit certaines surfaces d'attaque                                           | reduces selected attack surfaces                                         |
| hack-proof                          | Variante anglaise d'une promesse absolue.                                                                  | defense-in-depth for known risks                                              | defense-in-depth for known risks                                         |
| future-proof security               | L'avenir cryptographique reste incertain et depend de la crypto-agilite.                                   | concu pour faciliter la migration cryptographique                             | designed to ease cryptographic migration                                 |
| sécurité absolue / securite absolue | Promesse non verifiable.                                                                                   | securite mesuree et limitee par un modele de menace                           | security measured and limited by a threat model                          |
| protection garantie                 | Confond objectif produit et resultat garanti.                                                              | protection conditionnee aux audits et a l'usage correct                       | protection conditioned on audits and correct use                         |
| attaque quantique impossible        | Les algorithmes post-quantiques reposent sur des hypotheses analysees, pas sur une impossibilite generale. | aucune attaque quantique pratique connue contre ce schema dans le modele cite | no known practical quantum attack against this scheme in the cited model |
| fonds impossible à voler            | Ignore les risques de phishing, de compromission locale, de bug et de gouvernance.                         | diminue l'exposition liee a la cle Ed25519                                    | lowers exposure tied to the Ed25519 key                                  |

## Approved Claims

| Sensitive claim                                                                                           | Approved wording                                                                                                                                        | Source                                                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NIST a publie les premiers standards principaux de cryptographie post-quantique en 2024.                  | NIST a publie FIPS 203, FIPS 204 et FIPS 205 comme premiers standards principaux de PQC en 2024.                                                        | [NIST PQC project](https://csrc.nist.gov/projects/post-quantum-cryptography), [FIPS 203](https://csrc.nist.gov/pubs/fips/203/final), [FIPS 204](https://csrc.nist.gov/pubs/fips/204/final), [FIPS 205](https://csrc.nist.gov/pubs/fips/205/final) |
| ML-KEM est un mecanisme d'encapsulation de cle standardise par NIST.                                      | ML-KEM est le KEM standardise dans FIPS 203; sa securite est reliee au probleme Module-LWE.                                                             | [NIST FIPS 203](https://csrc.nist.gov/pubs/fips/203/final)                                                                                                                                                                                        |
| ML-DSA est une signature numerique post-quantique standardisee par NIST.                                  | ML-DSA est le standard de signature numerique a reseaux module-lattice publie dans FIPS 204.                                                            | [NIST FIPS 204](https://csrc.nist.gov/pubs/fips/204/final)                                                                                                                                                                                        |
| SLH-DSA est une signature hash-based standardisee par NIST.                                               | SLH-DSA est le standard de signature hash-based sans etat publie dans FIPS 205 et issu de SPHINCS+.                                                     | [NIST FIPS 205](https://csrc.nist.gov/pubs/fips/205/final)                                                                                                                                                                                        |
| Les systemes a logarithme discret sont menaces par un ordinateur quantique cryptographiquement pertinent. | Shor donne des algorithmes quantiques polynomiaux pour la factorisation et les logarithmes discrets sur un ordinateur quantique hypothetique.           | [Shor, SIAM Journal on Computing](https://doi.org/10.1137/S0097539795293172), [arXiv](https://arxiv.org/abs/quant-ph/9508027)                                                                                                                     |
| Les fonctions de hachage ne sont pas menacees de la meme facon que les signatures a logarithme discret.   | Grover donne une acceleration quadratique pour la recherche non structuree; les constructions hash-based restent analysees avec des parametres adaptes. | [Grover, arXiv](https://arxiv.org/abs/quant-ph/9605043), [RFC 8391](https://datatracker.ietf.org/doc/html/rfc8391), [NIST FIPS 205](https://csrc.nist.gov/pubs/fips/205/final)                                                                    |
| La date d'un ordinateur quantique cryptographiquement pertinent est inconnue.                             | Le calendrier de Q-Day est incertain; NIST indique que personne ne sait quand un tel ordinateur sera disponible.                                        | [NIST, What Is Post-Quantum Cryptography?](https://www.nist.gov/cybersecurity-and-privacy/what-post-quantum-cryptography)                                                                                                                         |
| Il faut preparer la migration avant Q-Day.                                                                | NIST et l'ANSSI recommandent d'inventorier les usages cryptographiques et de commencer la transition post-quantique.                                    | [NIST PQC migration](https://csrc.nist.gov/projects/post-quantum-cryptography), [ANSSI PQC](https://cyber.gouv.fr/enjeux-technologiques/cryptographie-post-quantique/)                                                                            |
| Solana expose les cles publiques des comptes utilisateurs par construction.                               | Une adresse Solana est une valeur 32 octets; elle peut correspondre a une cle publique Ed25519 ou a une PDA sans cle privee.                            | [Solana account structure](https://solana.com/docs/core/accounts/account-structure), [Solana PDA docs](https://solana.com/docs/core/pda)                                                                                                          |
| Ed25519 est une signature basee sur les courbes d'Edwards.                                                | Ed25519 est une instanciation EdDSA sur edwards25519 decrite par RFC 8032.                                                                              | [RFC 8032](https://datatracker.ietf.org/doc/html/rfc8032)                                                                                                                                                                                         |
| WOTS+ est une signature a usage unique et la reutilisation de l'etat de cle est dangereuse.               | WOTS+ est une signature a usage unique; les schemas stateful documentes par RFC 8391 perdent leurs garanties si l'etat secret est reutilise.            | [RFC 8391](https://datatracker.ietf.org/doc/html/rfc8391)                                                                                                                                                                                         |
| Q-Scan est un outil de mesure, pas une protection cryptographique.                                        | Q-Scan mesure une exposition a partir de donnees publiques; il ne deplace pas de fonds et ne demande pas de secret.                                     | TODO: source required after LOT-06 API and LOT-08 web implementation                                                                                                                                                                              |
| QES n'est pas une probabilite d'attaque.                                                                  | QES mesure une difficulte de migration et une valeur a risque, pas la probabilite qu'une attaque se produise.                                           | TODO: source required after LOT-04 scoring README and changelog                                                                                                                                                                                   |
| Q-Vault doit rester experimental avant audits.                                                            | Q-Vault ne doit pas etre presente comme pret pour des fonds reels avant audits independants et limites de depot documentees.                            | TODO: source required after Q-Vault design review and audit reports                                                                                                                                                                               |

## Editorial Defaults

- Preferer "post-quantique", "resistant aux attaques quantiques connues" et
  "migration cryptographique" aux promesses absolues.
- Toujours distinguer "expose publiquement" de "compromis aujourd'hui".
- Toujours distinguer "valeur a risque" de "probabilite d'attaque".
- Ajouter une source pour chaque affirmation sur NIST, ANSSI, Shor, Grover,
  Solana, Ed25519 ou les signatures hash-based.
