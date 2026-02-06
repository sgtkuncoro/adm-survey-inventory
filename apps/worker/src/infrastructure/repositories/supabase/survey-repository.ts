import type { TypedSupabaseClient } from "@packages/supabase";
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
 * Supabase implementation of ISurveyRepository
 */
export class SupabaseSurveyRepository implements ISurveyRepository {
  constructor(private db: TypedSupabaseClient) {}

  async findAll(options?: { providerId?: string; isActive?: boolean; page?: number; limit?: number }): Promise<{
    surveys: ExternalSurvey[];
    total: number;
  }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;

    let query = this.db.from("external_surveys").select("*", { count: "exact" });

    if (options?.providerId) {
      query = query.eq("provider_id", options.providerId);
    }
    if (options?.isActive !== undefined) {
      query = query.eq("is_active", options.isActive);
    }

    const { data, error, count } = await query
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return {
      surveys: (data || []).map(this.mapToEntity),
      total: count ?? 0,
    };
  }

  async findById(id: string): Promise<ExternalSurvey | null> {
    const { data, error } = await this.db
      .from("external_surveys")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data ? this.mapToEntity(data) : null;
  }

  async findByExternalBidId(providerId: string, externalBidId: string): Promise<ExternalSurvey | null> {
    const { data, error } = await this.db
      .from("external_surveys")
      .select("*")
      .eq("provider_id", providerId)
      .eq("external_bid_id", externalBidId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data ? this.mapToEntity(data) : null;
  }

  async create(input: CreateSurveyInput): Promise<ExternalSurvey> {
    const { data, error } = await this.db
      .from("external_surveys")
      .insert({
        provider_id: input.providerId,
        external_bid_id: input.externalBidId,
        country: input.country ?? "US",
        cpi_cents: input.cpiCents,
        is_active: input.isActive ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapToEntity(data);
  }

  async update(id: string, input: UpdateSurveyInput): Promise<ExternalSurvey | null> {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (input.country !== undefined) updateData.country = input.country;
    if (input.cpiCents !== undefined) updateData.cpi_cents = input.cpiCents;
    if (input.isActive !== undefined) updateData.is_active = input.isActive;

    const { data, error } = await this.db
      .from("external_surveys")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data ? this.mapToEntity(data) : null;
  }

  async upsert(input: CreateSurveyInput): Promise<ExternalSurvey> {
    const { data, error } = await this.db
      .from("external_surveys")
      .upsert(
        {
          provider_id: input.providerId,
          external_bid_id: input.externalBidId,
          country: input.country ?? "US",
          cpi_cents: input.cpiCents,
          is_active: input.isActive ?? true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "provider_id,external_bid_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return this.mapToEntity(data);
  }

  async deactivateByExternalBidIds(providerId: string, externalBidIds: string[]): Promise<number> {
    const { data, error } = await this.db
      .from("external_surveys")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("provider_id", providerId)
      .in("external_bid_id", externalBidIds)
      .select();

    if (error) throw error;
    return data?.length ?? 0;
  }

  // Quotas
  async findQuotasBySurveyId(surveyId: string): Promise<SurveyQuota[]> {
    const { data, error } = await this.db
      .from("survey_quotas")
      .select("*")
      .eq("survey_id", surveyId);

    if (error) throw error;
    return (data || []).map(this.mapQuotaToEntity);
  }

  async createQuota(input: CreateQuotaInput): Promise<SurveyQuota> {
    const { data, error } = await this.db
      .from("survey_quotas")
      .insert({
        survey_id: input.surveyId,
        external_quota_id: input.externalQuotaId,
        cpi_cents: input.cpiCents,
        loi_minutes: input.loiMinutes,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapQuotaToEntity(data);
  }

  async upsertQuota(input: CreateQuotaInput): Promise<SurveyQuota> {
    const { data, error } = await this.db
      .from("survey_quotas")
      .upsert(
        {
          survey_id: input.surveyId,
          external_quota_id: input.externalQuotaId,
          cpi_cents: input.cpiCents,
          loi_minutes: input.loiMinutes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "survey_id,external_quota_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return this.mapQuotaToEntity(data);
  }

  // Qualifications
  async findQualificationsByQuotaId(quotaId: string): Promise<QuotaQualification[]> {
    const { data, error } = await this.db
      .from("quota_qualifications")
      .select("*")
      .eq("quota_id", quotaId);

    if (error) throw error;
    return (data || []).map(this.mapQualificationToEntity);
  }

  async upsertQualification(input: CreateQualificationInput): Promise<QuotaQualification> {
    const { data, error } = await this.db
      .from("quota_qualifications")
      .upsert(
        {
          quota_id: input.quotaId,
          question_id: input.questionId,
          answers: input.answers,
        },
        { onConflict: "quota_id,question_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return this.mapQualificationToEntity(data);
  }

  private mapToEntity(row: any): ExternalSurvey {
    return {
      id: row.id,
      providerId: row.provider_id,
      externalBidId: row.external_bid_id,
      country: row.country,
      cpiCents: row.cpi_cents,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapQuotaToEntity(row: any): SurveyQuota {
    return {
      id: row.id,
      surveyId: row.survey_id,
      externalQuotaId: row.external_quota_id,
      cpiCents: row.cpi_cents,
      loiMinutes: row.loi_minutes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapQualificationToEntity(row: any): QuotaQualification {
    return {
      id: row.id,
      quotaId: row.quota_id,
      questionId: row.question_id,
      answers: row.answers,
      createdAt: new Date(row.created_at),
    };
  }
}
