import { pgTable, foreignKey, uuid, integer, numeric, index, unique, check, varchar, boolean, timestamp, jsonb, text, time } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const orderItems = pgTable("order_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id"),
	ticketTierId: uuid("ticket_tier_id"),
	quantity: integer().notNull(),
	unitPrice: numeric("unit_price", { precision: 10, scale:  2 }).notNull(),
	totalPrice: numeric("total_price", { precision: 10, scale:  2 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_items_order_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.ticketTierId],
			foreignColumns: [ticketTiers.id],
			name: "order_items_ticket_tier_id_fkey"
		}),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	firstName: varchar("first_name", { length: 100 }).notNull(),
	lastName: varchar("last_name", { length: 100 }).notNull(),
	role: varchar({ length: 20 }).default('Customer').notNull(),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	passwordHash: varchar("password_hash", { length: 255 }).notNull(),
}, (table) => [
	index("idx_users_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("idx_users_role").using("btree", table.role.asc().nullsLast().op("text_ops")),
	unique("users_email_key").on(table.email),
	check("users_role_check", sql`(role)::text = ANY (ARRAY[('Admin'::character varying)::text, ('Organizer'::character varying)::text, ('Customer'::character varying)::text])`),
]);

export const payments = pgTable("payments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	paymentGateway: varchar("payment_gateway", { length: 50 }).notNull(),
	gatewayTransactionId: varchar("gateway_transaction_id", { length: 255 }),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	status: varchar({ length: 20 }).default('Pending'),
	gatewayResponse: jsonb("gateway_response"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_payments_order").using("btree", table.orderId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "payments_order_id_fkey"
		}),
	check("payments_status_check", sql`(status)::text = ANY (ARRAY[('Pending'::character varying)::text, ('Completed'::character varying)::text, ('Failed'::character varying)::text, ('Refunded'::character varying)::text])`),
]);

export const ticketTiers = pgTable("ticket_tiers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	eventId: uuid("event_id"),
	tierName: varchar("tier_name", { length: 100 }).notNull(),
	description: text(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	quantity: integer().notNull(),
	availableQuantity: integer("available_quantity").notNull(),
	saleStartDate: timestamp("sale_start_date", { mode: 'string' }),
	saleEndDate: timestamp("sale_end_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_ticket_tiers_event").using("btree", table.eventId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [events.id],
			name: "ticket_tiers_event_id_fkey"
		}).onDelete("cascade"),
	check("check_available_quantity", sql`available_quantity >= 0`),
]);

export const categories = pgTable("categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("categories_name_key").on(table.name),
]);

export const events = pgTable("events", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	categoryId: uuid("category_id"),
	organizerId: uuid("organizer_id").notNull(),
	venueName: varchar("venue_name", { length: 255 }).notNull(),
	venueAddress: text("venue_address").notNull(),
	eventDate: timestamp("event_date", { mode: 'string' }).notNull(),
	startTime: time("start_time").notNull(),
	endTime: time("end_time").notNull(),
	totalCapacity: integer("total_capacity").notNull(),
	availableCapacity: integer("available_capacity").notNull(),
	status: varchar({ length: 20 }).default('Draft'),
	bannerImageUrl: text("banner_image_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_events_category").using("btree", table.categoryId.asc().nullsLast().op("uuid_ops")),
	index("idx_events_date").using("btree", table.eventDate.asc().nullsLast().op("timestamp_ops")),
	index("idx_events_organizer").using("btree", table.organizerId.asc().nullsLast().op("uuid_ops")),
	index("idx_events_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "events_category_id_fkey"
		}),
	check("check_available_capacity", sql`available_capacity >= 0`),
	check("events_status_check", sql`(status)::text = ANY (ARRAY[('Draft'::character varying)::text, ('Published'::character varying)::text, ('Cancelled'::character varying)::text, ('Completed'::character varying)::text])`),
]);

export const orders = pgTable("orders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	totalAmount: numeric("total_amount", { precision: 10, scale:  2 }).notNull(),
	status: varchar({ length: 20 }).default('Pending'),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_orders_user").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	check("orders_status_check", sql`(status)::text = ANY (ARRAY[('Pending'::character varying)::text, ('Confirmed'::character varying)::text, ('Cancelled'::character varying)::text, ('Expired'::character varying)::text])`),
]);

export const tickets = pgTable("tickets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	ticketNumber: varchar("ticket_number", { length: 50 }).notNull(),
	orderId: uuid("order_id").notNull(),
	ticketTierId: uuid("ticket_tier_id").notNull(),
	userId: uuid("user_id").notNull(),
	status: varchar({ length: 20 }).default('Active'),
	qrCode: text("qr_code"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_tickets_user").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "tickets_order_id_fkey"
		}),
	foreignKey({
			columns: [table.ticketTierId],
			foreignColumns: [ticketTiers.id],
			name: "tickets_ticket_tier_id_fkey"
		}),
	unique("tickets_ticket_number_key").on(table.ticketNumber),
	check("tickets_status_check", sql`(status)::text = ANY (ARRAY[('Active'::character varying)::text, ('Used'::character varying)::text, ('Cancelled'::character varying)::text, ('Refunded'::character varying)::text])`),
]);
