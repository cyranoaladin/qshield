#!/usr/bin/env bash
set -uo pipefail

REPORT="docs/reports/staging_validation_run.md"
STARTED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
COMMIT="$(git rev-parse HEAD)"
BRANCH="$(git branch --show-current)"
NODE_VERSION="$(node --version 2>/dev/null || echo "missing")"
PNPM_VERSION="$(pnpm --version 2>/dev/null || echo "missing")"
FAILURES=0
SKIPS=0

mkdir -p "$(dirname "$REPORT")"

cat >"$REPORT" <<EOF
# QuantaLayer Staging Validation Run

Date: ${STARTED_AT}
Branch: \`${BRANCH}\`
Commit: \`${COMMIT}\`

## Tool Versions

- Node: \`${NODE_VERSION}\`
- pnpm: \`${PNPM_VERSION}\`

## Environment Presence

| Variable | Status |
| --- | --- |
EOF

for name in \
  DATABASE_URL \
  REDIS_URL \
  HELIUS_API_KEY \
  HELIUS_RPC_URL \
  SOLANA_CLUSTER \
  JUPITER_PRICE_URL \
  API_URL \
  STAGING_URL \
  SMOKE_SOLANA_ADDRESS \
  SMOKE_WAITLIST_EMAIL \
  SENTRY_DSN; do
  if [[ -n "${!name:-}" ]]; then
    echo "| \`${name}\` | present |" >>"$REPORT"
  else
    echo "| \`${name}\` | missing |" >>"$REPORT"
  fi
done

cat >>"$REPORT" <<EOF

## Commands

| Command | Status |
| --- | --- |
EOF

run_required() {
  local command="$1"
  echo "RUN: ${command}"

  if [[ "${command}" == "pnpm lint" ]]; then
    format_report
  fi

  if bash -lc "${command}"; then
    echo "| \`${command}\` | PASS |" >>"$REPORT"
  else
    echo "| \`${command}\` | FAIL |" >>"$REPORT"
    FAILURES=$((FAILURES + 1))
  fi
}

format_report() {
  pnpm exec prettier --write "$REPORT" >/dev/null 2>&1 || true
}

skip_command() {
  local command="$1"
  local reason="$2"
  echo "SKIPPED: ${command} because ${reason}"
  echo "| \`${command}\` | SKIPPED: ${reason} |" >>"$REPORT"
  SKIPS=$((SKIPS + 1))
}

api_is_running() {
  if [[ -z "${API_URL:-}" ]]; then
    return 1
  fi

  if command -v curl >/dev/null 2>&1; then
    curl -fsS "${API_URL%/}/healthz" >/dev/null 2>&1
    return $?
  fi

  node -e "fetch('${API_URL%/}/healthz').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
}

run_required "pnpm install --frozen-lockfile"
run_required "pnpm db:generate"
run_required "pnpm db:validate"
run_required "pnpm lint"
run_required "pnpm typecheck"
run_required "pnpm test"
run_required "pnpm test:coverage"
run_required "pnpm build"
run_required "pnpm --filter @quantalayer/web test:e2e"
run_required "pnpm audit --prod"

if [[ -n "${HELIUS_API_KEY:-}" && -n "${SMOKE_SOLANA_ADDRESS:-}" ]]; then
  run_required "pnpm smoke:providers"
else
  skip_command "pnpm smoke:providers" "HELIUS_API_KEY or SMOKE_SOLANA_ADDRESS is missing"
fi

if api_is_running; then
  run_required "pnpm smoke:api"
else
  skip_command "pnpm smoke:api" "API_URL is missing or API is not running"
fi

if [[ -n "${STAGING_URL:-}" ]]; then
  run_required "pnpm smoke:staging"
else
  skip_command "pnpm smoke:staging" "STAGING_URL is missing"
fi

if [[ "${FAILURES}" -gt 0 ]]; then
  FINAL_STATUS="FAIL"
elif [[ "${SKIPS}" -gt 0 ]]; then
  FINAL_STATUS="PASS_WITH_SKIPS"
else
  FINAL_STATUS="PASS"
fi

cat >>"$REPORT" <<EOF

## Final Status

${FINAL_STATUS}
EOF

format_report

echo "Validation status: ${FINAL_STATUS}"
echo "Report written to ${REPORT}"

if [[ "${FINAL_STATUS}" == "FAIL" ]]; then
  exit 1
fi
