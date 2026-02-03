-- Versioned deterministic content + artifact caches + job audit

ALTER TABLE IF EXISTS content_translations RENAME TO content_translations_legacy;

CREATE TABLE IF NOT EXISTS microsections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('article','story','quiz','practice')),
  title text NOT NULL,
  order_index int NOT NULL,
  content_key text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key text NOT NULL,
  version int NOT NULL,
  canonical_locale text NOT NULL DEFAULT 'en',
  payload_json jsonb NOT NULL,
  payload_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(content_key, version)
);

CREATE INDEX IF NOT EXISTS content_versions_key_idx ON content_versions(content_key);

CREATE TABLE IF NOT EXISTS content_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key text NOT NULL,
  version int NOT NULL,
  locale text NOT NULL,
  translated_payload_json jsonb NOT NULL,
  translated_hash text NOT NULL,
  model text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(content_key, version, locale),
  FOREIGN KEY (content_key, version) REFERENCES content_versions(content_key, version) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS content_translations_key_idx ON content_translations(content_key, version, locale);

CREATE TABLE IF NOT EXISTS story_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key text NOT NULL,
  version int NOT NULL,
  locale text NOT NULL,
  plan_json jsonb NOT NULL,
  plan_hash text NOT NULL,
  model text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(content_key, version, locale),
  FOREIGN KEY (content_key, version) REFERENCES content_versions(content_key, version) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS story_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key text NOT NULL,
  version int NOT NULL,
  locale text NOT NULL,
  slide_index int NOT NULL,
  prompt text NOT NULL,
  prompt_hash text NOT NULL,
  caption text NOT NULL,
  caption_hash text NOT NULL,
  image_path text,
  image_mime text,
  image_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(content_key, version, locale, slide_index),
  FOREIGN KEY (content_key, version) REFERENCES content_versions(content_key, version) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS story_audio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key text NOT NULL,
  version int NOT NULL,
  locale text NOT NULL,
  slide_index int NOT NULL,
  voice_id text NOT NULL,
  tts_provider text NOT NULL,
  audio_path text,
  audio_mime text,
  audio_hash text,
  duration_ms int,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(content_key, version, locale, slide_index, voice_id),
  FOREIGN KEY (content_key, version) REFERENCES content_versions(content_key, version) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS braille_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key text NOT NULL,
  version int NOT NULL,
  locale text NOT NULL,
  scope text NOT NULL CHECK (scope IN ('microsection','chapter')),
  format text NOT NULL CHECK (format IN ('brf','full')),
  braille_text text NOT NULL,
  braille_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(content_key, version, locale, scope, format),
  FOREIGN KEY (content_key, version) REFERENCES content_versions(content_key, version) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type text NOT NULL,
  content_key text NOT NULL,
  version int NOT NULL,
  locale text,
  slide_index int,
  scope text,
  format text,
  status text NOT NULL CHECK (status IN ('queued','running','succeeded','failed')),
  idempotency_key text NOT NULL UNIQUE,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
