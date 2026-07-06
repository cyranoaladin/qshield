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
```

7. Start API and web processes.

## Rollback

1. Stop the newly deployed API and web processes.
2. Restore the previous release artifact or image.
3. Keep Redis cache if schema-compatible; otherwise flush only scan cache keys.
4. Do not roll back database migrations without a reviewed down-migration plan.
5. Verify `/healthz`, `/api/v1/stats` and landing page.

## Incident Response

- Provider outage: return 502 problem+json, keep scans fail-closed and disable public status messaging that implies account compromise.
- Redis outage: disable cache only if API still respects rate limits; otherwise fail closed.
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
