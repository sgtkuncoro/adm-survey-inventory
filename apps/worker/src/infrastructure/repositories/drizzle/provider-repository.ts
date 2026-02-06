import { eq, and } from "drizzle-orm";
import type { Database } from "@packages/db";
import { surveyProviders } from "@packages/db";
import type { IProviderRepository } from "../../../domain/interfaces/provider-repository";
import type { SurveyProvider, CreateProviderInput, UpdateProviderInput } from "../../../domain/entities/provider";

/**
 * Drizzle implementation of IProviderRepository
 */
export class DrizzleProviderRepository implements IProviderRepository {
  constructor(private db: Database) {}

  async findAll(): Promise<SurveyProvider[]> {
    const results = await this.db
      .select()
      .from(surveyProviders)
      .orderBy(surveyProviders.name);

    return results.map(this.mapToEntity);
  }

  async findActive(): Promise<SurveyProvider[]> {
    const results = await this.db
      .select()
      .from(surveyProviders)
      .where(eq(surveyProviders.isActive, true))
      .orderBy(surveyProviders.name);

    return results.map(this.mapToEntity);
  }

  async findById(id: string): Promise<SurveyProvider | null> {
    const results = await this.db
      .select()
      .from(surveyProviders)
      .where(eq(surveyProviders.id, id))
      .limit(1);

    return results[0] ? this.mapToEntity(results[0]) : null;
  }

  async findBySlug(slug: string): Promise<SurveyProvider | null> {
    const results = await this.db
      .select()
      .from(surveyProviders)
      .where(eq(surveyProviders.slug, slug))
      .limit(1);

    return results[0] ? this.mapToEntity(results[0]) : null;
  }

  async create(input: CreateProviderInput): Promise<SurveyProvider> {
    const results = await this.db
      .insert(surveyProviders)
      .values({
        name: input.name,
        slug: input.slug,
        apiBaseUrl: input.apiBaseUrl,
        credentials: input.credentials,
        supplierId: input.supplierId,
        prescreenerUrl: input.prescreenerUrl,
        minCpiCents: input.minCpiCents ?? 200,
        userPayoutPct: input.userPayoutPct ?? 50,
        eligibilityCacheTtl: input.eligibilityCacheTtl ?? 60,
        isActive: input.isActive ?? true,
      })
      .returning();

    return this.mapToEntity(results[0]);
  }

  async update(id: string, input: UpdateProviderInput): Promise<SurveyProvider | null> {
    const updateData: Partial<typeof surveyProviders.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.apiBaseUrl !== undefined) updateData.apiBaseUrl = input.apiBaseUrl;
    if (input.credentials !== undefined) updateData.credentials = input.credentials;
    if (input.supplierId !== undefined) updateData.supplierId = input.supplierId;
    if (input.prescreenerUrl !== undefined) updateData.prescreenerUrl = input.prescreenerUrl;
    if (input.privateKey !== undefined) updateData.privateKey = input.privateKey;
    if (input.publicKey !== undefined) updateData.publicKey = input.publicKey;
    if (input.minCpiCents !== undefined) updateData.minCpiCents = input.minCpiCents;
    if (input.userPayoutPct !== undefined) updateData.userPayoutPct = input.userPayoutPct;
    if (input.eligibilityCacheTtl !== undefined) updateData.eligibilityCacheTtl = input.eligibilityCacheTtl;
    if (input.redirectUrls !== undefined) updateData.redirectUrls = input.redirectUrls;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    const results = await this.db
      .update(surveyProviders)
      .set(updateData)
      .where(eq(surveyProviders.id, id))
      .returning();

    return results[0] ? this.mapToEntity(results[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const results = await this.db
      .delete(surveyProviders)
      .where(eq(surveyProviders.id, id))
      .returning();

    return results.length > 0;
  }

  private mapToEntity(row: typeof surveyProviders.$inferSelect): SurveyProvider {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      apiBaseUrl: row.apiBaseUrl,
      credentials: row.credentials,
      supplierId: row.supplierId,
      prescreenerUrl: row.prescreenerUrl,
      privateKey: row.privateKey,
      publicKey: row.publicKey,
      minCpiCents: row.minCpiCents,
      userPayoutPct: row.userPayoutPct,
      eligibilityCacheTtl: row.eligibilityCacheTtl,
      redirectUrls: row.redirectUrls as Record<string, string> | null,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
