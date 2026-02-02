CREATE TABLE "story_audio_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"story_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"slides" jsonb NOT NULL,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "story_audio_assets_story_id_locale_unique" UNIQUE("story_id","locale")
);

ALTER TABLE "story_audio_assets" ADD CONSTRAINT "story_audio_assets_story_id_story_assets_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."story_assets"("id") ON DELETE cascade ON UPDATE no action;
