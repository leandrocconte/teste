import { pgTable, text, serial, integer, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  password: text("password").notNull(),
  verified: boolean("verified").default(false),
  reset_token: text("reset_token"),
  reset_token_expires: timestamp("reset_token_expires"),
  responses_available: integer("responses_available").default(20).notNull(),
  tier_id: integer("tier_id").default(4).notNull(),
}, (table) => {
  return {
    emailIdx: uniqueIndex("email_idx").on(table.email),
  };
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  reset_token: true,
  reset_token_expires: true,
  tier_id: true
});

// Lists of AI categories
export const lists = pgTable("lists", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image_url: text("image_url"),
  tag: text("tag"),
});

export const insertListSchema = createInsertSchema(lists).omit({
  id: true,
});

// Messages table to store chat history
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  lista_id: integer("lista_id").notNull(),
  content: text("content").notNull(),
  ai_response: text("ai_response"),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  ai_response: true,
  created_at: true,
});

// Subscription tiers
export const tiers = pgTable("tiers", {
  tier_id: serial("tier_id").primaryKey(),
  titulo: text("titulo").notNull(),
  responses_limit: integer("responses_limit").notNull(),
  valor: integer("valor").notNull(),
  link: text("link").notNull(),
  check1: text("check1").default("sim"),
  check2: text("check2").default("sim"),
  check3: text("check3").default("não"),
});

export const insertTierSchema = createInsertSchema(tiers).omit({
  tier_id: true,
});

// Checklist for subscription plans
export const checklistPlanos = pgTable("checklist_planos", {
  id: serial("id").primaryKey(),
  descricao: text("descricao").notNull(),
});

export const insertChecklistSchema = createInsertSchema(checklistPlanos).omit({
  id: true,
});

// Partners for discount section
export const parceiros = pgTable("parceiros", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  discount: text("discount").notNull(),
  valid_until: text("valid_until"),
  image_url: text("image_url"),
  link: text("link").notNull(),
  ativo: boolean("ativo").default(true),
});

export const insertParceiroSchema = createInsertSchema(parceiros).omit({
  id: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type List = typeof lists.$inferSelect;
export type InsertList = z.infer<typeof insertListSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Tier = typeof tiers.$inferSelect;
export type InsertTier = z.infer<typeof insertTierSchema>;

export type ChecklistPlano = typeof checklistPlanos.$inferSelect;
export type InsertChecklistPlano = z.infer<typeof insertChecklistSchema>;

export type Parceiro = typeof parceiros.$inferSelect;
export type InsertParceiro = z.infer<typeof insertParceiroSchema>;
