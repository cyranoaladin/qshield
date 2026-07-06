# QuantaLayer Scan Staging Readiness Audit

Date: 2026-07-06
Branch: `rc/staging-validation-pack`

## Scope

This pass hardens the implemented MVP for staging validation. It does not change the Research Note
PDF and does not implement QuantaLayer Vault, QuantaLayer Notary or Authority Exposure product code.

## Gate Status

| Gate               | Status                          | Notes                                                                                  |
| ------------------ | ------------------------------- | -------------------------------------------------------------------------------------- |
| Database           | pass locally                    | `pnpm db:validate` passed. Prisma schema remains unchanged in this pass.               |
| Redis cache        | implemented                     | Scan cache uses Redis in runtime through `RedisCache`.                                 |
| Redis rate limiter | implemented                     | Runtime `/api/v1/scan` rate limiting is Redis-backed and fails closed on Redis errors. |
| Helius             | implemented, live smoke pending | Missing `HELIUS_API_KEY` fails before client construction or network access.           |
| Jupiter            | implemented, live smoke pending | Price queries remain batched through the existing data layer.                          |
| Sentry             | optional, deployment pending    | Runtime initializes Sentry only when `SENTRY_DSN` is configured.                       |
| Local Docker       | pass locally                    | PostgreSQL and Redis started healthy with Docker Compose.                              |
| k6                 | not run locally                 | `k6` binary is not installed in this environment.                                      |
| Smoke tests        | not run locally                 | Smoke scripts now skip or fail explicitly unless required variables are present.       |

## Correctives

### P0

- Helius fail-closed: `buildRuntimeScanProvider()` calls `assertScanProviderEnv()` before Helius
  construction. Development boot may continue without the key, but a real scan fails closed.
- Redis rate limiting: runtime now uses `RedisRateLimiter`; `MemoryRateLimiter` remains for tests
  and explicit local injection only.
- QCI missing-factor cap: `QCI_VERSION = "1.0.1"` caps QCI at 79/69/59 when one/two/three QES
  factors are unavailable.

### P1

- Scan cache key is versioned as
  `scan:v1:<cluster>:qes-<QES_VERSION>:qci-<QCI_VERSION>:<addressHash>`.
- Stake account discovery queries both staker offset `12` and withdrawer offset `44`, then
  deduplicates by stake account pubkey.
- Manual smoke scripts were added for providers, local API and staging.
- `smoke:providers` requires an explicit `SMOKE_SOLANA_ADDRESS`.
- `smoke:api` does not write waitlist rows unless `SMOKE_API_WRITE=true`.

### P2

- `PrismaMvpStore.getStats()` still aggregates from rows in memory. This is acceptable for staging,
  but before public beta it should move to Prisma aggregate/groupBy queries or a materialized
  aggregate table.
- Security docs now state that raw scanned addresses and raw waitlist emails must not be logged.

## Staging RC Gates

Provider/API smokes are required to validate a deployed staging environment. They are skipped in
this local RC run because live secrets and staging URLs are not present.

| Gate                           | Required for staging deploy | Required for public beta | Current status |
| ------------------------------ | --------------------------: | -----------------------: | -------------- |
| Local unit/type/build/e2e      |                         yes |                      yes | pass           |
| PostgreSQL migration on Docker |                         yes |                      yes | pass           |
| Redis Docker cache/rate-limit  |                         yes |                      yes | pass           |
| Provider smoke                 |                         yes |                      yes | skipped        |
| API smoke                      |                         yes |                      yes | skipped        |
| Staging smoke                  |                          no |                      yes | skipped        |
| k6 10/50                       |                          no |                      yes | skipped        |
| Sentry                         |                          no |                      yes | skipped        |

## Required Environment Variables

- `NODE_ENV`
- `API_PORT`
- `API_CORS_ORIGIN`
- `HELIUS_API_KEY`
- `HELIUS_RPC_URL`
- `SOLANA_CLUSTER`
- `JUPITER_PRICE_URL`
- `DATABASE_URL`
- `REDIS_URL`
- `SCAN_CACHE_TTL_SECONDS`
- `RATE_LIMIT_SCANS_PER_MINUTE`
- `SENTRY_DSN` when monitoring is enabled
- `NEXT_PUBLIC_API_URL`

## Smoke Commands

```bash
HELIUS_API_KEY=... SMOKE_SOLANA_ADDRESS=... pnpm smoke:providers
API_URL=http://localhost:3001 pnpm smoke:api
STAGING_URL=https://staging.example.com pnpm smoke:staging
STAGING_URL=https://staging.example.com SMOKE_STAGING_WRITE=true pnpm smoke:staging
```

`smoke:providers` does not write to the database. `smoke:api` skips waitlist writes unless
`SMOKE_API_WRITE=true` is set. `smoke:staging` skips waitlist writes unless
`SMOKE_STAGING_WRITE=true` is set.

## Public Beta Blockers

- Live PostgreSQL migration on staging.
- Live Redis validation under cache hit and miss paths.
- Live Helius/Jupiter smoke test with real provider credentials.
- k6 10/50 concurrent-user report with p50/p95/p99 and error rate.
- Sentry project connected and monitored.
- Operational review of rate limits and abuse response.

## Local Command Results

- `pnpm install --frozen-lockfile`: pass.
- `pnpm lint`: pass.
- `pnpm typecheck`: pass.
- `pnpm test`: pass.
- `pnpm test:coverage`: pass.
- `pnpm build`: pass.
- `pnpm --filter @quantalayer/web test:e2e`: pass, 6 tests.
- `pnpm db:validate`: pass.
- `pnpm audit --prod`: pass, no known vulnerabilities.
- `docker compose up -d postgres redis`: pass with local ports `55432` and `56379`.
- `DATABASE_URL=postgresql://quantalayer:quantalayer@localhost:55432/quantalayer pnpm exec prisma migrate deploy`: pass.
- `DATABASE_URL=postgresql://quantalayer:quantalayer@localhost:55432/quantalayer pnpm db:validate`: pass.
- `DATABASE_URL=postgresql://quantalayer:quantalayer@localhost:55432/quantalayer REDIS_URL=redis://localhost:56379 bash scripts/validate-staging-readiness.sh`: pass with skips.
- `pnpm loadtest:scan`: not run because `k6` is not installed.
- `pnpm smoke:providers`: not run because `HELIUS_API_KEY` is missing.
- `pnpm smoke:api`: not run because no local API URL was configured/running for this pass.
- `pnpm smoke:staging`: not run because `STAGING_URL` is missing.

## Coverage

`@quantalayer/scoring` after hardening:

- Statements: 98.38%.
- Branches: 95.83%.
- Functions: 100%.
- Lines: 98.34%.

## Staging Status

- Staging deploy: ready as a release-candidate package for deployment and live validation.
- Public beta: not ready until the live smoke, load, monitoring and operational gates above are
  completed.
