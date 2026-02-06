import { eq, and, desc, inArray } from "drizzle-orm";
import type { Database } from "@packages/db";
import { externalSurveys, surveyQuotas, quotaQualifications } from "@packages/db";
import type { ISurveyRepository } from "../../../domain/interfaces/survey-repository";
import type {
  ExternalSurvey,
  SurveyQuota,
  QuotaQualification,
  CreateSurveyInput,
  UpdateSurveyInput,
  CreateQuotaInput,
  CreateQualificationInput,
} from "../../../domain/entities/survey";

/**
 * Drizzle implementation of ISurveyRepository
 */
export class DrizzleSurveyRepository implements ISurveyRepository {
  constructor(private db: Database) {}

  async findAll(options?: { providerId?: string; isActive?: boolean; page?: number; limit?: number }): Promise<{
    surveys: ExternalSurvey[];
    total: number;
  }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    if (options?.providerId) {
      whereConditions.push(eq(externalSurveys.providerId, options.providerId));
    }
    if (options?.isActive !== undefined) {
      whereConditions.push(eq(externalSurveys.isActive, options.isActive));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const results = await this.db
      .select()
      .from(externalSurveys)
      .where(whereClause)
      .orderBy(desc(externalSurveys.updatedAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const countResult = await this.db
      .select()
      .from(externalSurveys)
      .where(whereClause);

    return {
      surveys: results.map(this.mapToEntity),
      total: countResult.length,
    };
  }

  async findById(id: string): Promise<ExternalSurvey | null> {
    const results = await this.db
      .select()
      .from(externalSurveys)
      .where(eq(externalSurveys.id, id))
      .limit(1);

    return results[0] ? this.mapToEntity(results[0]) : null;
  }

  async findByExternalBidId(providerId: string, externalBidId: string): Promise<ExternalSurvey | null> {
    const results = await this.db
      .select()
      .from(externalSurveys)
      .where(and(
        eq(externalSurveys.providerId, providerId),
        eq(externalSurveys.externalBidId, externalBidId)
      ))
      .limit(1);

    return results[0] ? this.mapToEntity(results[0]) : null;
  }

  async create(input: CreateSurveyInput): Promise<ExternalSurvey> {
    const results = await this.db
      .insert(externalSurveys)
      .values({
        providerId: input.providerId,
        externalBidId: input.externalBidId,
        country: input.country ?? "US",
        cpiCents: input.cpiCents,
        isActive: input.isActive ?? true,
      })
      .returning();

    return this.mapToEntity(results[0]);
  }

  async update(id: string, input: UpdateSurveyInput): Promise<ExternalSurvey | null> {
    const updateData: Partial<typeof externalSurveys.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (input.country !== undefined) updateData.country = input.country;
    if (input.cpiCents !== undefined) updateData.cpiCents = input.cpiCents;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    const results = await this.db
      .update(externalSurveys)
      .set(updateData)
      .where(eq(externalSurveys.id, id))
      .returning();

    return results[0] ? this.mapToEntity(results[0]) : null;
  }

  async upsert(input: CreateSurveyInput): Promise<ExternalSurvey> {
    const results = await this.db
      .insert(externalSurveys)
      .values({
        providerId: input.providerId,
        externalBidId: input.externalBidId,
        country: input.country ?? "US",
        cpiCents: input.cpiCents,
        isActive: input.isActive ?? true,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [externalSurveys.providerId, externalSurveys.externalBidId],
        set: {
          country: input.country ?? "US",
          cpiCents: input.cpiCents,
          isActive: input.isActive ?? true,
          updatedAt: new Date(),
        },
      })
      .returning();

    return this.mapToEntity(results[0]);
  }

  async deactivateByExternalBidIds(providerId: string, externalBidIds: string[]): Promise<number> {
    const results = await this.db
      .update(externalSurveys)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(
        eq(externalSurveys.providerId, providerId),
        inArray(externalSurveys.externalBidId, externalBidIds)
      ))
      .returning();

    return results.length;
  }

  // Quotas
  async findQuotasBySurveyId(surveyId: string): Promise<SurveyQuota[]> {
    const results = await this.db
      .select()
      .from(surveyQuotas)
      .where(eq(surveyQuotas.surveyId, surveyId));

    return results.map(this.mapQuotaToEntity);
  }

  async createQuota(input: CreateQuotaInput): Promise<SurveyQuota> {
    const results = await this.db
      .insert(surveyQuotas)
      .values({
        surveyId: input.surveyId,
        externalQuotaId: input.externalQuotaId,
        cpiCents: input.cpiCents,
        loiMinutes: input.loiMinutes,
      })
      .returning();

    return this.mapQuotaToEntity(results[0]);
  }

  async upsertQuota(input: CreateQuotaInput): Promise<SurveyQuota> {
    const results = await this.db
      .insert(surveyQuotas)
      .values({
        surveyId: input.surveyId,
        externalQuotaId: input.externalQuotaId,
        cpiCents: input.cpiCents,
        loiMinutes: input.loiMinutes,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [surveyQuotas.surveyId, surveyQuotas.externalQuotaId],
        set: {
          cpiCents: input.cpiCents,
          loiMinutes: input.loiMinutes,
          updatedAt: new Date(),
        },
      })
      .returning();

    return this.mapQuotaToEntity(results[0]);
  }

  // Qualifications
  async findQualificationsByQuotaId(quotaId: string): Promise<QuotaQualification[]> {
    const results = await this.db
      .select()
      .from(quotaQualifications)
      .where(eq(quotaQualifications.quotaId, quotaId));

    return results.map(this.mapQualificationToEntity);
  }

  async upsertQualification(input: CreateQualificationInput): Promise<QuotaQualification> {
    const results = await this.db
      .insert(quotaQualifications)
      .values({
        quotaId: input.quotaId,
        questionId: input.questionId,
        answers: input.answers,
      })
      .onConflictDoUpdate({
        target: [quotaQualifications.quotaId, quotaQualifications.questionId],
        set: {
          answers: input.answers,
        },
      })
      .returning();

    return this.mapQualificationToEntity(results[0]);
  }

  private mapToEntity(row: typeof externalSurveys.$inferSelect): ExternalSurvey {
    return {
      id: row.id,
      providerId: row.providerId,
      externalBidId: row.externalBidId,
      country: row.country,
      cpiCents: row.cpiCents,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapQuotaToEntity(row: typeof surveyQuotas.$inferSelect): SurveyQuota {
    return {
      id: row.id,
      surveyId: row.surveyId,
      externalQuotaId: row.externalQuotaId,
      cpiCents: row.cpiCents,
      loiMinutes: row.loiMinutes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapQualificationToEntity(row: typeof quotaQualifications.$inferSelect): QuotaQualification {
    return {
      id: row.id,
      quotaId: row.quotaId,
      questionId: row.questionId,
      answers: row.answers as string[],
      createdAt: row.createdAt,
    };
  }
}
