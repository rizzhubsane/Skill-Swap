import { pgTable, text, serial, integer, boolean, timestamp, json, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  location: text("location"),
  availability: text("availability"),
  skillsOffered: json("skills_offered").$type<string[]>().default([]),
  skillsWanted: json("skills_wanted").$type<string[]>().default([]),
  profilePhoto: text("profile_photo"),
  rating: real("rating").default(0),
  isPublic: boolean("is_public").default(true),
  isAdmin: boolean("is_admin").default(false),
  isBanned: boolean("is_banned").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const swapRequests = pgTable("swap_requests", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  offeredSkill: text("offered_skill").notNull(),
  requestedSkill: text("requested_skill").notNull(),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected, completed
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  swapId: integer("swap_id").notNull().references(() => swapRequests.id),
  reviewerId: integer("reviewer_id").notNull().references(() => users.id),
  revieweeId: integer("reviewee_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sentSwapRequests: many(swapRequests, { relationName: "sender" }),
  receivedSwapRequests: many(swapRequests, { relationName: "receiver" }),
  givenFeedback: many(feedback, { relationName: "reviewer" }),
  receivedFeedback: many(feedback, { relationName: "reviewee" }),
}));

export const swapRequestsRelations = relations(swapRequests, ({ one, many }) => ({
  sender: one(users, {
    fields: [swapRequests.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [swapRequests.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
  feedback: many(feedback),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  swapRequest: one(swapRequests, {
    fields: [feedback.swapId],
    references: [swapRequests.id],
  }),
  reviewer: one(users, {
    fields: [feedback.reviewerId],
    references: [users.id],
    relationName: "reviewer",
  }),
  reviewee: one(users, {
    fields: [feedback.revieweeId],
    references: [users.id],
    relationName: "reviewee",
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  rating: true,
  isAdmin: true,
  isBanned: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const insertSwapRequestSchema = createInsertSchema(swapRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

export const updateUserSchema = insertUserSchema.partial().omit({
  password: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type User = typeof users.$inferSelect;
export type SwapRequest = typeof swapRequests.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;
export type InsertSwapRequest = z.infer<typeof insertSwapRequestSchema>;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
