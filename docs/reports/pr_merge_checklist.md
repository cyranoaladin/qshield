# PR Merge Checklist — staging readiness

## Required before merge

- [ ] Reviewer confirms no Research Note PDF changes.
- [ ] Reviewer confirms no Vault/Notary/Authority Exposure product code.
- [ ] Reviewer confirms `docs/reports/staging_validation_run.md` commit traceability.
- [ ] Reviewer confirms public beta remains blocked.
- [ ] Reviewer confirms staging deployment docs are sufficient.
- [ ] Reviewer confirms `docker compose up -d postgres redis` path is documented.
- [ ] Reviewer confirms live smokes are not falsely marked as passed.

## Gates

- [ ] Branch is based on `hardening/staging-readiness`
- [ ] No Research Note PDF changes
- [ ] No Vault/Notary/Authority Exposure product code
- [ ] No forbidden legacy names
- [ ] pnpm lint pass
- [ ] pnpm typecheck pass
- [ ] pnpm test pass
- [ ] pnpm test:coverage pass
- [ ] pnpm build pass
- [ ] web e2e pass
- [ ] audit prod pass
- [ ] Docker Postgres/Redis migration pass or explicitly skipped
- [ ] smoke providers pass or explicitly skipped
- [ ] smoke api pass or explicitly skipped
- [ ] smoke staging pass or explicitly skipped
- [ ] k6 pass or explicitly skipped
- [ ] public beta remains blocked
