# QuantaLayer Scan Data Retention

## Scope

This document covers the MVP data handled by QuantaLayer Scan. The MVP is read-only: it never asks for, receives, stores or signs with private keys, seed phrases or wallet signatures.

## Data Stored

### Scan Aggregates

For each cache miss scan, the API stores an aggregate row:

- `addressHash`: SHA-256 hash of the scanned public address.
- `qes`, `qci`, `grade`, `gradeDisplayed`, `status`.
- `estimatedMigrationExposureValueUsd`.
- `qesVersion`, `qciVersion`.
- `createdAt`.

The raw scanned address is not stored in the scan aggregate table.

### Waitlist

For opt-in waitlist entries, the API stores:

- email address;
- optional wallet address, only if voluntarily provided;
- optional source tag;
- explicit consent flag;
- creation timestamp.

No waitlist entry is accepted without explicit consent.

### Cache

Redis may temporarily store scan responses under a key derived from the address hash. The TTL is controlled by `SCAN_CACHE_TTL_SECONDS`.

## Retention Rules

- Scan aggregate rows are retained for aggregate statistics and product quality monitoring.
- Redis cache entries expire automatically according to the configured TTL.
- Waitlist entries are retained until the user unsubscribes, requests deletion, or the waitlist purpose ends.
- Operational logs must not contain full request bodies, raw scanned addresses, seed phrases, private keys or emails.

## Deletion And RGPD Path

Waitlist deletion requests should be sent to `research@quantalayer.app` until a self-service signed deletion link is available. The request must be verified before deletion to avoid removing another person’s entry.

Scan aggregate rows are keyed by one-way hashes of public blockchain addresses. If a deletion request concerns an optional wallet stored in the waitlist table, that waitlist field must be removed or the row deleted according to the verified request.

## Security Notes

- Public Solana addresses are public blockchain data, but QuantaLayer still avoids storing raw scanned addresses in aggregate tables.
- Optional waitlist wallet addresses are user-provided personal context and must be treated with the same care as email metadata.
- QuantaLayer Scan does not provide a security audit and does not predict a hack. QES measures migration criticality; QCI measures confidence in the data used for that score.
