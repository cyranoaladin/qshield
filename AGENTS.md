# AGENTS.md — Q-Shield

> Instructions for AI coding agents (Codex CLI) working in this repository.
> Read this file entirely before writing any code. Read `SKILLS.md` for domain knowledge and `TASKS.md` for the current backlog. The product source of truth is `docs/cahier_des_charges_qshield.md`.

## 1. Project overview

Q-Shield is a post-quantum security suite on Solana, built in 3 phases:

- **P1 — Q-Scan**: a read-only web scanner that computes a "Quantum Exposure Score" (QES 0–100) for any Solana address. No custody, no private keys, ever.
- **P2 — Q-Vault**: a non-custodial vault program (Anchor/Rust) requiring Winternitz OTS (WOTS+) hash-based signatures to withdraw. Client-side key generation only.
- **P3 — Q-Notary**: dual-signature (Ed25519 + ML-DSA) document anchoring. B2B.

Current focus: **Phase 0 + Phase 1 (Q-Scan MVP)**. Do not implement P2/P3 code unless a task explicitly says so.

## 2. Repository layout (monorepo, pnpm workspaces)

```
qshield/
├── apps/
│   ├── web/          # Next.js 15 (App Router, TypeScript, Tailwind, shadcn/ui)
│   └── api/          # Fastify (Node 22, TypeScript) — REST API
├── packages/
│   ├── scoring/      # PURE TypeScript scoring engine — zero I/O, zero deps on web3
│   ├── solana/       # Data-fetch layer: Helius RPC/DAS, Jupiter prices (all I/O here)
│   └── shared/       # Zod schemas, types, constants shared across apps
├── programs/
│   └── qvault/       # Anchor program (P2 — placeholder only for now)
├── docs/             # Specs, ADRs, cahier des charges
├── AGENTS.md         # This file
├── SKILLS.md         # Domain knowledge for agents
└── TASKS.md          # Backlog (LOT structure)
```

Architectural invariant: **`packages/scoring` must remain a pure function library** (input JSON → output JSON). All network calls live in `packages/solana`. If a task tempts you to add I/O to `scoring`, stop and restructure.

## 3. Commands

```bash
pnpm install                 # install all workspaces
pnpm dev                     # run web + api concurrently
pnpm lint                    # eslint + prettier check (must pass)
pnpm typecheck               # tsc --noEmit on all packages (must pass)
pnpm test                    # vitest, all packages (must pass)
pnpm test:coverage           # coverage report — scoring package must stay ≥ 90%
pnpm build                   # build all apps
pnpm --filter @qshield/scoring test   # target one workspace
```

If a command is missing because the workspace is not yet scaffolded, scaffolding it correctly IS part of the task.

## 4. Definition of Done (every task, no exceptions)

A task is done only when ALL of the following are true:

1. `pnpm lint && pnpm typecheck && pnpm test` pass locally — paste the actual command output in your final report.
2. New logic has unit tests. The scoring engine keeps ≥ 90% line coverage.
3. Zod validation on every API input and every external data boundary (RPC responses included).
4. No secret, API key, or private key appears in code, tests, fixtures, or logs. Use `.env` + `env.ts` (Zod-validated) only.
5. `docs/` updated if behavior or architecture changed (ADR for structural decisions).
6. Conventional Commit message (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`), scoped, imperative.

**Fail-closed reporting rule:** never claim something works without showing the runtime output that proves it. If you could not run it, say so explicitly. A truthful "not verified" is acceptable; an unverified "it works" is a critical failure.

## 5. Coding conventions

- TypeScript `strict: true` everywhere. No `any` (use `unknown` + narrowing). No `@ts-ignore` without a comment justifying it.
- Node 22, ESM only (`"type": "module"`).
- Naming: `camelCase` functions/vars, `PascalCase` types, `SCREAMING_SNAKE` constants. Files: `kebab-case.ts`.
- Errors: never swallow. Use typed error classes in `packages/shared/errors.ts`; API returns RFC 7807 problem+json.
- All user-facing strings in `apps/web` go through the i18n layer (FR default, EN secondary). No hardcoded UI text.
- Comments and doc files may be in French; identifiers and commit messages in English.

## 6. Security guardrails (hard rules)

- **Read-only in P1.** The API never receives, stores, or requests private keys, seed phrases, or signatures for anything other than SIWS auth.
- Rate limiting on every public endpoint (Redis-backed). Default: 10 scans/min/IP.
- Never log full request bodies; log address + score only. No PII in logs.
- Dependencies: prefer well-known libs (`@noble/hashes`, `zod`, `@solana/web3.js`). Adding any new dependency requires a one-line justification in the PR description. Never add a crypto primitive implemented by an unknown author.
- No custom cryptography. Ever. NIST-standardized primitives via audited libraries only.
- Any code touching `programs/qvault` must be flagged `⚠ NEEDS HUMAN REVIEW` in the report — no autonomous merges on the Anchor program.

## 7. What NOT to do

- Do not implement the token ($QDAY or otherwise). Out of scope by decision (see cahier des charges §9.4).
- Do not add analytics/tracking beyond Plausible.
- Do not invent QES weights or thresholds — they are specified in `SKILLS.md §3` and versioned. Changing them requires a new `QES_VERSION` and a doc update.
- Do not fabricate fixture data that looks like real whale wallets; use clearly synthetic addresses in tests.
- Do not bypass failing tests by deleting or skipping them.

## 8. Environment

Copy `.env.example` → `.env`. Required variables are validated at boot by `packages/shared/env.ts`; the app must crash loudly on missing/invalid env (fail-closed), never run with defaults in production mode.

## 9. Task workflow for agents

1. Pick the lowest-numbered open item in `TASKS.md` unless instructed otherwise.
2. Restate the acceptance criteria in your plan before coding.
3. Small, reviewable commits. One LOT = one branch (`lot/XX-slug`) = one PR.
4. Final report format: **What was done / Commands run + output / Deviations from spec / Not verified / Suggested next step.**
