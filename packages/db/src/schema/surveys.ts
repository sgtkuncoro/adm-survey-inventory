import { pgTable, text, serial, timestamp, boolean, uuid, integer, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const surveyProviders = pgTable("survey_providers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  apiBaseUrl: text("api_base_url").notNull(),
  credentials: text("credentials").notNull(), // Encrypted
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const externalSurveys = pgTable("external_surveys", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id").references(() => surveyProviders.id).notNull(),
  externalBidId: text("external_bid_id").notNull(), 
  name: text("name").notNull(),
  country: text("country").notNull(),
  topic: text("topic"),
  surveyUrlBase: text("survey_url_base"),
  lengthOfInterview: integer("length_of_interview_seconds"),
  publishedAt: timestamp("published_at"),
  expiresAt: timestamp("expires_at"),
  incidenceRate: integer("incidence_rate"), // Percentage 0-100
  isActive: boolean("is_active").default(true).notNull(),
  rawJson: jsonb("raw_json"), // Store full response
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSyncedAt: timestamp("last_synced_at"),
});

export const surveyQuotas = pgTable("survey_quotas", {
  id: uuid("id").primaryKey().defaultRandom(),
  externalSurveyId: uuid("external_survey_id").references(() => externalSurveys.id).notNull(),
  externalQuotaId: text("external_quota_id").notNull(),
  cpiCents: integer("cpi_cents").notNull(),
  completesRequired: integer("completes_required").notNull(),
  completesCurrent: integer("completes_current").default(0).notNull(),
  isOpen: boolean("is_open").default(true).notNull(),
  rawJson: jsonb("raw_json"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const quotaQualifications = pgTable("quota_qualifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyQuotaId: uuid("survey_quota_id").references(() => surveyQuotas.id).notNull(),
  qualificationType: text("qualification_type").notNull(), // "age", "gender"
  qualificationValues: jsonb("qualification_values").notNull(), // Array of accepted IDs
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const surveyRelations = relations(externalSurveys, ({ one, many }) => ({
  provider: one(surveyProviders, {
    fields: [externalSurveys.providerId],
    references: [surveyProviders.id],
  }),
  quotas: many(surveyQuotas),
}));

export const quotaRelations = relations(surveyQuotas, ({ one, many }) => ({
  survey: one(externalSurveys, {
    fields: [surveyQuotas.externalSurveyId],
    references: [externalSurveys.id],
  }),
  qualifications: many(quotaQualifications),
}));

export const qualificationRelations = relations(quotaQualifications, ({ one }) => ({
  quota: one(surveyQuotas, {
    fields: [quotaQualifications.surveyQuotaId],
    references: [surveyQuotas.id],
  }),
}));
