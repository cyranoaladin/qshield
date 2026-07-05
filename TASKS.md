# TASKS.md — Backlog Q-Shield (Phase 0 → Phase 1)

> One LOT = one branch (`lot/XX-slug`) = one PR. Work LOTs in order unless instructed otherwise.
> Status legend: `[ ]` open · `[~]` in progress · `[x]` done (with commit/PR ref).
> Backlog version: **2.0** — consolidates external review input; LOT numbering is stable, never renumber.

## Phase 0 — Fondations

### [x] LOT-01 — Monorepo scaffold
Done — commit `e4957c9` on `lot/01-monorepo-scaffold`. pnpm workspaces, Next.js 15 web, Fastify api `/healthz`, placeholder packages, ESLint/Prettier/Vitest, strict TS.

### [x] LOT-02 — Shared foundations
Done — commit `951c45d` on `lot/02-shared-foundations`. Zod env validation (fail-closed, production vs development semantics, `assertScanProviderEnv`), typed errors + RFC 7807 serializer, shared constants, `docs/env.md`.
Debt paid in LOT-03 Part A: topological build order, warn-by-default `parseEnv`, server/web env schema split.

### [x] LOT-03 — CI/CD + LOT-02 debt
Done — commits `3fdf029` (Part A) + `9705294` (Part B) on `lot/03-ci`, merged into main. Part A: remove nested shared builds, `pnpm -r` topological for build/typecheck/test/coverage, default console warnings in `parseEnv` (tests inject silent handler), split `parseServerEnv` / `parseWebEnv` (API must boot without any `NEXT_PUBLIC_*`). Part B: coverage thresholds (90) enforced in `@qshield/scoring` vitest config, GitHub Actions workflow (PR + push main, frozen lockfile, pnpm cache, ordered gates, non-blocking audit job), `docs/ci.md` with branch-protection recommendations.
**Acceptance:** clean-state double `pnpm build` with no race; `env -i` boot proof without NEXT_PUBLIC_*; local simulation of exact CI sequence pasted in report.

### [ ] LOT-3.5 — Normative documentation pack
Create the editorial/security backbone that later LOTs are tested against:
- `docs/claims_matrix.md`: allowed claims, forbidden claims, recommended phrasings, banned phrasings (FR + EN). Must include the banned-words machine list in a fenced block parseable by tests: at minimum `quantum-proof`, `unhackable`, `100% secure`, `garanti inviolable`, `preuve quantique`. Every allowed sensitive claim carries a source (NIST FIPS 203/204/205, ANSSI, peer-reviewed) or `TODO: source required`.
- `docs/threat_model_qscan.md`: protected assets, threats, explicit NON-threats, assumptions, **abuse cases** (e.g., scanning third-party wallets for targeting, scraping the API to build whale lists, using scores for phishing pretexts) and mitigations for each.
- `docs/glossary_pqc.md`: Shor, Grover, Ed25519, ML-KEM, ML-DSA, SLH-DSA, WOTS+, PDA, crypto-agility, Q-Day, harvest-now-decrypt-later. Vulgarized FR definitions, reusable as marketing/pedagogy content.
- `docs/whitepaper_v0.1.md`: executive summary, problem, PQC context, Solana specificity (address = pubkey), Q-Scan, Q-Vault, Q-Notary, architecture, **explicit limitations section**, roadmap, risks. Factual tone, zero hype, every claim consistent with claims_matrix.
**Acceptance:** markdown lint clean; no banned phrasing anywhere in `docs/` except inside the claims_matrix "banned" section itself; whitepaper limitations section present and non-empty.

## Phase 1 — Q-Scan MVP

### [ ] LOT-04 — Scoring engine v1
Implement QES per SKILLS.md §3 in `packages/scoring` (pure, zero I/O, zero Solana deps). Split modules: `weights.ts` (versioned, `QES_VERSION`), `calculate-qes.ts`, `grade.ts`, `recommendations.ts`, `types.ts`. Input type uses `daysSinceLastActivity: number | null` (null = never active) — reconcile with SKILLS.md activity formula and update SKILLS.md in the same PR if the input contract changes.
**Mandatory invariant tests (in addition to SKILLS.md edge cases):**
- sum of weights === 1 (test the constant itself);
- sum of breakdown components === qes (rounding-safe);
- score clamped to [0, 100] under extreme inputs;
- negative monetary/count inputs rejected (ValidationError);
- concentrationRatio outside [0,1] rejected;
- `scannedAt` is valid ISO 8601;
- empty recent wallet → low score, never an error; off-curve flag → grade "N/A".
**Acceptance:** coverage ≥ 90% (enforced by vitest thresholds); golden fixtures; `docs/CHANGELOG-QES.md` created; short `packages/scoring/README.md`.

### [ ] LOT-05 — Solana data layer
`packages/solana`: `validate-address.ts` (base58 + on/off-curve detection), Helius client (balance, DAS assets w/ pagination + `showFungible`, stake accounts), Jupiter batched prices, Zod-parsed responses (`UpstreamDataError` fail-closed), configurable timeout, bounded retries (max 2, exponential backoff, never on 4xx), in-memory + Redis cache adapters. Output type `RawWalletScan` includes `source: { rpcProvider: "helius"; priceProvider: "jupiter" }` for provenance. No scoring, no DB, in this package.
**Acceptance:** unit tests on recorded fixtures (synthetic addresses only, no network in CI); address-validation test table; provider→RawWalletScan mapping tests; documented demo script against devnet (manual, output pasted in PR).

### [ ] LOT-06 — API `/scan`
Fastify `POST /api/v1/scan` → Zod validate address → Redis cache (TTL 1h, response includes `cache: { hit, ttlSeconds }`) → data layer → scoring → persist aggregate row (Prisma; store `addressHash` = SHA-256, never the raw address, plus qes, grade, valueAtRiskUsd, qesVersion) → JSON per cahier des charges §3.2. Rate limit per IP (Redis). `GET /api/v1/stats` for dashboard aggregates. Structured logs (pino): address + score only, never full bodies, never secrets. Fail-closed: any partial upstream data → 502 problem+json, never a partial score.
**Acceptance:** integration tests — invalid address, cache hit, cache miss, provider error → 502, scoring error → 500, rate-limited → 429; OpenAPI at `docs/openapi.json`.

### [ ] LOT-07 — Database & waitlist backend
Prisma schema: `Scan` (addressHash, qes, grade, valueAtRiskUsd, qesVersion, createdAt), `WaitlistEntry` (email unique, wallet optional, source, consent boolean required true, createdAt), `AggregateMetric`. Clean initial migration. `POST /api/v1/waitlist`: email validation, mandatory explicit consent, dedup (idempotent 200 on duplicate), sober success message. `docs/data-retention.md`: what is stored, why, RGPD deletion path.
**Acceptance:** migration applies on clean DB; waitlist tests — valid, invalid email, duplicate, missing consent → 400; no raw address stored anywhere (test asserts hash format).

### [ ] LOT-08 — Web MVP
Pages: landing, `scan/[address]`, waitlist, `learn/why-solana`. Components: AddressInput, QesGauge, ScoreBreakdown, RecommendationList, ShareBadge, WaitlistForm, RiskDisclaimer. UX rules: "lecture seule — nous ne demandons JAMAIS de seed phrase" visible on scan page; score limitations shown (link to learn page); mobile-first; institutional design (frontend-design tokens), not memecoin. i18n FR default / EN. Learn page sections: public keys, how Solana identifies accounts, user account vs PDA, what Shor threatens, what Q-Scan measures, **what Q-Scan does NOT measure**, why Q-Vault is experimental, sources — all conforming to claims_matrix.
**Acceptance:** Playwright e2e — scan happy path, invalid address, waitlist flow; **automated banned-words test**: a vitest/Playwright check parses the banned list from `docs/claims_matrix.md` and asserts zero occurrences in rendered pages and i18n message files; Lighthouse perf ≥ 90 mobile on landing; zero hardcoded UI strings outside i18n.

### [ ] LOT-09 — OG share images + global dashboard
`@vercel/og` edge route for the score badge. Privacy: address ALWAYS truncated `ABCD…WXYZ` (first 4 + last 4), never full. Content: Q-Shield logo, score, grade, "Post-Quantum Readiness Score" caption — factual tone, no alarmist wording (claims_matrix applies). Public `/stats` page fed by `GET /api/v1/stats`: total scans, total value scanned, average QES, grade distribution, last-scan timestamp. Anonymized aggregates only — no per-wallet data, no nominative leaderboard in MVP (whale leaderboard deferred, see parking lot).
**Acceptance:** e2e asserts `image/png`, truncated address, score rendering snapshot; stats page shows live aggregates from seeded DB; no endpoint returns a raw scanned address.

### [ ] LOT-10 — Hardening, load test & beta readiness
Sentry, security headers/CSP, strict CORS, `pnpm audit` report. Load test script (`pnpm loadtest:scan`, k6): 10 then 50 concurrent, cache-hit and cache-miss paths; report p50/p95 latency, error rate, Redis impact in `docs/loadtest_qscan.md`. `docs/security_mvp.md`: checklist (no secrets committed, all endpoints documented, no seed-phrase pattern in code — grep test). `docs/runbook.md`: deploy VPS + Vercel, rollback procedure.
**Acceptance:** load test report committed, zero API crash, degradation documented; runbook validated by clean staging deploy; security checklist all green.

## Parking lot (do NOT start without instruction)
- LOT-11 — Premium PDF report + Solana Pay
- LOT-12 — Monitoring webhooks + email alerts
- LOT-13 — Public API keys (freemium)
- LOT-14 — Grant Solana Foundation dossier (`docs/grant/`: application, milestones, budget, public_good_argument — reuse whitepaper + threat model; measurable milestones, sober budget)
- LOT-15 — Private beta program (BETA_MODE flag, feedback form, `/beta` page, `docs/beta_plan.md` with rollback procedure)
- LOT-16 — Anonymized whale-exposure leaderboard (requires legal/ethical review against threat model abuse cases first)
- LOT-20+ — Q-Vault (Anchor) — requires human pairing per AGENTS.md §6; devnet only until 2 audits; `programs/qvault/README.md` must document WOTS+ one-time-use constraint, split/refund, rotation, risks, and audit prerequisites before any code
