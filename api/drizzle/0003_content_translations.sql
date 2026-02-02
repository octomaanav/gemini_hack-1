CREATE TABLE IF NOT EXISTS "content_translations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "content_key" text NOT NULL,
  "content_type" text NOT NULL,
  "locale" text NOT NULL,
  "payload" jsonb NOT NULL,
  "status" text NOT NULL DEFAULT 'ready',
  "error" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "content_translations_content_key_content_type_locale_unique" UNIQUE ("content_key", "content_type", "locale")
);
