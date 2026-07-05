# Glossaire PQC Q-Shield

Ce glossaire fournit des definitions FR reutilisables pour les pages
pedagogiques, le support et les documents commerciaux. Les formulations doivent
rester compatibles avec `docs/claims_matrix.md`.

## Shor

**Definition vulgarisee:** Shor est l'algorithme quantique qui rend fragiles de
nombreuses signatures et cles publiques classiques si un ordinateur quantique
assez puissant devient disponible.

**Definition technique:** L'algorithme de Shor donne des methodes quantiques en
temps polynomial pour la factorisation d'entiers et le logarithme discret sur un
ordinateur quantique hypothetique, deux problemes qui soutiennent une grande
partie de la cryptographie a cle publique classique. Les signatures basees sur
les courbes elliptiques, dont Ed25519, appartiennent a cette famille de risques
par leur dependance au logarithme discret.

**Pourquoi c'est pertinent pour Q-Shield:** Q-Shield part de cette menace pour
expliquer pourquoi une adresse Solana utilisateur, qui correspond a une cle
publique Ed25519, doit etre traitee comme un actif a migrer avant Q-Day.

## Grover

**Definition vulgarisee:** Grover accelere la recherche brute, mais ne casse pas
les fonctions de hachage de la meme maniere que Shor menace les cles publiques
classiques.

**Definition technique:** L'algorithme de Grover resout une recherche non
structuree en environ O(sqrt(N)) et donne donc une acceleration quadratique
plutot qu'exponentielle. Cette difference explique pourquoi les primitives de
hachage restent utilisables avec des tailles et des parametres prudents, alors
que les schemas a logarithme discret doivent etre remplaces pour resister a un
ordinateur quantique cryptographiquement pertinent.

**Pourquoi c'est pertinent pour Q-Shield:** Q-Vault s'appuie sur des signatures
hash-based parce que leur modele de risque face a Grover est different de celui
des signatures Ed25519 face a Shor.

## Ed25519

**Definition vulgarisee:** Ed25519 est le mecanisme de signature utilise par les
wallets Solana pour prouver qu'ils controlent une adresse.

**Definition technique:** Ed25519 est une instanciation EdDSA sur la courbe
edwards25519, decrite par RFC 8032. Une signature Ed25519 prouve le controle de
la cle privee associee a une cle publique; sur Solana, cette cle publique peut
servir directement d'adresse de compte utilisateur.

**Pourquoi c'est pertinent pour Q-Shield:** Q-Scan evalue l'exposition liee a
des adresses Ed25519 publiques, tandis que les PDA sont classees a part car
elles ne correspondent pas a une cle privee utilisateur.

## ML-KEM

**Definition vulgarisee:** ML-KEM sert a etablir une cle secrete partagee en
utilisant un standard post-quantique du NIST.

**Definition technique:** ML-KEM, publie dans FIPS 203, est un mecanisme
d'encapsulation de cle base sur le probleme Module Learning with Errors. Il ne
s'agit pas d'une signature: il sert a deriver une cle partagee pour chiffrer ou
authentifier des communications avec des algorithmes symetriques.

**Pourquoi c'est pertinent pour Q-Shield:** ML-KEM est une reference de
vocabulaire et de migration PQC; Q-Shield doit l'utiliser correctement dans les
documents, meme si Q-Scan ne chiffre pas de donnees.

## ML-DSA

**Definition vulgarisee:** ML-DSA est une signature numerique post-quantique
standardisee par le NIST.

**Definition technique:** ML-DSA, publie dans FIPS 204, est un standard de
signature base sur des reseaux module-lattice et issu de la famille
CRYSTALS-Dilithium. Il permet de generer et verifier des signatures numeriques
dans un modele concu pour resister aux attaques quantiques connues.

**Pourquoi c'est pertinent pour Q-Shield:** Q-Notary prevoit une double
signature Ed25519 et ML-DSA afin de conserver la compatibilite actuelle tout en
preparant une verification post-quantique.

## SLH-DSA

**Definition vulgarisee:** SLH-DSA est une signature post-quantique basee sur
des fonctions de hachage.

**Definition technique:** SLH-DSA, publie dans FIPS 205, est un standard de
signature hash-based sans etat derive de SPHINCS+. Il evite les hypotheses de
difficulte des reseaux pour offrir une famille de signature differente, au prix
de signatures plus volumineuses et de compromis de performance.

**Pourquoi c'est pertinent pour Q-Shield:** SLH-DSA donne un vocabulaire NIST
pour expliquer pourquoi les signatures hash-based sont une piste credible pour
des usages post-quantiques.

## WOTS+

**Definition vulgarisee:** WOTS+ est une signature hash-based qui doit etre
utilisee une seule fois par cle.

**Definition technique:** WOTS+ signifie Winternitz One-Time Signature Plus. RFC
8391 le decrit comme un bloc de construction pour XMSS; sa securite depend de
fonctions de hachage et d'une gestion stricte de l'etat de cle. Reutiliser un
etat secret dans des schemas stateful supprime les garanties cryptographiques
attendues.

**Pourquoi c'est pertinent pour Q-Shield:** Q-Vault repose sur l'idee qu'une
sortie de coffre doit utiliser une cle WOTS+ neuve, puis migrer le solde vers un
nouveau coffre.

## PDA

**Definition vulgarisee:** Une PDA est une adresse Solana controlee par un
programme, pas par une cle privee de wallet.

**Definition technique:** Une Program Derived Address est derivee de facon
deterministe a partir d'un program ID et de seeds. Les docs Solana indiquent
qu'une PDA est hors courbe Ed25519, donc aucune cle privee ne peut produire une
signature classique pour cette adresse; le programme signe via le runtime avec
`invoke_signed`.

**Pourquoi c'est pertinent pour Q-Shield:** Q-Scan doit signaler les PDA
separement, car leur risque depend surtout du programme proprietaire et de ses
autorites plutot que d'une cle privee utilisateur.

## Crypto-agility

**Definition vulgarisee:** La crypto-agilite est la capacite de changer de
primitives cryptographiques sans reconstruire tout le systeme.

**Definition technique:** Un systeme crypto-agile isole les algorithmes, les
parametres, les formats de cles et les politiques de migration afin de pouvoir
remplacer une primitive lorsque les standards, les audits ou l'etat de la
recherche changent. La crypto-agilite inclut l'inventaire, la version des
formats et des chemins de rotation.

**Pourquoi c'est pertinent pour Q-Shield:** QES est versionne et Q-Vault doit
rester compatible avec des migrations de primitives si les standards ou les
audits imposent un changement.

## Q-Day

**Definition vulgarisee:** Q-Day designe le moment ou un ordinateur quantique
serait assez puissant pour menacer des primitives a cle publique largement
utilisees.

**Definition technique:** Q-Day n'a pas de date connue. NIST indique que les
estimations vont de quelques annees a quelques decennies et que les obstacles
techniques restent importants; la preparation reste necessaire car les
migrations cryptographiques prennent longtemps.

**Pourquoi c'est pertinent pour Q-Shield:** Q-Shield doit aider les utilisateurs
a prioriser la migration sans presenter Q-Day comme un evenement date ou
certain.

## Harvest now, decrypt later

**Definition vulgarisee:** "Harvest now, decrypt later" signifie collecter des
donnees chiffrees aujourd'hui pour tenter de les dechiffrer plus tard avec de
meilleurs moyens.

**Definition technique:** Cette menace concerne surtout les donnees qui doivent
rester confidentielles longtemps: un adversaire peut stocker du trafic chiffre
actuel, puis attendre l'apparition de moyens cryptanalytiques plus puissants.
NIST cite ce scenario comme une raison de commencer la migration post-quantique
avant l'arrivee d'un ordinateur quantique cryptographiquement pertinent.

**Pourquoi c'est pertinent pour Q-Shield:** Sur Solana, Q-Scan est centre sur
les signatures et la migration de wallets; le concept reste utile pour expliquer
pourquoi certaines migrations cryptographiques doivent commencer avant que
l'attaque pratique existe.

## Signature à usage unique

**Definition vulgarisee:** Une signature a usage unique est une cle de signature
qui ne doit servir qu'une fois.

**Definition technique:** Les schemas One-Time Signature produisent une paire de
cles destinee a signer exactement un message de maniere sure dans leur modele de
securite. Les constructions comme WOTS+ sont puissantes mais demandent une
gestion d'etat stricte, car la reutilisation d'une cle peut reveler assez
d'information pour permettre des signatures non autorisees.

**Pourquoi c'est pertinent pour Q-Shield:** Le design Q-Vault doit faire de la
rotation de coffre une regle produit, pas une option utilisateur, afin d'eviter
la reutilisation d'une cle WOTS+.

## Sources

- [NIST FIPS 203 - ML-KEM](https://csrc.nist.gov/pubs/fips/203/final)
- [NIST FIPS 204 - ML-DSA](https://csrc.nist.gov/pubs/fips/204/final)
- [NIST FIPS 205 - SLH-DSA](https://csrc.nist.gov/pubs/fips/205/final)
- [NIST - What Is Post-Quantum Cryptography?](https://www.nist.gov/cybersecurity-and-privacy/what-post-quantum-cryptography)
- [ANSSI - Cryptographie post-quantique](https://cyber.gouv.fr/enjeux-technologiques/cryptographie-post-quantique/)
- [Shor - Polynomial-Time Algorithms for Prime Factorization and Discrete Logarithms](https://doi.org/10.1137/S0097539795293172)
- [Grover - A fast quantum mechanical algorithm for database search](https://arxiv.org/abs/quant-ph/9605043)
- [RFC 8032 - EdDSA](https://datatracker.ietf.org/doc/html/rfc8032)
- [RFC 8391 - XMSS and WOTS+](https://datatracker.ietf.org/doc/html/rfc8391)
- [Solana account structure](https://solana.com/docs/core/accounts/account-structure)
- [Solana PDA docs](https://solana.com/docs/core/pda)
