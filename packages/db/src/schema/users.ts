import { pgTable, uuid, text, date, numeric, timestamp, jsonb, unique, integer } from "drizzle-orm/pg-core";
import { surveyProviders } from "./providers";

/**
 * Users - Basic user profile information
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // Should match auth.users.id
  email: text("email"),
  dateOfBirth: date("date_of_birth"),
  gender: text("gender"), // M, F, O
  walletBalance: numeric("wallet_balance", { precision: 10, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Survey Sessions - User survey attempt tracking
 */
export const surveySessions = pgTable("survey_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  providerId: uuid("provider_id").notNull().references(() => surveyProviders.id, { onDelete: "cascade" }),
  bidId: text("bid_id").notNull(),
  quotaId: text("quota_id"),
  cpiAtClick: integer("cpi_at_click").notNull(),
  expectedPayout: integer("expected_payout").notNull(),
  actualPayout: integer("actual_payout"),
  status: text("status").notNull().default("pending"),
  statusDetail: text("status_detail"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

/**
 * User Survey Eligibility - Cached eligibility data per user/provider
 */
export const userSurveyEligibility = pgTable("user_survey_eligibility", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  providerId: uuid("provider_id").notNull().references(() => surveyProviders.id, { onDelete: "cascade" }),
  eligibleBids: jsonb("eligible_bids").notNull().default([]),
  bestBid: jsonb("best_bid"),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userProviderUnique: unique().on(table.userId, table.providerId),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type SurveySession = typeof surveySessions.$inferSelect;
export type NewSurveySession = typeof surveySessions.$inferInsert;
export type UserSurveyEligibility = typeof userSurveyEligibility.$inferSelect;
export type NewUserSurveyEligibility = typeof userSurveyEligibility.$inferInsert;
