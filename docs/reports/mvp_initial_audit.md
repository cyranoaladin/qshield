# QuantaLayer Scan MVP Initial Audit

Date: 2026-07-06

Branch: `mvp/quantalayer-scan`

## Scope

This audit was produced before implementing the QuantaLayer Scan MVP. It intentionally does not
modify the locked Research Note PDF artifacts and does not implement application behavior.

## Repository Summary

Synthetic tree:

```text
.
├── apps/
│   ├── api/          Fastify API scaffold
│   └── web/          Next.js web scaffold
├── packages/
│   ├── scoring/      placeholder pure package
│   ├── shared/       env validation, constants and typed errors
│   └── solana/       placeholder data-layer package
├── programs/
│   └── quantalayer-vault/ README-only placeholder
├── docs/
│   ├── articles/     locked Research Note #1 source/PDF artifacts
│   ├── reports/      release and audit reports
│   ├── cahier_des_charges_quantalayer.md
│   ├── ci.md
│   └── env.md
├── public/
│   ├── articles/     public PDF aliases/checksums
│   └── images/       QuantaLayer logo assets
└── scripts/
    └── build_research_note.sh
```

## Packages Present

| Workspace                    | Status                                                         |
| ---------------------------- | -------------------------------------------------------------- |
| root `quantalayer`           | pnpm workspace, lint/typecheck/test/build scripts              |
| `apps/api`                   | Fastify scaffold with `/healthz` only                          |
| `apps/web`                   | Next.js landing page scaffold                                  |
| `packages/shared`            | implemented env parsing, constants, typed errors/problem JSON  |
| `packages/scoring`           | placeholder only, `SCORING_PACKAGE_STATUS.implemented = false` |
| `packages/solana`            | placeholder only, `SOLANA_PACKAGE_STATUS.implemented = false`  |
| `programs/quantalayer-vault` | README-only placeholder; out of MVP implementation scope       |

## Scripts Available

Root scripts:

```json
{
  "dev": "pnpm -r --parallel --filter @quantalayer/web --filter @quantalayer/api dev",
  "lint": "prettier --check . && eslint .",
  "typecheck": "pnpm -r typecheck",
  "test": "pnpm -r test",
  "test:coverage": "pnpm -r test:coverage",
  "build": "pnpm -r build"
}
```

Workspace scripts are present for `build`, `typecheck`, `test` and `test:coverage` where
applicable. `apps/api` also exposes `dev` and `start`; `apps/web` exposes Next.js `dev` and
`start`.

## Dependencies Present

Root dev dependencies:

- `@eslint/js`
- `@next/eslint-plugin-next`
- `@vitest/coverage-v8`
- `eslint`
- `eslint-config-prettier`
- `globals`
- `prettier`
- `typescript`
- `typescript-eslint`
- `vitest`

API dependencies:

- `@quantalayer/shared`
- `dotenv`
- `fastify`

Web dependencies:

- `next`
- `react`
- `react-dom`
- `lucide-react`
- `@radix-ui/react-slot`
- `class-variance-authority`
- `clsx`
- `tailwind-merge`
- `tailwindcss-animate`

Shared dependencies:

- `zod`

## Dependencies Missing For MVP

Expected additions by lot:

- LOT-05 Solana data layer: `@solana/web3.js`, `bs58`, cache client (`ioredis` or `redis`),
  and test mocks/fixtures as needed.
- LOT-06 API scan/stats: `@quantalayer/scoring`, `@quantalayer/solana`, `@fastify/cors`,
  structured logging/rate-limit/cache dependencies, and OpenAPI tooling.
- LOT-07 database/waitlist: Prisma client and migration tooling.
- LOT-08/09 web/e2e/OG: Playwright and OG image dependency if used.
- LOT-10 hardening/load test: Sentry package and k6 script/docs.

Any new dependency must be justified in the completion report.

## API Routes Existing

Detected in `apps/api/src/server.ts`:

| Method | Path       | Status               |
| ------ | ---------- | -------------------- |
| GET    | `/healthz` | implemented scaffold |

Missing MVP routes:

- `POST /api/v1/scan`
- `GET /api/v1/stats`
- `POST /api/v1/waitlist`
- OpenAPI artifact at `docs/openapi.json`

## Web Pages Existing

Detected under `apps/web/src/app`:

| Route | File                        | Status          |
| ----- | --------------------------- | --------------- |
| `/`   | `apps/web/src/app/page.tsx` | minimal landing |

Missing MVP pages/routes:

- `/scan/[address]`
- `/waitlist`
- `/learn/why-solana`
- `/stats`
- `/api/og/score`

Existing landing currently links the research note through the long filename. MVP should use the
stable public alias `/articles/research-note-1.pdf`.

## State Of `packages/scoring`

Current code exports:

```ts
export const SCORING_PACKAGE_STATUS = {
  implemented: false,
  packageName: "@quantalayer/scoring",
} as const;
```

Current tests assert that the package is intentionally not implemented before LOT-04. No QES/QCI
types, weights, validation, grade logic, recommendations, fixtures or golden tests exist yet.

## State Of `packages/solana`

Current code exports:

```ts
export const SOLANA_PACKAGE_STATUS = {
  implemented: false,
  packageName: "@quantalayer/solana",
} as const;
```

Current tests assert that the package is intentionally not implemented before LOT-05. No Solana
address validation, Helius client, Jupiter client, cache adapter, schemas, fixtures or read-only
scan mapper exist yet.

## Prisma / Database State

No Prisma schema or migration exists. No `Scan`, `WaitlistEntry` or `AggregateMetric` model exists.
The env contract already includes `DATABASE_URL`.

## Redis / Cache State

No Redis client or cache adapter exists. The env contract already includes:

- `REDIS_URL`
- `SCAN_CACHE_TTL_SECONDS`
- `RATE_LIMIT_SCANS_PER_MINUTE`

## i18n State

`apps/web/src/i18n/messages.ts` exists with FR and EN messages for the landing page only. The web
app must keep user-facing strings in the i18n layer as MVP pages/components are added.

## Tests State

Current test files:

- `apps/api/src/config.test.ts`
- `apps/api/src/server.test.ts`
- `apps/web/src/i18n/messages.test.ts`
- `packages/scoring/src/index.test.ts`
- `packages/shared/src/env.test.ts`
- `packages/shared/src/errors.test.ts`
- `packages/shared/src/index.test.ts`
- `packages/solana/src/index.test.ts`

Current tests validate scaffolding and shared foundations only. MVP behavior tests do not exist yet.

## CI State

`.github/workflows/ci.yml` runs:

1. `pnpm install --frozen-lockfile`
2. `pnpm lint`
3. `pnpm typecheck`
4. `pnpm test:coverage`
5. `pnpm build`

The dependency audit job runs `pnpm audit --prod` and is non-blocking. The current lockfile resolves
the prior PostCSS advisory through a root pnpm override.

## Legacy Name Residuals

Command run:

```bash
rg -n "Q-Shield|Q-Scan|Q-Vault|Q-Notary|qshield|Q Shield" . \
  --glob '!node_modules/**' \
  --glob '!.git/**' \
  --glob '!*.pdf' \
  --glob '!coverage/**' \
  --glob '!dist/**' \
  --glob '!.next/**'
```

Result: no matching legacy names in audited text files.

## Blocking Debt

1. `docs/cahier_des_charges_quantalayer.md` still contains exact forbidden-claim examples in its
   "Claims Interdits" section. LOT-3.5 should centralize exact banned wording in
   `docs/claims_matrix.md` and rephrase other docs to avoid banned-list test failures.
2. `packages/scoring` and `packages/solana` are placeholders.
3. API lacks scan/stats/waitlist routes, rate limiting, cache, data layer integration and DB
   persistence.
4. Web lacks scan results, waitlist, learn page, stats dashboard, OG route and e2e tests.
5. No Prisma schema/migration exists.
6. No load test, security MVP checklist, runbook or data retention documentation exists.

## Baseline Commands

### `pnpm install --frozen-lockfile`

Result: passed.

Summary:

```text
Lockfile is up to date, resolution step is skipped
Already up to date
Ignored build scripts: esbuild, sharp
Done using pnpm v10.12.1
```

### `pnpm lint`

Result: passed.

Summary:

```text
prettier --check . && eslint .
Checking formatting...
All matched files use Prettier code style!
```

### `pnpm typecheck`

Result: passed.

Summary:

```text
pnpm -r typecheck
Scope: 5 of 6 workspace projects
apps/web typecheck: Done
packages/scoring typecheck: Done
packages/shared typecheck: Done
packages/solana typecheck: Done
apps/api typecheck: Done
```

### `pnpm test`

Result: passed.

Summary:

```text
Test files: 8 passed
Tests: 24 passed
packages/scoring: 1 test passed
packages/solana: 1 test passed
packages/shared: 16 tests passed
apps/web: 2 tests passed
apps/api: 4 tests passed
```

### `pnpm test:coverage`

Result: passed.

Summary:

```text
packages/scoring coverage: 100% statements, 100% lines
packages/solana coverage: 100% statements, 100% lines
packages/shared coverage: 96.42% statements, 96.25% lines
apps/web coverage: 100% statements, 100% lines
apps/api coverage: 100% statements, 100% lines
```

Note: scoring coverage is currently high because the package contains only the scaffold constant.
LOT-04 must preserve >= 90% after real QES/QCI logic is implemented.

### `pnpm build`

Result: passed.

Summary:

```text
packages/scoring build: Done
packages/solana build: Done
packages/shared build: Done
apps/web build: Compiled successfully
apps/api build: Done
```

## Execution Plan By Lots

### LOT-3.5 — Normative Documentation

Acceptance criteria:

- Create `docs/claims_matrix.md`, `docs/threat_model_quantalayer_scan.md`,
  `docs/glossary_pqc.md`, and `docs/whitepaper_v0.1.md`.
- Add a banned-claims test that reads the machine list from `claims_matrix.md`.
- Rephrase exact forbidden claims outside the dedicated banned list.
- Keep Research Note PDF artifacts untouched.

### LOT-04 — Scoring Engine

Acceptance criteria:

- Implement pure QES/QCI library with versioned weights, validation, grading, recommendations,
  fixtures and golden tests.
- Reject invalid input and handle low QCI/PDA/empty accounts as specified.
- Create `docs/CHANGELOG-QES.md` and `packages/scoring/README.md`.
- Preserve scoring coverage >= 90%.

### LOT-05 — Solana Data Layer

Acceptance criteria:

- Implement address validation, read-only Helius/Jupiter clients, Zod schemas, bounded retry,
  cache adapters, fixture mapping and no-network CI tests.
- Add demo script documented but not run in CI.

### LOT-06 — API Scan And Stats

Acceptance criteria:

- Add `POST /api/v1/scan`, `GET /api/v1/stats`, fail-closed problem JSON responses, cache,
  rate limit, scoring/data layer integration and OpenAPI output.
- Persist only hashed address aggregates.

### LOT-07 — Database And Waitlist

Acceptance criteria:

- Add Prisma schema/migration, waitlist route, idempotent duplicate behavior, consent enforcement
  and `docs/data-retention.md`.

### LOT-08 — Web MVP

Acceptance criteria:

- Add scan result, waitlist, learn page and required components with FR default and EN messages.
- Add Playwright flows and banned-claims rendered-content checks.
- Update research-note links to the stable public alias.

### LOT-09 — OG Images And Dashboard

Acceptance criteria:

- Add score OG PNG route with truncated address and QCI-aware grade display.
- Add `/stats` dashboard based on anonymized aggregates.

### LOT-10 — Hardening And Beta Readiness

Acceptance criteria:

- Add security headers/CSP/CORS hardening, Sentry integration, audit report, k6 load-test script,
  load-test docs, security checklist and runbook.
