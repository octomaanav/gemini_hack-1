-- LearnHub v3 derived artifacts + voice audit events

CREATE TABLE IF NOT EXISTS derived_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_type text NOT NULL CHECK (scope_type IN ('MICROSECTION','LESSON','CHAPTER')),
  scope_id text NOT NULL,
  content_version int NOT NULL,
  locale text NOT NULL,
  artifact_type text NOT NULL CHECK (artifact_type IN ('BRAILLE_PREVIEW','BRAILLE_BRF','STORY_PLAN','STORY_SLIDES','STORY_AUDIO')),
  variant_id text,
  cache_key text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('PENDING','READY','FAILED')),
  s3_bucket text,
  s3_key text,
  mime_type text,
  size_bytes int,
  meta_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_json jsonb,
  created_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS derived_artifacts_lookup_idx
  ON derived_artifacts(scope_type, scope_id, content_version, locale, artifact_type, variant_id);

CREATE INDEX IF NOT EXISTS derived_artifacts_status_idx
  ON derived_artifacts(status);

CREATE TABLE IF NOT EXISTS voice_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  session_id text,
  transcript text NOT NULL,
  intent text,
  action text,
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS voice_events_user_idx
  ON voice_events(user_id, created_at DESC);

