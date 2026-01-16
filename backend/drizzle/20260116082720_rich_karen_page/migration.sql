CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"participant_1_id" uuid NOT NULL,
	"participant_2_id" uuid NOT NULL,
	"marketplace_item_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" RENAME COLUMN "receiver_id" TO "conversation_id";--> statement-breakpoint
ALTER TABLE "messages" RENAME CONSTRAINT "messages_receiver_id_users_id_fkey" TO "messages_conversation_id_conversations_id_fkey";--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "conversation_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_participant_1_id_users_id_fkey" FOREIGN KEY ("participant_1_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_participant_2_id_users_id_fkey" FOREIGN KEY ("participant_2_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_marketplace_item_id_marketplace_items_id_fkey" FOREIGN KEY ("marketplace_item_id") REFERENCES "marketplace_items"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_conversation_id_conversations_id_fkey", ADD CONSTRAINT "messages_conversation_id_conversations_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE;