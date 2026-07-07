# PR: QuantaLayer Scan MVP — Staging Release Candidate

## Scope

This PR prepares the QuantaLayer Scan MVP for staging deployment and live validation.

## Included

- QES/QCI scoring engine.
- Read-only Solana data layer.
- API scan/stats/waitlist.
- Web scan pages, waitlist, learn page, stats dashboard and OG card.
- Prisma schema and migration.
- Redis cache and Redis-backed rate limiter.
- Fail-closed Helius provider setup.
- Docker PostgreSQL/Redis local staging environment.
- Smoke scripts.
- Staging validation script.
- Security, runbook and deployment docs.

## Explicitly Out Of Scope

- QuantaLayer Vault product code.
- QuantaLayer Notary product code.
- Authority Exposure product code.
- Token.
- Public beta release.

## Validation

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:coverage`
- `pnpm build`
- `pnpm --filter @quantalayer/web test:e2e`
- `pnpm db:validate`
- `pnpm audit --prod`
- Docker PostgreSQL/Redis migration.
- `scripts/validate-staging-readiness.sh`

## Remaining Blockers Before Public Beta

- Live provider smoke with Helius/Jupiter.
- Live API smoke.
- Live staging smoke.
- k6 10/50 concurrent-user report.
- Sentry configured and monitored.
- Operational abuse/rate-limit review.
- Legal/privacy review.
