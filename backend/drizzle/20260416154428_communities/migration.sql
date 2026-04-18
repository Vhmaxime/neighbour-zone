CREATE TYPE "community_member_role" AS ENUM('admin', 'member');--> statement-breakpoint
CREATE TABLE "communities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL UNIQUE,
	"description" text,
	"creator_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_members" (
	"community_id" uuid,
	"user_id" uuid,
	"role" "community_member_role" DEFAULT 'member'::"community_member_role" NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "community_members_pkey" PRIMARY KEY("community_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "community_id" uuid;--> statement-breakpoint
ALTER TABLE "marketplace_items" ADD COLUMN "community_id" uuid;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "community_id" uuid;--> statement-breakpoint
ALTER TABLE "communities" ADD CONSTRAINT "communities_creator_id_users_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_community_id_communities_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;