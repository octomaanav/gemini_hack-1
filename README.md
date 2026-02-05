# LearnHub (Gemini Hack Monorepo)

This repo contains:
- `api/`: Express + Drizzle (Postgres) + background worker (DB-backed job queue)
- `web/`: Vite + React frontend
- `compose.yaml`: Postgres + MinIO (S3-compatible) for local dev

## Quick Start (Local Dev)

1. Start infra:

```bash
docker compose -f compose.yaml up -d
```

2. API:

```bash
cd api
npm i
export DATABASE_URL="postgres://postgres:postgres@localhost:6543/gemini_hack"
npm run dev
```

3. Web:

```bash
cd web
npm i
npm run dev
```

## Worker

The worker is the `api/src/worker/index.ts` loop, using `generation_jobs` for queued tasks.

By default, the API runs the worker loop in-process.
- Disable with `WORKER_IN_PROCESS=false`.

## Flagship Features (v3)

### F1: Braille-Native Learning Pipeline v3
- API:
  - `POST /api/artifacts/braille/preview`
  - `POST /api/artifacts/braille/export`
  - `GET /api/artifacts/:id`
- Outputs are cached by deterministic `cache_key`:
  - `lh:v3:{artifactType}:{scopeType}:{scopeId}:v{version}:{locale}:{variantIdOr0}`

### F2: Story Mode as a Compiler (deterministic + variants)
- API:
  - `POST /api/story/compile`
  - `POST /api/story/regenerate`
  - `GET /api/story/variants?lessonId=...&locale=...`
- Assets are generated via worker jobs and stored as derived artifacts.

### F3: Voice-First Learning OS
- API:
  - `POST /api/voice/command`
- Frontend:
  - Command palette: `Cmd/Ctrl+K`
  - Voice OS mic: floating mic button (speech-to-command)

## Environment Variables

Required:
- `DATABASE_URL`

Optional (enables real AI generation):
- `GEMINI_API_KEY` (image + story plan + TTS; fallback mode is used when missing)

Storage:
- Default is local file storage under `api/storage/` via `MEDIA_STORAGE_PROVIDER=local`.
- S3/MinIO uploads for derived artifacts are supported via `MEDIA_STORAGE_PROVIDER=s3` and:
  - `S3_ENDPOINT` (default `http://localhost:9000`)
  - `S3_REGION` (default `us-east-1`)
  - `S3_ACCESS_KEY` / `S3_SECRET_KEY` (default `minioadmin`)
  - `S3_BUCKET` (default `lesson-media`)

## Self-Test

Runs DB migrations, seeds, unit + integration tests, then a minimal Playwright E2E flow:

```bash
npm run selftest
```

Notes:
- E2E uses `NODE_ENV=test` and a test-only auth bypass via `x-test-user-email`.
- Ensure you installed dependencies in `api/` and `web/` first.

