#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

HOST="127.0.0.1"
MOCK_API_PORT="${MOCK_API_PORT:-3001}"
WEB_PORT="${WEB_PORT:-3000}"
MOCK_API_URL="http://${HOST}:${MOCK_API_PORT}"
WEB_URL="http://${HOST}:${WEB_PORT}"
API_LOG="${TMPDIR:-/tmp}/quantalayer-mvp-mock-api-${MOCK_API_PORT}.log"
WEB_LOG="${TMPDIR:-/tmp}/quantalayer-mvp-web-${WEB_PORT}.log"

api_pid=""
web_pid=""

cleanup() {
  trap - EXIT INT TERM

  if [[ -n "${web_pid}" ]] && kill -0 "${web_pid}" 2>/dev/null; then
    kill "${web_pid}" 2>/dev/null || true
  fi

  if [[ -n "${api_pid}" ]] && kill -0 "${api_pid}" 2>/dev/null; then
    kill "${api_pid}" 2>/dev/null || true
  fi

  wait "${web_pid}" 2>/dev/null || true
  wait "${api_pid}" 2>/dev/null || true
}

wait_for_url() {
  local url="$1"
  local label="$2"

  for _ in $(seq 1 90); do
    if curl --silent --fail --output /dev/null "${url}"; then
      return 0
    fi

    sleep 1
  done

  echo "${label} did not become ready at ${url}" >&2
  echo "Mock API log: ${API_LOG}" >&2
  echo "Web log: ${WEB_LOG}" >&2
  return 1
}

trap cleanup EXIT INT TERM

MOCK_API_HOST="${HOST}" MOCK_API_PORT="${MOCK_API_PORT}" \
  pnpm exec tsx scripts/mock-mvp-api.ts >"${API_LOG}" 2>&1 &
api_pid="$!"

NEXT_PUBLIC_API_URL="${MOCK_API_URL}" \
  pnpm --filter @quantalayer/web exec next dev --hostname "${HOST}" --port "${WEB_PORT}" \
  >"${WEB_LOG}" 2>&1 &
web_pid="$!"

wait_for_url "${MOCK_API_URL}/healthz" "Mock API"
wait_for_url "${WEB_URL}" "Web"

cat <<EOF
QuantaLayer MVP local review is running.

Mock API:
${MOCK_API_URL}/healthz

Web:
${WEB_URL}

Pages:
${WEB_URL}
${WEB_URL}/scan/11111111111111111111111111111111
${WEB_URL}/scan/LowConfidence111111111111111111111111111
${WEB_URL}/scan/PdaPreview111111111111111111111111111111
${WEB_URL}/scan/ErrorPreview11111111111111111111111111111
${WEB_URL}/waitlist
${WEB_URL}/learn/why-solana
${WEB_URL}/stats

Logs:
Mock API log: ${API_LOG}
Web log: ${WEB_LOG}

Press Ctrl+C to stop both processes.
EOF

wait -n "${api_pid}" "${web_pid}"
