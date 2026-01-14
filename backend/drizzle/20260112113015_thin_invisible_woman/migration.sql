ALTER TABLE "users" ADD COLUMN "phone_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_phone_number_key" UNIQUE("phone_number");