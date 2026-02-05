#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

export DATABASE_URL="${DATABASE_URL:-postgres://postgres:postgres@localhost:6543/gemini_hack}"
export FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"
export SESSION_SECRET="${SESSION_SECRET:-selftest-secret}"

export NODE_ENV=test
export TEST_AUTH_BYPASS=true

echo "[selftest] Starting infra (Postgres + MinIO)..."
docker compose -f "$ROOT_DIR/compose.yaml" up -d postgres minio minio-init

cleanup() {
  set +e
  if [[ -n "${API_PID:-}" ]]; then kill "$API_PID" 2>/dev/null || true; fi
  if [[ -n "${WEB_PID:-}" ]]; then kill "$WEB_PID" 2>/dev/null || true; fi
}
trap cleanup EXIT

echo "[selftest] Running DB migrations..."
(cd "$ROOT_DIR/api" && npm run migrate:db)

echo "[selftest] Seeding DB..."
(cd "$ROOT_DIR/api" && npm run seed)
(cd "$ROOT_DIR/api" && npm run seed:lessons)
(cd "$ROOT_DIR/api" && npm run seed:testuser)

echo "[selftest] API tests..."
(cd "$ROOT_DIR/api" && npm test)

echo "[selftest] Web unit tests..."
(cd "$ROOT_DIR/web" && npm test)

echo "[selftest] Web build..."
(cd "$ROOT_DIR/web" && npm run build)

echo "[selftest] Starting API server..."
(cd "$ROOT_DIR/api" && PORT=8000 WORKER_IN_PROCESS=true npm run start) &
API_PID=$!

echo "[selftest] Starting Web preview..."
(cd "$ROOT_DIR/web" && npm run preview -- --port 5173 --strictPort) &
WEB_PID=$!

echo "[selftest] Waiting for servers..."
for i in {1..60}; do
  if curl -fsS "http://localhost:8000/api/story/config/storage" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "[selftest] Running E2E..."
(cd "$ROOT_DIR/web" && E2E_API_BASE="http://localhost:8000" E2E_BASE_URL="http://localhost:5173" npm run e2e)

echo "[selftest] OK"

