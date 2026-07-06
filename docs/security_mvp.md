# QuantaLayer Scan MVP Security Checklist

## Product Boundaries

- QuantaLayer Scan is read-only.
- No seed phrase, private key or signed transaction is requested.
- Wallet connection is not required for scanning.
- QES is migration criticality, not hack probability.
- QCI is data confidence, not a guarantee of correctness.
- QuantaLayer Vault remains experimental and outside the MVP product surface.

## API Controls

- Zod validation on public request bodies.
- Fail-closed scan behavior: no partial score on provider failure.
- Redis cache keys derived from address hashes.
- Scan aggregates store `addressHash`, never the raw scanned address.
- Rate limiting is enforced per client IP.
- Structured logs must avoid request bodies, emails, private keys and raw scanned addresses.
- CORS is restricted to `API_CORS_ORIGIN`.
- API security headers include `nosniff`, `DENY` framing, restrictive permissions policy and API-only CSP.

## Web Controls

- Security headers are configured in `next.config.ts`.
- Public claims are checked against `docs/claims_matrix.md`.
- The scan warning states that the product is read-only and never asks for a seed phrase.
- No public leaderboard, whale list or per-wallet ranking is implemented.

## Monitoring

- Sentry is initialized only when `SENTRY_DSN` is configured.
- Provider failures and internal errors should be captured without request bodies.
- Alerting thresholds for 429, 502 and latency must be configured before beta.

## Beta Gate

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:coverage`
- `pnpm build`
- `pnpm --filter @quantalayer/web test:e2e`
- k6 load test with API, Redis and provider configuration.
