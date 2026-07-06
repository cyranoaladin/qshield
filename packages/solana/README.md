# @quantalayer/solana

Read-only Solana data boundary for QuantaLayer Scan.

## Responsibilities

- Validate Solana addresses and detect on-curve/off-curve status.
- Fetch public Helius RPC/DAS data.
- Fetch stake accounts for both staker and withdrawer authority filters and deduplicate by account
  pubkey.
- Fetch Jupiter prices in batches.
- Map provider data into `RawWalletScan`.
- Provide cache adapter interfaces for memory and Redis-like clients.

## Non-Responsibilities

- No scoring. Use `@quantalayer/scoring` after this package returns `RawWalletScan`.
- No database writes.
- No wallet connection.
- No private keys, seed phrases or transaction signatures.

## Manual Demo

The demo is not run in CI and requires a Helius API key:

```bash
HELIUS_API_KEY=... pnpm --filter @quantalayer/solana demo:scan -- 11111111111111111111111111111111
```

The command prints JSON and serializes lamports as strings where needed.

## Stake Account Coverage

`HeliusClient.getStakeAccountsByAuthority()` issues two `getProgramAccounts` queries against the
Stake Program: one for the staker authority offset (`12`) and one for the withdrawer authority
offset (`44`).
Results are deduplicated by stake account pubkey before `RawWalletScan` totals staked lamports.
Malformed or failed provider responses raise `UpstreamDataError`; the API must not publish a partial
score.

## Test Policy

Unit tests use synthetic fixtures and mocked fetch functions. They must not hit mainnet or devnet in
CI.
