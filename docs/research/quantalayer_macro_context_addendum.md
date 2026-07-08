# QuantaLayer Macro Context Addendum

Cross-Chain Quantum Readiness, Institutional Risk, and CBOM for Solana

**Statut**

- Internal research addendum.
- Not a replacement for Research Note #1.
- Not a security audit.
- Not legal advice.
- Not investment advice.

## 1) Objectif

This document provides an internal comparison between the LinkedIn article _Quantum Computing vs Blockchains: The Countdown Has Started_ and QuantaLayer Research Note #1.  
It identifies what can enrich QuantaLayer strategy without adding unverified claims or FUD.

The constraints are deliberate:

- keep the technical bar aligned with Research Note #1,
- avoid introducing unverifiable or speculative claims,
- keep all additions publication-safe and institutionally appropriate,
- keep MVP scope unchanged.

## 2) Executive summary

- The Aybars article is useful as a market signal and institutional framing input.
- Research Note #1 is more technically rigorous and should remain the reference for technical claims.
- QuantaLayer should retain macro framing, CBOM-style language, and custody-related risk structuring, while avoiding alarmist wording from the article.
- No immediate modification of PDF v1.0-public is recommended.

## 3) Claims to reuse carefully

- Crypto-agility as an operational requirement.
- CBOM / cryptographic inventory thinking.
- Institutional custody readiness as a migration dependency.
- Dormant assets and governance risk as real operational risk classes.
- Cross-chain comparison (Bitcoin / Ethereum / Solana) as context rather than proof of immediate breakage.
- Sovereign payment infrastructure as macro context, useful for scenario planning.
- Signature overhead and signature compression as forward-looking R&D.

## 4) Claims to reject or verify before use

| Claim from external article                           | Status                   | Action                                                  |
| ----------------------------------------------------- | ------------------------ | ------------------------------------------------------- |
| BlackRock framework on CRQC and decentralized ledgers | Not verified             | Do not use without primary source                       |
| BIP-360 / BIP-361                                     | Not verified             | Verify against Bitcoin BIPs repository                  |
| EIP-8141 / Lean Ethereum 2026–2029                    | Not verified             | Verify against Ethereum/EIP primary sources             |
| Algorand has NIST-approved Falcon-1024 in production  | Incorrect / overclaim    | Falcon/FIPS 206 is not final                            |
| “The attack has started”                              | Overclaim                | Reframe as future exploitability of public-key exposure |
| “Quantum machines solve in minutes”                   | Conditional estimate     | Reframe with Google resource-estimate assumptions       |
| Project Leap / Tourbillon details                     | Needs BIS primary source | Verify before inclusion                                 |

## 5) Claim status taxonomy

| Status               | Meaning                                                    | Allowed use                                              |
| -------------------- | ---------------------------------------------------------- | -------------------------------------------------------- |
| Reusable             | Consistent with Research Note #1 and internal claim matrix | Can be used in internal strategy and guarded public copy |
| Context only         | Useful market framing but not technical evidence           | Internal strategy, deck context only                     |
| Needs primary source | External claim not yet verified                            | Do not use publicly                                      |
| Rejected             | Overclaim, FUD, or incorrect framing                       | Do not use                                               |

## 6) Source verification queue

| Claim                                                 | Primary source to verify                 | Status                   | Decision before public use      |
| ----------------------------------------------------- | ---------------------------------------- | ------------------------ | ------------------------------- |
| BlackRock framework on CRQC and decentralized ledgers | Official BlackRock publication           | Not verified             | Do not cite                     |
| BIP-360 / BIP-361                                     | Bitcoin BIPs repository                  | Not verified             | Do not cite as established BIP  |
| EIP-8141 / Lean Ethereum 2026–2029                    | eips.ethereum.org / Vitalik primary post | Not verified             | Do not cite                     |
| Project Leap Phase 2                                  | BIS official report                      | Needs primary source     | Macro context only              |
| Project Tourbillon                                    | BIS official report                      | Needs primary source     | Macro context only              |
| Algorand Falcon-1024                                  | Algorand primary technical documentation | Overclaim until verified | Do not say NIST-approved Falcon |
| Google resource estimate                              | Google Quantum AI whitepaper / arXiv     | Conditional              | Use only with assumptions       |

## 7) Reuse map

| Destination          | Reuse allowed? | Notes                                                      |
| -------------------- | -------------: | ---------------------------------------------------------- |
| Research Note #1 PDF |             No | Already locked                                             |
| Research Note #2     |            Yes | Good candidate theme                                       |
| Website homepage     |        Limited | Only CBOM-style visibility wording                         |
| Pitch deck           |            Yes | Macro risk, custody, CBOM, institution angle               |
| Grant application    |            Yes | Use with conservative wording                              |
| Social media         |   Very limited | Avoid countdown/FUD framing                                |
| Sales/B2B deck       |            Yes | Focus on inventory, authority exposure, custody sequencing |

## 8) Candidate Research Note #2 outline

Working title:

“From Wallet Exposure to Cryptographic Inventory: CBOM for Solana Post-Quantum Readiness”

Proposed sections:

1. Why post-quantum readiness is an inventory problem.
2. CBOM concepts applied to Web3.
3. Bitcoin, Ethereum and Solana comparative constraints.
4. Why Solana authority exposure matters.
5. Dormant assets as governance risk.
6. Custody and institutional migration sequencing.
7. Data confidence and false precision.
8. QuantaLayer Scan and Authority Exposure roadmap.
9. Non-goals and prohibited claims.

## 9) What QuantaLayer already covers

Research Note #1 already covers:

- no public CRQC today
- Shor vs Grover distinctions
- FIPS 203/204/205 finalized
- FIPS 206 not final
- Solana address-as-public-key model
- PDA
- transaction identifiers
- fee payer / compute budget
- authorities
- QES/QCI
- Authority Exposure
- Vault limitations
- Notary limitations
- abuse risks
- prohibited claims

## 10) Recommended additions to QuantaLayer strategy

### A. CBOM for Solana

CBOM-style visibility for Solana means inventorying cryptographic exposure across public addresses, authorities, programs, treasuries, multisigs, validators, and custody workflows.

Relier to:

- QuantaLayer Scan
- Authority Exposure
- B2B reporting
- institutional dashboards

### B. Dormant assets and governance risk

This is an important institutional topic.  
QuantaLayer should not propose freeze actions.  
QuantaLayer should not propose “digital salvage” as a product solution.
Treat dormant assets primarily as a governance and compliance risk vector.

### C. Institutional custody readiness

Include:

- HSM
- hybrid key migration
- authority inventory
- cold wallets
- multi-sig
- reporting

### D. Cross-chain comparative table

| Chain    | Main exposure                                       | Migration difficulty                   | QuantaLayer relevance |
| -------- | --------------------------------------------------- | -------------------------------------- | --------------------- |
| Bitcoin  | exposed/lost UTXOs, secp256k1                       | governance, dormant assets             | comparative framing   |
| Ethereum | EOAs, smart contracts, validators/BLS               | account abstraction, state size        | comparative framing   |
| Solana   | address = Ed25519 public key, authorities, programs | runtime + wallet + authority migration | core product focus    |

### E. Future R&D

- signature aggregation
- proof compression
- L2/DA implications
- post-quantum custody framework
- benchmark methodology

## 11) Do-not-use marketing phrases

Do not use:

- “The attack has started.”
- “Quantum machines will break wallets in minutes.”
- “Solana is already broken.”
- “Do not imply that a specific QuantaLayer product protects Solana.”
- “Do not imply that QuantaLayer can make Solana quantum-safe.”
- “QES predicts hacks.”
- “Quantum proof.”
- “Un-hackable.”

## 12) Publication-safe wording

Use only validated wording where applicable:

- Recent resource estimates make earlier planning more important, but they do not prove that a public CRQC can break deployed blockchain keys today.
- QuantaLayer brings CBOM-style visibility to Solana post-quantum readiness.
- The practical bottleneck is not only cryptography; it is inventory, prioritization, governance, custody and migration sequencing.
- QES is a migration criticality score, not a compromise probability.

## 13) Non-goals

- not a replacement for protocol migration
- not a public beta claim
- not a legal opinion
- not a custody product
- not a Q-Day prediction
