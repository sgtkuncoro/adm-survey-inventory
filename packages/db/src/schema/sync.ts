import { pgTable, uuid, text, integer, timestamp, jsonb, unique } from "drizzle-orm/pg-core";
import { surveyProviders } from "./providers";

/**
 * Sync Job Logs - Track sync job execution history
 */
export const syncJobLogs = pgTable("sync_job_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id").references(() => surveyProviders.id, { onDelete: "set null" }),
  status: text("status").notNull(), // 'success', 'failed', 'running'
  message: text("message"),
  itemsProcessed: integer("items_processed").default(0),
  itemsModified: integer("items_modified").default(0),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Qualification Legend - Metadata for provider-specific questions
 */
export const qualificationLegend = pgTable("qualification_legend", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id").notNull().references(() => surveyProviders.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull(),
  questionText: text("question_text"),
  answerOptions: jsonb("answer_options"), // Map of value -> label
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  providerQuestionUnique: unique().on(table.providerId, table.questionId),
}));

export type SyncJobLog = typeof syncJobLogs.$inferSelect;
export type NewSyncJobLog = typeof syncJobLogs.$inferInsert;
export type QualificationLegend = typeof qualificationLegend.$inferSelect;
export type NewQualificationLegend = typeof qualificationLegend.$inferInsert;
