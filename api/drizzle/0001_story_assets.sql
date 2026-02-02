CREATE TABLE "story_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"story_key" text NOT NULL,
	"class_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"chapter_slug" text NOT NULL,
	"section_slug" text NOT NULL,
	"microsection_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"render_type" text DEFAULT 'slides' NOT NULL,
	"slides" jsonb NOT NULL,
	"video_url" text,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "story_assets_story_key_unique" UNIQUE("story_key")
);
