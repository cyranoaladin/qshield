# QuantaLayer Scan Staging Deployment

Status: staging release-candidate runbook. Public beta remains blocked until live validation gates
are complete.

## Target Architecture

- Web: Next.js app deployed behind HTTPS.
- API: Fastify service deployed behind HTTPS.
- Database: PostgreSQL with Prisma migrations.
- Cache and rate limiting: Redis.
- Providers: Helius RPC/DAS and Jupiter Price API.
- Monitoring: Sentry when `SENTRY_DSN` is configured.

## Required Variables

Use `.env.staging.example` as the template. Values must come from the staging secret store, not from
the repository.

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

## Local Infrastructure Check

```bash
docker compose up -d postgres redis
DATABASE_URL=postgresql://quantalayer:quantalayer@localhost:55432/quantalayer pnpm exec prisma migrate deploy
DATABASE_URL=postgresql://quantalayer:quantalayer@localhost:55432/quantalayer pnpm db:validate
```

The local Compose file maps PostgreSQL to `localhost:55432` and Redis to `localhost:56379` to avoid
conflicts with developer machines that already run services on standard ports.

Stop local services after validation:

```bash
docker compose down
```

## Deployment Order

1. Build from a clean checkout of the release candidate branch.
2. Provision PostgreSQL and Redis.
3. Apply Prisma migrations with `pnpm exec prisma migrate deploy`.
4. Deploy the API with server environment variables.
5. Verify API `/healthz`.
6. Deploy the web app with public environment variables.
7. Verify `/`, `/stats`, `/learn/why-solana` and `/articles/research-note-1.pdf`.
8. Run smoke tests.

## Smoke Commands

Provider smoke, no database write:

```bash
HELIUS_API_KEY=... SMOKE_SOLANA_ADDRESS=... pnpm smoke:providers
```

Local or staging API smoke without waitlist write:

```bash
API_URL=https://api-staging.quantalayer.app pnpm smoke:api
```

API smoke with waitlist write explicitly enabled:

```bash
API_URL=https://api-staging.quantalayer.app \
SMOKE_API_WRITE=true \
SMOKE_WAITLIST_EMAIL=smoke+staging@quantalayer.app \
pnpm smoke:api
```

Staging smoke:

```bash
STAGING_URL=https://api-staging.quantalayer.app pnpm smoke:staging
```

Staging waitlist write requires:

```bash
SMOKE_STAGING_WRITE=true
```

## Validation Script

```bash
bash scripts/validate-staging-readiness.sh
```

The script writes `docs/reports/staging_validation_run.md` and reports `PASS`,
`PASS_WITH_SKIPS` or `FAIL`.

## Logs To Monitor

- API 5xx rate.
- `UPSTREAM_DATA_ERROR` rate.
- `INFRASTRUCTURE_UNAVAILABLE` rate.
- Redis latency and memory pressure.
- PostgreSQL connection errors.
- Rate-limit 429 rate.
- Waitlist duplicate rate.

## Alert Thresholds

- Any sustained `INFRASTRUCTURE_UNAVAILABLE` on `/api/v1/scan`.
- Provider 502 rate above 5% for 10 minutes.
- p95 scan latency above 2 seconds for 10 minutes.
- Redis memory above 80%.
- PostgreSQL connection saturation.

## Privacy Checks

- `GET /api/v1/stats` must return aggregates only.
- No raw scanned address should appear in stats responses.
- API logs must not include request bodies, raw waitlist emails or private data.
- OG images must truncate addresses.

## Rollback

1. Stop the new API and web deployment.
2. Restore the previous API and web release artifacts.
3. Keep Redis if cache schema is compatible; otherwise flush only `scan:v1:*` keys.
4. Do not roll back database migrations without a reviewed down-migration plan.
5. Verify `/healthz`, `/api/v1/stats`, `/` and `/articles/research-note-1.pdf`.

## Public Beta Blockers

- Provider smoke with real Helius/Jupiter credentials.
- API smoke against staging.
- k6 10/50 concurrent-user report.
- Sentry monitored in staging.
- Operational review of abuse/rate-limit thresholds.
