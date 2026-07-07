# QuantaLayer Whitepaper v0.1

Post-Quantum Readiness for Solana

Status: short publication-safe MVP overview.

## Executive Summary

QuantaLayer is an application and analytics layer for Solana post-quantum readiness. The MVP,
QuantaLayer Scan, is a read-only scanner that estimates migration criticality through QES and data
confidence through QCI. It helps users and teams prioritize which accounts, assets and operational
surfaces need attention first. It does not replace protocol-level migration, custody review or
security audits.

## Problem

Solana relies heavily on Ed25519 signatures. A cryptographically relevant quantum computer capable
of running Shor's algorithm at scale would undermine Ed25519 assumptions. No public system has
demonstrated that capability today. The engineering problem is therefore readiness: inventory,
measurement, prioritization, user education and safe experimentation before migration becomes
urgent.

## Solana Specificity

For key-controlled accounts, a Solana address is the Ed25519 public key itself. Solana also includes
PDAs, SPL Token and Token-2022 accounts, stake accounts, vote accounts, program upgrade authorities,
multisigs and governance keys. A readiness tool must distinguish ordinary wallet balances from
authority and protocol control surfaces.

## QuantaLayer Scan

QuantaLayer Scan accepts a public address and computes:

- QES: migration criticality from observable asset value, stake or locked value, concentration,
  observable age, significant token accounts and recent activity.
- QCI: data confidence from price coverage, RPC/DAS completeness, DeFi/NFT/stake visibility,
  freshness and account classification.

If QCI is below 40, the product must not display an A/B/C/D/E grade.

When concentration, observable age or recent activity cannot be observed, QES is renormalized over
the remaining observable factors and QCI is capped. One missing factor caps QCI at 79, two at 69,
and three or more at 59. This rule is versioned as `QCI_VERSION = "1.0.1"`.

## QuantaLayer Vault And Notary Context

QuantaLayer Vault and QuantaLayer Notary are research and later-stage product tracks. They are not
part of the Scan MVP. Vault is experimental and requires public devnet testing, audits, caps and
recovery documentation before any production release. Notary is an integrity and anchoring design,
not a qualified trust service.

## Architecture

The MVP is split into:

- `packages/scoring`: pure QES/QCI computation with no I/O.
- `packages/solana`: read-only Helius/Jupiter/stake data boundary with Zod validation.
- `apps/api`: Fastify routes, Redis cache, Redis-backed rate limits, persistence and problem JSON.
- `apps/web`: Next.js UI, learn pages, waitlist, score display, stats and share images.

## Limitations

- Scores are estimates based on observable public data.
- Missing prices, provider failures or spam-token pollution reduce confidence.
- A scan does not prove ownership of the scanned address.
- A scan does not protect funds or migrate accounts.
- Authority Exposure is a future module and does not replace audits.
- The MVP stores aggregate scan rows using address hashes, not raw addresses.

## Roadmap

1. MVP Scan: QES/QCI, cache, aggregate persistence, waitlist, learn page and stats.
2. Authority Exposure inventory for protocols, DAOs and institutions.
3. Experimental Vault benchmarks and devnet-only testing.
4. Notary pilots after legal review.

## Risks

Readiness tools can be misused as phishing pretexts or targeting aids. QuantaLayer therefore uses
conservative copy, rate limits, no nominative leaderboard, no raw-address aggregate output and
claim discipline based on `docs/claims_matrix.md`.
