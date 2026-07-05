# Environment Validation

Q-Shield validates runtime configuration through `packages/shared/src/env.ts`.

Production mode (`NODE_ENV=production`) is fail-closed: invalid URLs, invalid numbers,
unsupported enums, missing storage/cache endpoints, or a missing `HELIUS_API_KEY` stop boot.

Development mode still rejects boot-required variables such as `DATABASE_URL`, `REDIS_URL`,
`API_PORT`, and provider URLs. It only tolerates explicitly optional values with warnings
(`SENTRY_DSN`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`) plus the deferred scan provider key
(`HELIUS_API_KEY`). A real scan path must call `assertScanProviderEnv(env)` before touching
Helius, so a missing key fails before any network request is attempted.
