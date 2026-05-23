import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const historyTable = pgTable("translation_history", {
  id: serial("id").primaryKey(),
  originalText: text("original_text").notNull(),
  translatedText: text("translated_text").notNull(),
  sourceLanguage: text("source_language").notNull(),
  targetLanguage: text("target_language").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertHistorySchema = createInsertSchema(historyTable).omit({ id: true, createdAt: true });
export type InsertHistory = z.infer<typeof insertHistorySchema>;
export type History = typeof historyTable.$inferSelect;
