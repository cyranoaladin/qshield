# Environment Validation

Q-Shield validates runtime configuration through `packages/shared/src/env.ts`.

The module exposes two scoped parsers:

- `parseServerEnv`: API and backend-only variables (`API_*`, provider URLs, storage/cache,
  rate limits, observability, and `HELIUS_API_KEY`).
- `parseWebEnv`: public web variables (`NEXT_PUBLIC_*`) plus `NODE_ENV`.

The API uses `parseServerEnv`, so it does not require `NEXT_PUBLIC_*` variables to boot.
The web app must use `parseWebEnv` when it starts consuming public runtime configuration.

Production mode (`NODE_ENV=production`) is fail-closed per scope: invalid URLs, invalid numbers,
unsupported enums, missing required server storage/cache endpoints, missing required web public
URLs, or a missing `HELIUS_API_KEY` in the server scope stop boot.

Development mode still rejects boot-required variables such as `DATABASE_URL`, `REDIS_URL`,
`API_PORT`, provider URLs, and `NEXT_PUBLIC_API_URL`. It only tolerates explicitly optional
values with warnings (`SENTRY_DSN`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`) plus the deferred scan
provider key (`HELIUS_API_KEY`). A real scan path must call `assertScanProviderEnv(env)` before
touching Helius, so a missing key fails before any network request is attempted.
