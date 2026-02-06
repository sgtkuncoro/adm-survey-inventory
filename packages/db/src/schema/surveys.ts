import { pgTable, uuid, text, boolean, integer, timestamp, jsonb, unique } from "drizzle-orm/pg-core";
import { surveyProviders } from "./providers";

/**
 * External Surveys - Survey inventory from providers
 */
export const externalSurveys = pgTable("external_surveys", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id").notNull().references(() => surveyProviders.id, { onDelete: "cascade" }),
  externalBidId: text("external_bid_id").notNull(),
  country: text("country").notNull().default("US"),
  cpiCents: integer("cpi_cents").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  providerBidUnique: unique().on(table.providerId, table.externalBidId),
}));

/**
 * Survey Quotas - Quota details for each survey
 */
export const surveyQuotas = pgTable("survey_quotas", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").notNull().references(() => externalSurveys.id, { onDelete: "cascade" }),
  externalQuotaId: text("external_quota_id").notNull(),
  cpiCents: integer("cpi_cents").notNull(),
  loiMinutes: integer("loi_minutes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  surveyQuotaUnique: unique().on(table.surveyId, table.externalQuotaId),
}));

/**
 * Quota Qualifications - Targeting criteria for quotas
 */
export const quotaQualifications = pgTable("quota_qualifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  quotaId: uuid("quota_id").notNull().references(() => surveyQuotas.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull(),
  answers: jsonb("answers").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  quotaQuestionUnique: unique().on(table.quotaId, table.questionId),
}));

export type ExternalSurvey = typeof externalSurveys.$inferSelect;
export type NewExternalSurvey = typeof externalSurveys.$inferInsert;
export type SurveyQuota = typeof surveyQuotas.$inferSelect;
export type NewSurveyQuota = typeof surveyQuotas.$inferInsert;
export type QuotaQualification = typeof quotaQualifications.$inferSelect;
export type NewQuotaQualification = typeof quotaQualifications.$inferInsert;
