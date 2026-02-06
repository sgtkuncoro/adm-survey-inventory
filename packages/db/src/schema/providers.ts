import { pgTable, uuid, text, boolean, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

/**
 * Survey Providers - External survey API providers (e.g., Morning Consult)
 */
export const surveyProviders = pgTable("survey_providers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  apiBaseUrl: text("api_base_url"),
  credentials: text("credentials"),
  supplierId: text("supplier_id"),
  prescreenerUrl: text("prescreener_url"),
  privateKey: text("private_key"),
  publicKey: text("public_key"),
  minCpiCents: integer("min_cpi_cents").notNull().default(200),
  userPayoutPct: integer("user_payout_pct").notNull().default(50),
  eligibilityCacheTtl: integer("eligibility_cache_ttl").notNull().default(60),
  redirectUrls: jsonb("redirect_urls"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SurveyProvider = typeof surveyProviders.$inferSelect;
export type NewSurveyProvider = typeof surveyProviders.$inferInsert;
