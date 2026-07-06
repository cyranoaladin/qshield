# QuantaLayer Scan Load Test

## Tooling

The MVP load test uses k6:

```bash
API_URL=http://localhost:3001 pnpm loadtest:scan
```

The script is `scripts/loadtest-scan.js`.

## Scenarios

- `cache_hit`: 10 concurrent virtual users for 30 seconds against a shared address.
- `cache_miss`: 50 concurrent virtual users for 30 seconds against a rotating list of public Solana addresses.

## Metrics To Record

- p50, p95 and p99 latency.
- HTTP error rate.
- 400, 429 and 502 rates.
- Redis hit rate where available.
- API process CPU and memory.
- Provider error counts.

## Expected MVP Thresholds

- `http_req_failed < 1%`.
- `p95 < 1500 ms` in local/provider-mocked environments.
- No API crash.
- No raw scanned address in logs.

## Current Verification Status

The script is committed and ready to run. A full 10/50 concurrent-user run requires a running API, Redis and provider configuration. Results must be attached to the beta-readiness review before public beta.
