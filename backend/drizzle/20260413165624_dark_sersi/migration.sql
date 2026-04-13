CREATE TABLE "marketplace_saves" (
	"user_id" uuid,
	"marketplace_item_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "marketplace_saves_pkey" PRIMARY KEY("user_id","marketplace_item_id")
);
--> statement-breakpoint
ALTER TABLE "marketplace_saves" ADD CONSTRAINT "marketplace_saves_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "marketplace_saves" ADD CONSTRAINT "marketplace_saves_marketplace_item_id_marketplace_items_id_fkey" FOREIGN KEY ("marketplace_item_id") REFERENCES "marketplace_items"("id") ON DELETE CASCADE;