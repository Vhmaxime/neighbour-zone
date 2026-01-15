ALTER TABLE "events" RENAME COLUMN "location" TO "place_display_name";--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "place_id" integer NOT NULL;