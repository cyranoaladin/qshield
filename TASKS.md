# TASKS.md — Backlog Q-Shield (Phase 0 → Phase 1)

> One LOT = one branch (`lot/XX-slug`) = one PR. Work LOTs in order unless instructed otherwise.
> Status legend: `[ ]` open · `[~]` in progress · `[x]` done (with PR link).

## Phase 0 — Fondations

### [x] LOT-01 — Monorepo scaffold

Scaffold pnpm workspaces per AGENTS.md §2: `apps/web` (Next.js 15 + TS + Tailwind + shadcn/ui), `apps/api` (Fastify + TS ESM), `packages/{scoring,solana,shared}`, `programs/qvault` (empty placeholder + README). Root scripts: `dev`, `lint`, `typecheck`, `test`, `build`. ESLint flat config + Prettier shared.
**Acceptance:** `pnpm install && pnpm lint && pnpm typecheck && pnpm build` pass on a clean clone; `pnpm dev` serves web on :3000 and api `/healthz` on :3001.

### [x] LOT-02 — Shared foundations

`packages/shared`: Zod env validation (`env.ts`, fail-closed boot), typed error classes, RFC 7807 serializer, constants. `.env.example` kept in sync.
**Acceptance:** api crashes with explicit message on missing env; unit tests for env parsing and error serialization.

### [ ] LOT-03 — CI/CD

GitHub Actions: install → lint → typecheck → test (with coverage gate ≥ 90% on `@qshield/scoring` once it exists) → build. Dependency audit job (`pnpm audit --prod`, non-blocking report). Branch protection notes in `docs/ci.md`.
**Acceptance:** green pipeline on a no-op PR; failing test blocks merge.

## Phase 1 — Q-Scan MVP

### [ ] LOT-04 — Scoring engine v1

Implement QES per SKILLS.md §3 in `packages/scoring` (pure, zero I/O). Input/output schemas in `shared`. Golden fixtures + table-driven tests incl. all edge cases (empty account, off-curve, cap boundaries).
**Acceptance:** coverage ≥ 90%; `QES_VERSION` exported; `docs/CHANGELOG-QES.md` created.

### [ ] LOT-05 — Solana data layer

`packages/solana`: Helius client (balance, DAS assets w/ pagination + `showFungible`, stake accounts), Jupiter batched prices, Zod-parsed responses, `UpstreamDataError` fail-closed, in-memory + Redis cache adapters. Recorded fixtures, no network in CI.
**Acceptance:** unit tests on fixtures; a `pnpm --filter @qshield/solana demo <address>` script prints a raw ScanInput JSON against devnet/mainnet when env is set (manual check, documented output pasted in PR).

### [ ] LOT-06 — API `/scan`

Fastify route `POST /api/v1/scan` → validate address (base58, on/off-curve detection) → Redis cache (TTL 1 h) → data layer → scoring → persist aggregate row (Postgres/Prisma, address hashed) → JSON response per cahier des charges §3.2. Rate limit 10/min/IP. `GET /api/v1/stats` for global dashboard aggregates.
**Acceptance:** integration tests (happy, invalid address, rate-limited, upstream failure → 502 problem+json); OpenAPI spec generated at `docs/openapi.json`.

### [ ] LOT-07 — Web MVP

Landing (FR/EN), scan form + wallet-adapter connect (read-only), result page: QES gauge, grade, value-at-risk, breakdown bars, recommendations. Waitlist form (email, double opt-in). Pedagogy page sourced per SKILLS.md §5.
**Acceptance:** Playwright e2e green; Lighthouse perf ≥ 90 mobile on landing; zero hardcoded UI strings outside i18n files.

### [ ] LOT-08 — OG share images + global dashboard

`@vercel/og` edge route generating the score badge (brand tokens in `apps/web/theme`); public dashboard page fed by `/stats` (total scanned, avg QES, total value scanned).
**Acceptance:** e2e asserts `image/png` + correct score rendering snapshot; dashboard shows live aggregates from seeded DB.

### [ ] LOT-09 — Hardening & beta

Sentry, structured logs (pino, no PII), Plausible, security headers/CSP, k6 load test script (100 rps scan on cached path), `docs/runbook.md` (deploy VPS + Vercel).
**Acceptance:** k6 report committed; runbook validated by a clean staging deploy.

## Parking lot (do NOT start without instruction)

- LOT-10 Premium PDF report + Solana Pay
- LOT-11 Monitoring webhooks + email alerts
- LOT-12 Public API keys (freemium)
- LOT-20+ Q-Vault (Anchor) — requires human pairing, see AGENTS.md §6
