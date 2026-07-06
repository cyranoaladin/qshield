# @quantalayer/scoring

Pure QES/QCI scoring engine for QuantaLayer Scan.

## Invariants

- No network, filesystem, Solana RPC or database I/O.
- Input JSON in, result JSON out.
- QES version: `1.1.0`.
- QCI version: `1.0.1`.
- QCI below 40 disables grade display.
- QCI is capped when QES factors are unavailable: 79 for one missing factor, 69 for two,
  and 59 for three or more.
- PDA/off-curve account classes are marked not applicable for wallet-grade scoring.

## Public API

```ts
import { calculateQes, calculateQci } from "@quantalayer/scoring";
```

`calculateQes(input)` validates the input, computes QCI, applies QCI display rules, and returns a
QES result with warnings and recommendations. Invalid input throws `ValidationError` from
`@quantalayer/shared`.

## Value Model

`estimatedMigrationExposureValueUsd` is the observable asset value to migrate. It is not financial
VaR and does not represent compromise probability.
