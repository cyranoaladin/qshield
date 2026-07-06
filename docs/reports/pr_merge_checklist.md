# PR Merge Checklist — staging readiness

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
