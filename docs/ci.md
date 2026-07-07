# CI/CD

QuantaLayer uses GitHub Actions in `.github/workflows/ci.yml`.

## Pipeline

The blocking `Verify` job runs on every pull request and every push to `main`:

1. `pnpm install --frozen-lockfile`
2. `pnpm lint`
3. `pnpm typecheck` (runs `prisma generate` first)
4. `pnpm test:coverage`
5. `pnpm build` (runs `prisma generate` first)

The workflow uses Node.js 22, pnpm 10.12.1, pnpm store caching through
`actions/setup-node@v4`, and a concurrency group that cancels superseded runs for the same
workflow/ref.

## Coverage Gate

The coverage gate is enforced locally and in CI by `packages/scoring/vitest.config.ts`, not by
workflow-only logic. `@quantalayer/scoring` requires at least 90% for lines, statements, functions,
and branches whenever `pnpm --filter @quantalayer/scoring test:coverage` or root
`pnpm test:coverage` runs.

## Audit

The separate `Dependency Audit` job runs `pnpm audit --prod`. It is intentionally
non-blocking (`continue-on-error: true`) so security findings are visible without blocking
early Phase 0 scaffolding work.

## Branch Protection

Recommended settings for `main`:

- Require a pull request before merging.
- Require the `Verify` job to pass before merging.
- Require branches to be up to date before merging.
- Block direct pushes to `main`.
- Require conversation resolution before merging.
- Restrict bypass permissions to repository administrators only.
