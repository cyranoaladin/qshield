# QuantaLayer Staging Validation Run

Date: 2026-07-06T07:39:49Z
Branch: `rc/staging-validation-pack`
Commit: `1fde19c680616bc6dd354779bafb360bdab42c89`

## Tool Versions

- Node: `v22.21.0`
- pnpm: `10.12.1`

## Environment Presence

| Variable               | Status  |
| ---------------------- | ------- |
| `DATABASE_URL`         | present |
| `REDIS_URL`            | present |
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
