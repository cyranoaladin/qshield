# QuantaLayer Scan MVP Runbook

## Services

- Web: Next.js app.
- API: Fastify service.
- Database: PostgreSQL through Prisma.
- Cache: Redis.
- Providers: Helius RPC/DAS and Jupiter Price API.

## Deploy

1. Build artifacts from a clean checkout.
2. Set environment variables from `.env.example`.
3. Run `pnpm install --frozen-lockfile`.
4. Run `pnpm db:generate`.
5. Apply database migrations:

```bash
DATABASE_URL=postgresql://... pnpm exec prisma migrate deploy
```

6. Run verification:

```bash
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm build
pnpm --filter @quantalayer/web test:e2e
pnpm db:validate
pnpm audit --prod
```

7. Start API and web processes.

## Local Staging Infrastructure

Start local PostgreSQL and Redis:

```bash
pnpm staging:local:up
```

The local Compose file maps PostgreSQL to `localhost:55432` and Redis to `localhost:56379`.

Apply migrations and validate the schema:

```bash
DATABASE_URL=postgresql://quantalayer:quantalayer@localhost:55432/quantalayer pnpm staging:local:migrate
DATABASE_URL=postgresql://quantalayer:quantalayer@localhost:55432/quantalayer pnpm db:validate
```

Stop local services:

```bash
pnpm staging:local:down
```

If Docker is unavailable, mark this gate as skipped in
`docs/reports/staging_validation_run.md`; do not claim migration validation.

## Smoke Tests

Smoke tests are manual gates and are not run in CI.

```bash
HELIUS_API_KEY=... SMOKE_SOLANA_ADDRESS=... pnpm smoke:providers
API_URL=http://localhost:3001 pnpm smoke:api
STAGING_URL=https://staging.example.com pnpm smoke:staging
```

`smoke:providers` checks Helius, Jupiter and one read-only scan without database writes.
`smoke:api` checks local `/healthz`, `/api/v1/stats` and `/api/v1/scan`. It only writes a
waitlist row when `SMOKE_API_WRITE=true`.
`smoke:staging` checks health, stats and one scan against staging. It skips waitlist writes unless
`SMOKE_STAGING_WRITE=true` is set.

The release-candidate validation wrapper is:

```bash
bash scripts/validate-staging-readiness.sh
```

## Rollback

1. Stop the newly deployed API and web processes.
2. Restore the previous release artifact or image.
3. Keep Redis cache if schema-compatible; otherwise flush only scan cache keys.
4. Do not roll back database migrations without a reviewed down-migration plan.
5. Verify `/healthz`, `/api/v1/stats` and landing page.

## Incident Response

- Provider outage: return 502 problem+json, keep scans fail-closed and disable public status messaging that implies account compromise.
- Redis outage: scan fails closed because runtime rate limiting is Redis-backed.
- Database outage: scans may be blocked if aggregate persistence cannot be completed.
- Abuse spike: lower `RATE_LIMIT_SCANS_PER_MINUTE`, block abusive IPs at the edge and monitor 429 rate.
- Claim or phishing incident: update `docs/claims_matrix.md`, publish clarification and rotate affected public copy.

## Human Review Before Beta

- Helius and Jupiter quota review.
- Redis persistence and eviction policy.
- PostgreSQL backup and restore test.
- Sentry project configured and monitored.
- Legal review for waitlist privacy language.
- Trademark clearance.
