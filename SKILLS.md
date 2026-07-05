# SKILLS.md — Domain knowledge for coding agents

> Factual reference. If code contradicts this file, the code is wrong or this file must be updated via PR — never silently diverge.

## 1. Solana fundamentals relevant to QuantaLayer

- A Solana address **is** the Ed25519 public key itself (base58). Unlike Bitcoin, there is no hash indirection: every account's public key is exposed on-chain from creation. This is the core narrative of the product and must be stated accurately (exposed ≠ compromised today).
- Ed25519 is breakable by Shor's algorithm on a cryptographically relevant quantum computer. Hash functions (SHA-256, Keccak) are only weakened (Grover, quadratic), which is why hash-based signatures (WOTS+, SPHINCS+) are considered post-quantum-resistant designs.
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

## 3. QES/QCI scoring specification (v1.1) — normative

`QES_VERSION = "1.1.0"`. Output integer 0–100. Higher means higher migration criticality, not a higher probability of hacking.

QES weighted factors:

| Factor key                 | Weight | Computation guidance                                                  |
| -------------------------- | ------ | --------------------------------------------------------------------- |
| `observableAssetValue`     | 0.35   | log-scale observable value to migrate, capped and clamped             |
| `stakedOrLockedAssets`     | 0.20   | staked/locked value share; 0 if no observable value                   |
| `concentration`            | 0.15   | concentration if observable; single-address scan can use a v1 default |
| `observableAge`            | 0.10   | first indexed activity/signature/appearance, not guaranteed creation  |
| `significantTokenAccounts` | 0.10   | active significant token accounts, dust/spam filtered                 |
| `recentActivity`           | 0.10   | dormant accounts are operationally harder to migrate                  |

- `qes = round(100 × Σ weight_i × factor_i)`
- If a factor is not observable, renormalize only over observable weights and lower QCI.
- Grades: A ≤ 20 < B ≤ 40 < C ≤ 60 < D ≤ 80 < E. Do not display any grade if QCI < 40.
- `estimated_migration_exposure_value_usd = totalUsd` (all of it — the honest model).
- Use `estimatedMigrationExposureValueUsd` in TypeScript/JSON APIs.
- Edge cases (must have unit tests): empty account → QES computed normally (low), never an error; off-curve address → `grade: "N/A"` + explanatory flag; QCI < 40 → no grade; RPC partial failure → error response, never a partial score (fail-closed).
- Weights are constants in `packages/scoring/src/weights.ts`, exported with `QES_VERSION`. Any change = version bump + entry in `docs/CHANGELOG-QES.md`.

`QCI_VERSION = "1.0.0"`. Output integer 0–100.

| Dimension            | Weight | Method                              |
| -------------------- | ------ | ----------------------------------- |
| `resolvedPrices`     | 0.30   | share of value with reliable prices |
| `rpcDasCompleteness` | 0.20   | complete pagination, valid schemas  |
| `defiPositions`      | 0.15   | LP/lending/perps decoded            |
| `nftCnftCoverage`    | 0.10   | indexing + valuation                |
| `stakeAccounts`      | 0.10   | amounts and authorities             |
| `dataFreshness`      | 0.10   | cache age / TTL                     |
| `accountClassified`  | 0.05   | system, PDA, multisig, program      |

QCI display rules:

| QCI   | User display                      |
| ----- | --------------------------------- |
| ≥ 80  | QES displayed normally            |
| 60–79 | QES displayed with warning        |
| 40–59 | QES displayed as fragile estimate |
| < 40  | no grade; insufficient data       |

Token-account scoring must ignore or down-weight spam tokens, apply a minimum value threshold, distinguish active token accounts from received dust, and lower QCI when pollution prevents a reliable read.

## 4. Post-quantum cryptography (P2/P3 background)

- WOTS/WOTS+ (Winternitz One-Time Signatures): hash-based, **one-time use** — signing twice with the same key leaks it. Product consequence: every vault open must rotate to a fresh vault or otherwise avoid key reuse. Reference implementation: Solana Winternitz Vault (Dean Little / Blueshift, open source) — study it before writing any Vault code.
- NIST standards vocabulary (use exact names in docs/UI): ML-KEM (FIPS 203, ex-Kyber), ML-DSA (FIPS 204, ex-Dilithium), SLH-DSA (FIPS 205, ex-SPHINCS+).
- FIPS 206 / FN-DSA / Falcon is not final until a primary NIST source says otherwise. Falcon is attractive for Solana because signatures are compact, but implementation risk and side-channel risk must be stated.
- Never claim "quantum-proof". Approved wording: "post-quantum readiness", "quantum-resistant design", "conçu pour résister aux attaques quantiques connues".

## 5. Editorial & compliance rules baked into the product

- Every threat claim on the pedagogy page must carry a source (NIST, ANSSI, peer-reviewed paper). No unsourced FUD.
- Never display fabricated user counts or fabricated TVL. Aggregate stats must come from the `scans` table.
- French is the default locale; English secondary. Currency display: USD with `Intl.NumberFormat`.
- RGPD: waitlist emails are opt-in, deletable via a signed link; scanned addresses are public data but are stored hashed (SHA-256) in aggregate tables.

## 6. Testing patterns

- Scoring engine: table-driven tests (`test.each`) covering each QES/QCI factor boundary + composed golden cases stored in `packages/scoring/fixtures/*.json`.
- `packages/solana`: mock RPC at the fetch layer with recorded JSON fixtures (synthetic addresses only, e.g. `QuantaLayerTest...`); never hit mainnet in CI.
- API: integration tests with Fastify `inject()`, Redis via `ioredis-mock`.
- e2e (Playwright): scan happy path, invalid address, rate-limit response, OG image endpoint returns 200 + `image/png`.
