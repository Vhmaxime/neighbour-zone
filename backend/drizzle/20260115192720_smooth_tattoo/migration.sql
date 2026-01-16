ALTER TABLE "marketplace_items" RENAME COLUMN "location" TO "place_display_name";--> statement-breakpoint
ALTER TABLE "marketplace_items" ADD COLUMN "place_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "marketplace_items" ADD COLUMN "lat" text NOT NULL;--> statement-breakpoint
ALTER TABLE "marketplace_items" ADD COLUMN "lon" text NOT NULL;