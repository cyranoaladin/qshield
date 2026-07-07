# QuantaLayer Claims Matrix

Status: normative for MVP copy, API messages, public documentation and release materials.

## Principles

- QES is a migration criticality score, not a probability of compromise.
- QCI is a data confidence index, not a guarantee of accuracy.
- QuantaLayer Scan is read-only and does not request private keys, seed phrases or transaction
  signatures.
- QuantaLayer does not replace protocol-level migration work by Solana ecosystem teams.
- QuantaLayer Vault remains experimental and outside MVP product scope.
- All sensitive security claims must carry a source or be marked `source required`.

## Machine-Readable Banned List

Only this fenced block may contain the exact banned wording used by automated tests.

```banned-claims
quantum-proof
unhackable
100% secure
garanti inviolable
preuve quantique
QuantaLayer protects Solana.
QuantaLayer makes Solana quantum-safe.
QuantaLayer Vault is safe.
QuantaLayer Vault is audited.
FIPS 206 is final.
SIMD-0461 is active, merged or adopted.
QES predicts a hack.
QCI guarantees accuracy.
Authority Exposure replaces an audit.
QuantaLayer Notary is a qualified eIDAS service.
```

## Allowed Claims

| Claim                                                                                                                | Language | Source / status                                     |
| -------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------- |
| QuantaLayer Scan measures migration criticality from observable public data.                                         | EN       | Internal QES/QCI specification, SKILLS.md           |
| QuantaLayer Scan est un outil read-only de priorisation de migration.                                                | FR       | Internal QES/QCI specification, SKILLS.md           |
| Ed25519 security assumptions would fail against a cryptographically relevant quantum computer running Shor at scale. | EN       | Shor 1994; source required in public long-form copy |
| Grover gives a quadratic speedup against generic brute-force search, not a direct break of hash functions.           | EN       | Grover 1996; source required                        |
| FIPS 203, FIPS 204 and FIPS 205 are finalized NIST post-quantum standards.                                           | EN       | NIST FIPS 203/204/205                               |
| FIPS 206 / FN-DSA / Falcon must be treated as non-final until a primary NIST publication says otherwise.             | EN       | NIST source required before changing                |
| Solana key-controlled addresses expose the Ed25519 public key as the address.                                        | EN       | Solana docs / Helius article; source required       |
| QuantaLayer Vault is experimental and not part of the Scan MVP.                                                      | EN       | Product scope                                       |
| QuantaLayer Notary is not a qualified trust service.                                                                 | EN       | Legal review required before commercial language    |

## Recommended Wording

| Context                 | Recommended wording                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| Scan result             | "Migration criticality estimate based on observable public data."                                        |
| Low QCI                 | "Insufficient data to display a grade."                                                                  |
| PDA / off-curve address | "This address appears off-curve; migration risk is more likely tied to the owning program or authority." |
| Missing price data      | "Some assets could not be valued reliably; confidence was reduced."                                      |
| Read-only safety        | "QuantaLayer Scan never asks for a seed phrase, private key or transaction signature."                   |
| Vault                   | "Experimental; not mainnet-ready; not part of the Scan MVP."                                             |

## Forbidden Claim Categories

Do not publish copy that:

- promises absolute protection or invulnerability;
- implies Solana is already practically broken by quantum computers;
- presents QES as a compromise probability;
- presents QCI as an accuracy guarantee;
- presents QuantaLayer as endorsed by Solana Foundation, Anza, Jump Crypto, Firedancer,
  Superteam Balkan or any standards body;
- presents Vault, Notary or Authority Exposure as audited production systems before that is true;
- treats FIPS 206 or SIMD-0461 as finalized/adopted without current primary evidence.

## Review Rule

New homepage copy, API warnings, OG image text, learn-page copy and public docs must be checked
against this matrix before release. If a claim is not listed here and affects security,
compliance, standards or migration urgency, mark it `source required` until it is sourced.
