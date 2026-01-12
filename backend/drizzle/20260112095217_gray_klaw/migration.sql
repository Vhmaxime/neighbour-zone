ALTER TABLE "users" RENAME COLUMN "name" TO "firstname";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "lastname" text NOT NULL;