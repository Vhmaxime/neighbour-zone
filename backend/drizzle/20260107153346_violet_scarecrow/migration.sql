ALTER TABLE "event_attendance" DROP CONSTRAINT "event_attendance_user_id_event_id_unique";--> statement-breakpoint
ALTER TABLE "event_likes" DROP CONSTRAINT "event_likes_user_id_event_id_unique";--> statement-breakpoint
ALTER TABLE "post_likes" DROP CONSTRAINT "post_likes_user_id_post_id_unique";--> statement-breakpoint
ALTER TABLE "event_attendance" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "event_likes" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "post_likes" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "event_attendance" ADD PRIMARY KEY ("user_id","event_id");--> statement-breakpoint
ALTER TABLE "event_likes" ADD PRIMARY KEY ("user_id","event_id");--> statement-breakpoint
ALTER TABLE "post_likes" ADD PRIMARY KEY ("user_id","post_id");--> statement-breakpoint
ALTER TABLE "marketplace_applications" ADD CONSTRAINT "marketplace_applications_user_id_marketplace_item_id_unique" UNIQUE("user_id","marketplace_item_id");