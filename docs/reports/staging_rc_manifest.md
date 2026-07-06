# QuantaLayer Staging RC Manifest

RC branch: `rc/staging-validation-pack`

Validated commit: `6cb104f48163ab1d8be131a4e3f44293c8c1271c`

Report commit: `c1f268680d2727cb875ac01c426f616fdb97d873`

Validation status: PASS_WITH_SKIPS

Public beta status: blocked

## Traceability

The full validation script ran on commit `6cb104f48163ab1d8be131a4e3f44293c8c1271c`.
The validation report was then committed in documentation-only commit
`c1f268680d2727cb875ac01c426f616fdb97d873`.

This manifest is committed after the validation report to record the immutable traceability pair.
No application source files, Research Note PDF artifacts or future-module product code were changed
after validation.

## Live Validation Status

- Provider smoke: not executed locally; requires live Helius/Jupiter credentials.
- API smoke: not executed locally; requires running API and `API_URL`.
- Staging smoke: not executed locally; requires deployed staging and `STAGING_URL`.
- k6: not executed locally; requires `k6` on the validation host.

Public beta remains blocked until the live validation gates in
`docs/reports/live_staging_validation_protocol.md` pass and are reviewed.
