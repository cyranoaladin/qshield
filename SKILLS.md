# SKILLS.md — Domain knowledge for coding agents

> Factual reference. If code contradicts this file, the code is wrong or this file must be updated via PR — never silently diverge.

## 1. Solana fundamentals relevant to Q-Shield

- A Solana address **is** the Ed25519 public key itself (base58). Unlike Bitcoin, there is no hash indirection: every account's public key is exposed on-chain from creation. This is the core narrative of the product and must be stated accurately (exposed ≠ compromised today).
- Ed25519 is breakable by Shor's algorithm on a cryptographically relevant quantum computer. Hash functions (SHA-256, Keccak) are only weakened (Grover, quadratic), which is why hash-based signatures (WOTS+, SPHINCS+) are considered post-quantum safe.
- Account types the scanner must handle:
  - System accounts (native SOL balance).
  - SPL token accounts (owner = Token Program / Token-2022). Use Helius DAS `getAssetsByOwner` / `searchAssets` rather than raw `getTokenAccountsByOwner` when NFTs/cNFTs are involved.
  - Stake accounts: `getProgramAccounts` on `Stake11111111111111111111111111111111111111`, filter by withdrawer/staker authority. Locked stake increases migration difficulty → raises QES.
  - PDAs are off-curve (no private key): if the scanned address is off-curve, flag it — quantum risk model differs (attack targets the owning program's upgrade authority instead).
- Prices: Jupiter Price API v2 (`https://api.jup.ag/price/v2?ids=...`). Cache 60 s. Never call per-token in a loop; batch.
- RPC: Helius. Budget-conscious: batch requests, cache scan results 1 h in Redis keyed by address, exponential backoff on 429.

## 2. Helius specifics

- DAS `getAssetsByOwner` paginates (limit 1000); always iterate pages.
- `showFungible: true` option returns fungible tokens with balances in the same call — prefer it to reduce RPC count.
- Webhooks (v1.1 monitoring): address-activity webhooks; verify the auth header on receipt.
- Treat every RPC response as untrusted input: parse through Zod schemas in `packages/solana/schemas/`; on parse failure, throw `UpstreamDataError` (fail-closed), never guess.

## 3. QES scoring specification (v1) — normative

`QES_VERSION = "1.0.0"`. Output integer 0–100 (higher = more exposed). Weighted factors:

| Factor key      | Weight | Computation (normalized 0–1 before weighting)                    |
| --------------- | ------ | ---------------------------------------------------------------- |
| `value`         | 0.35   | log10(totalUsd+1) / log10(10_000_001), clamp 0–1 (caps at 10 M$) |
| `staked`        | 0.20   | stakedUsd / totalUsd (0 if totalUsd = 0)                         |
| `concentration` | 0.15   | 1 if single-address scan (v1 constant); multi-wallet in v1.1     |
| `age`           | 0.10   | min(accountAgeDays / 1825, 1) (5 years cap)                      |
| `tokens`        | 0.10   | min(activeTokenAccounts / 50, 1)                                 |
| `activity`      | 0.10   | 1 − min(txLast90d / 30, 1) (dormant = riskier)                   |

- `qes = round(100 × Σ weight_i × factor_i)`
- Grades: A ≤ 20 < B ≤ 40 < C ≤ 60 < D ≤ 80 < F.
- `value_at_risk_usd = totalUsd` (all of it — the honest model).
- Edge cases (must have unit tests): empty account → QES computed normally (low), never an error; off-curve address → `grade: "N/A"` + explanatory flag; RPC partial failure → error response, never a partial score (fail-closed).
- Weights are constants in `packages/scoring/src/weights.ts`, exported with `QES_VERSION`. Any change = version bump + entry in `docs/CHANGELOG-QES.md`.

## 4. Post-quantum cryptography (P2/P3 background)

- WOTS+ (Winternitz One-Time Signatures): hash-based, **one-time use** — signing twice with the same key leaks it. Product consequence: every vault open must rotate to a fresh vault. Reference implementation: Solana Winternitz Vault (Dean Little / Zeus Network, 2025, open source) — study `programs/` there before writing any P2 code.
- NIST standards vocabulary (use exact names in docs/UI): ML-KEM (FIPS 203, ex-Kyber), ML-DSA (FIPS 204, ex-Dilithium), SLH-DSA (FIPS 205, ex-SPHINCS+).
- Never claim "quantum-proof". Approved wording: "quantum-resistant", "post-quantum", "conçu pour résister aux attaques quantiques connues".

## 5. Editorial & compliance rules baked into the product

- Every threat claim on the pedagogy page must carry a source (NIST, ANSSI, peer-reviewed paper). No unsourced FUD.
- Never display fabricated user counts or fabricated TVL. Aggregate stats must come from the `scans` table.
- French is the default locale; English secondary. Currency display: USD with `Intl.NumberFormat`.
- RGPD: waitlist emails are opt-in, deletable via a signed link; scanned addresses are public data but are stored hashed (SHA-256) in aggregate tables.

## 6. Testing patterns

- Scoring engine: table-driven tests (`test.each`) covering each factor boundary + composed golden cases stored in `packages/scoring/fixtures/*.json`.
- `packages/solana`: mock RPC at the fetch layer with recorded JSON fixtures (synthetic addresses only, e.g. `QSh1eldTest...`); never hit mainnet in CI.
- API: integration tests with Fastify `inject()`, Redis via `ioredis-mock`.
- e2e (Playwright): scan happy path, invalid address, rate-limit response, OG image endpoint returns 200 + `image/png`.
