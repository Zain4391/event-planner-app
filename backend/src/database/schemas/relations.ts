import { relations } from "drizzle-orm/relations";
import { orders, orderItems, ticketTiers, payments, events, categories, tickets } from "./schema";

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
	ticketTier: one(ticketTiers, {
		fields: [orderItems.ticketTierId],
		references: [ticketTiers.id]
	}),
}));

export const ordersRelations = relations(orders, ({many}) => ({
	orderItems: many(orderItems),
	payments: many(payments),
	tickets: many(tickets),
}));

export const ticketTiersRelations = relations(ticketTiers, ({one, many}) => ({
	orderItems: many(orderItems),
	event: one(events, {
		fields: [ticketTiers.eventId],
		references: [events.id]
	}),
	tickets: many(tickets),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	order: one(orders, {
		fields: [payments.orderId],
		references: [orders.id]
	}),
}));

export const eventsRelations = relations(events, ({one, many}) => ({
	ticketTiers: many(ticketTiers),
	category: one(categories, {
		fields: [events.categoryId],
		references: [categories.id]
	}),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	events: many(events),
}));

export const ticketsRelations = relations(tickets, ({one}) => ({
	order: one(orders, {
		fields: [tickets.orderId],
		references: [orders.id]
	}),
	ticketTier: one(ticketTiers, {
		fields: [tickets.ticketTierId],
		references: [ticketTiers.id]
	}),
}));