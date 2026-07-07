# QuantaLayer Scan MVP Completion Report

Date: 2026-07-06
Branch: `rc/staging-validation-pack`

## Lots Completed

- LOT-00: initial repository audit.
- LOT-3.5: normative documentation, claims matrix, threat model, glossary and short whitepaper.
- LOT-04: pure QES/QCI scoring engine.
- LOT-05: read-only Solana data layer with Helius/Jupiter clients and cache adapters.
- LOT-06: API `/api/v1/scan` and `/api/v1/stats`.
- LOT-07: Prisma schema, initial migration and waitlist backend.
- LOT-08: web scan result, waitlist and learn pages with i18n and e2e tests.
- LOT-09: OG score card route and aggregate stats dashboard.
- LOT-10: security headers, optional Sentry, audit clean-up, k6 script and runbook.

## Staging Hardening Addendum

- Helius scan provider now fails closed before Helius client construction when `HELIUS_API_KEY` is
  missing.
- Runtime scan rate limiting is Redis-backed; memory rate limiting remains only for tests and
  explicit local injection.
- QCI behavior is versioned as `1.0.1` and caps confidence when QES factors are not observable.
- Scan cache keys now include cache schema, Solana cluster, QES version, QCI version and address
  hash.
- Stake-account discovery covers staker and withdrawer authority filters and deduplicates by stake
  account pubkey.
- Manual non-CI smoke scripts were added for provider, local API and staging checks.
- Public beta remains blocked until live provider smoke, Redis/DB staging validation, k6 run and
  monitoring review are complete.

## Staging RC Addendum

- Added local PostgreSQL and Redis `docker-compose.yml`.
- Added `.env.local.example` and `.env.staging.example` templates with no real secrets.
- Added `scripts/validate-staging-readiness.sh`, which writes
  `docs/reports/staging_validation_run.md`.
- Hardened smoke scripts so provider smoke requires an explicit test address and API smoke does not
  write waitlist rows unless explicitly enabled.
- Upgraded `RedisRateLimiter` to use a Lua `EVAL` operation for atomic INCR/EXPIRE behavior.
- Added `docs/deployment_staging.md` and `docs/reports/pr_merge_checklist.md`.

## Key Files Created Or Updated

- `packages/scoring/src/*`
- `packages/solana/src/*`
- `apps/api/src/server.ts`
- `apps/api/src/storage.ts`
- `apps/web/src/app/*`
- `apps/web/src/components/*`
- `apps/web/e2e/quantalayer-scan.spec.ts`
- `prisma/schema.prisma`
- `prisma/migrations/20260706000000_init/migration.sql`
- `docs/openapi.json`
- `docs/data-retention.md`
- `docs/security_mvp.md`
- `docs/runbook.md`
- `docs/loadtest_quantalayer_scan.md`
- `docs/reports/staging_readiness_audit.md`
- `scripts/smoke-providers.ts`
- `scripts/smoke-api.ts`
- `scripts/smoke-staging.ts`

## Dependencies Added

- `@quantalayer/scoring`, `@quantalayer/solana`: internal API wiring.
- `@solana/web3.js`, `bs58`: Solana address validation and public-key handling.
- `ioredis`: Redis cache adapter and API cache runtime.
- `@fastify/cors`: strict API CORS.
- `zod`: API body and provider response validation.
- `@prisma/client`, `prisma`: database schema, migration and runtime client.
- `@playwright/test`: e2e web verification.
- `@sentry/node`: optional API error monitoring when `SENTRY_DSN` is configured.
- `tsx`: root-level execution of manual smoke scripts.
- `dotenv`: load `.env` for root-level manual smoke scripts.
- `@quantalayer/scoring`, `@quantalayer/solana`: root workspace dependencies for smoke scripts.

Overrides:

- `postcss@8.5.16`: previously required security override.
- `effect@3.20.0`: resolves Prisma transitive audit finding.
- `jayson>uuid@11.1.1`: resolves Solana RPC transitive audit finding.

## Routes Available

API:

- `GET /healthz`
- `POST /api/v1/scan`
- `GET /api/v1/stats`
- `POST /api/v1/waitlist`

Web:

- `/`
- `/scan/[address]`
- `/waitlist`
- `/learn/why-solana`
- `/stats`
- `/api/og/score`

## Verification Summary

- `pnpm install --frozen-lockfile`: pass.
- `pnpm lint`: pass.
- `pnpm typecheck`: pass.
- `pnpm test`: pass.
- `pnpm test:coverage`: pass.
- `pnpm build`: pass.
- `pnpm --filter @quantalayer/web test:e2e`: pass, 6 tests.
- `pnpm audit --prod`: pass, no known vulnerabilities.
- `pnpm db:validate`: pass.
- `prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`: generated expected SQL.
- Lighthouse mobile on production Next build for `/`: 100.
- `pnpm loadtest:scan`: not run in the staging-hardening pass because `k6` is not installed.
- `pnpm smoke:providers`: not run because `HELIUS_API_KEY` is missing.
- `pnpm smoke:api`: not run because no local API URL was configured/running for this pass.
- `pnpm smoke:staging`: not run because `STAGING_URL` is missing.

## Coverage

`@quantalayer/scoring`:

- Statements: 98.38%
- Branches: 95.83%
- Functions: 100%
- Lines: 98.34%

## Read-Only And Privacy Checks

- Scan API never accepts private keys, seed phrases or signatures.
- Scan aggregate persistence stores `addressHash`, not raw scanned addresses.
- Waitlist requires explicit consent.
- Logs use address/email hashes where applicable.
- Public pages avoid machine-listed banned claims.
- No legacy public names were detected in active source by the final grep.

## Known Limits

- Provider calls are implemented for Helius/Jupiter, but no live provider smoke test was executed in this environment.
- Prisma migration was validated and diffed from empty, but not applied to a live PostgreSQL instance in this environment.
- k6 script is committed, but k6 is not installed locally, so the 10/50 concurrent-user run was not executed here.
- Sentry is configured as optional; it requires a real `SENTRY_DSN` in deployment.
- QuantaLayer Vault, QuantaLayer Notary and Authority Exposure remain out of scope for MVP code.

## Final Status

MVP implementation is a staging release candidate after local non-live gates. Public beta remains
blocked until live PostgreSQL migration, Redis/API/provider smoke tests, k6 run, Sentry project
setup and operational review are complete.
