# QuantaLayer Live Staging Validation Protocol

This protocol is for the human operator deploying and validating the staging release candidate.
Do not store real secret values in the repository or in validation reports.

## 1. Secret Prerequisites

Configure these values in the staging secret store before running live validation:

- `DATABASE_URL`
- `REDIS_URL`
- `HELIUS_API_KEY`
- `HELIUS_RPC_URL`
- `SOLANA_CLUSTER`
- `JUPITER_PRICE_URL`
- `API_URL`
- `STAGING_URL`
- `SMOKE_SOLANA_ADDRESS`
- `SMOKE_WAITLIST_EMAIL`
- `SENTRY_DSN`

## 2. Validation Order

Run the commands in this order from a clean checkout of the staging release candidate:

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm db:validate
pnpm exec prisma migrate deploy
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm build
pnpm --filter @quantalayer/web test:e2e
pnpm audit --prod
pnpm smoke:providers
pnpm smoke:api
pnpm smoke:staging
```

The smoke scripts must report skipped checks explicitly if a required environment variable is
absent. Do not mark a smoke check as passed unless it was actually executed.

## 3. k6 Load Test

Run:

```bash
pnpm loadtest:scan
```

The `k6` binary must be installed on the validation machine. Record p50, p95, p99 and error rate
for 10 and 50 concurrent-user scenarios before considering public beta.

## 4. Observability Checks

Verify:

- Sentry receives a controlled test error, or at minimum the staging API loads `SENTRY_DSN`.
- API logs do not contain raw scanned addresses.
- API logs do not contain raw waitlist emails.
- 429 responses are visible when rate limits are forced.
- 502 responses are visible when provider failures are forced or simulated.
- 503 responses are visible when Redis is unavailable.

## 5. Validation Criteria

Staging live validation is complete only if:

- PostgreSQL migration succeeds.
- Redis cache hit and miss paths are observed.
- Redis rate limiting is observed live.
- Helius/Jupiter provider smoke succeeds.
- API smoke succeeds.
- Staging smoke succeeds.
- k6 10/50 succeeds with p95 documented.
- Sentry is operational.
- `/api/v1/stats` exposes aggregate data only, with no raw address.
- No public beta is opened during staging validation.

## 6. Public Beta Gate

Staging release candidate can be deployed for validation. Public beta remains blocked until all live
validation criteria above pass and are reviewed.
