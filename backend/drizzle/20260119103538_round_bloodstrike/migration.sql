ALTER TABLE "events" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "marketplace_items" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "content" DROP NOT NULL;