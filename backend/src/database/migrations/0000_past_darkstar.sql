-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid,
	"ticket_tier_id" uuid,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"payment_gateway" varchar(50) NOT NULL,
	"gateway_transaction_id" varchar(255),
	"amount" numeric(10, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'Pending',
	"gateway_response" jsonb,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "payments_status_check" CHECK ((status)::text = ANY (ARRAY[('Pending'::character varying)::text, ('Completed'::character varying)::text, ('Failed'::character varying)::text, ('Refunded'::character varying)::text]))
);
--> statement-breakpoint
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ticket_tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid,
	"tier_name" varchar(100) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"quantity" integer NOT NULL,
	"available_quantity" integer NOT NULL,
	"sale_start_date" timestamp,
	"sale_end_date" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "check_available_quantity" CHECK (available_quantity >= 0)
);
--> statement-breakpoint
ALTER TABLE "ticket_tiers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"profile_image_url" text,
	"role" varchar(20) DEFAULT 'Customer' NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "users_clerk_user_id_key" UNIQUE("clerk_user_id"),
	CONSTRAINT "users_email_key" UNIQUE("email"),
	CONSTRAINT "users_role_check" CHECK ((role)::text = ANY (ARRAY[('Admin'::character varying)::text, ('Organizer'::character varying)::text, ('Customer'::character varying)::text]))
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "categories_name_key" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category_id" uuid,
	"organizer_id" uuid NOT NULL,
	"venue_name" varchar(255) NOT NULL,
	"venue_address" text NOT NULL,
	"event_date" timestamp NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"total_capacity" integer NOT NULL,
	"available_capacity" integer NOT NULL,
	"status" varchar(20) DEFAULT 'Draft',
	"banner_image_url" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "check_available_capacity" CHECK (available_capacity >= 0),
	CONSTRAINT "events_status_check" CHECK ((status)::text = ANY (ARRAY[('Draft'::character varying)::text, ('Published'::character varying)::text, ('Cancelled'::character varying)::text, ('Completed'::character varying)::text]))
);
--> statement-breakpoint
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'Pending',
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "orders_status_check" CHECK ((status)::text = ANY (ARRAY[('Pending'::character varying)::text, ('Confirmed'::character varying)::text, ('Cancelled'::character varying)::text, ('Expired'::character varying)::text]))
);
--> statement-breakpoint
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_number" varchar(50) NOT NULL,
	"order_id" uuid NOT NULL,
	"ticket_tier_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'Active',
	"qr_code" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "tickets_ticket_number_key" UNIQUE("ticket_number"),
	CONSTRAINT "tickets_status_check" CHECK ((status)::text = ANY (ARRAY[('Active'::character varying)::text, ('Used'::character varying)::text, ('Cancelled'::character varying)::text, ('Refunded'::character varying)::text]))
);
--> statement-breakpoint
ALTER TABLE "tickets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_ticket_tier_id_fkey" FOREIGN KEY ("ticket_tier_id") REFERENCES "public"."ticket_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_tiers" ADD CONSTRAINT "ticket_tiers_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_ticket_tier_id_fkey" FOREIGN KEY ("ticket_tier_id") REFERENCES "public"."ticket_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_payments_order" ON "payments" USING btree ("order_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_ticket_tiers_event" ON "ticket_tiers" USING btree ("event_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_users_clerk_id" ON "users" USING btree ("clerk_user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_users_role" ON "users" USING btree ("role" text_ops);--> statement-breakpoint
CREATE INDEX "idx_events_category" ON "events" USING btree ("category_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_events_date" ON "events" USING btree ("event_date" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_events_organizer" ON "events" USING btree ("organizer_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_events_status" ON "events" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_orders_user" ON "orders" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_tickets_user" ON "tickets" USING btree ("user_id" uuid_ops);
*/