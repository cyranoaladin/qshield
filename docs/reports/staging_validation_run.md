# QuantaLayer Staging Validation Run

Date: 2026-07-06T12:24:55Z
Branch: `rc/staging-validation-pack`
Commit: `6cb104f48163ab1d8be131a4e3f44293c8c1271c`

## Tool Versions

- Node: `v22.21.0`
- pnpm: `10.12.1`

## Environment Presence

| Variable               | Status  |
| ---------------------- | ------- |
| `DATABASE_URL`         | missing |
| `REDIS_URL`            | missing |
| `HELIUS_API_KEY`       | missing |
| `HELIUS_RPC_URL`       | missing |
| `SOLANA_CLUSTER`       | missing |
| `JUPITER_PRICE_URL`    | missing |
| `API_URL`              | missing |
| `STAGING_URL`          | missing |
| `SMOKE_SOLANA_ADDRESS` | missing |
| `SMOKE_WAITLIST_EMAIL` | missing |
| `SENTRY_DSN`           | missing |

## Commands

| Command                                   | Status                                                     |
| ----------------------------------------- | ---------------------------------------------------------- |
| `pnpm install --frozen-lockfile`          | PASS                                                       |
| `pnpm db:generate`                        | PASS                                                       |
| `pnpm db:validate`                        | PASS                                                       |
| `pnpm lint`                               | PASS                                                       |
| `pnpm typecheck`                          | PASS                                                       |
| `pnpm test`                               | PASS                                                       |
| `pnpm test:coverage`                      | PASS                                                       |
| `pnpm build`                              | PASS                                                       |
| `pnpm --filter @quantalayer/web test:e2e` | PASS                                                       |
| `pnpm audit --prod`                       | PASS                                                       |
| `pnpm smoke:providers`                    | SKIPPED: HELIUS_API_KEY or SMOKE_SOLANA_ADDRESS is missing |
| `pnpm smoke:api`                          | SKIPPED: API_URL is missing or API is not running          |
| `pnpm smoke:staging`                      | SKIPPED: STAGING_URL is missing                            |

## Final Status

PASS_WITH_SKIPS

## Traceability Note

Validation commands were run on commit `6cb104f48163ab1d8be131a4e3f44293c8c1271c`.
This report is committed in a later documentation-only commit.
No application source files were changed after validation.
