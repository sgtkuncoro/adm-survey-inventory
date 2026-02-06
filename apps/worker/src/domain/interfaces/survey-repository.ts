import type {
  ExternalSurvey,
  SurveyQuota,
  QuotaQualification,
  CreateSurveyInput,
  UpdateSurveyInput,
  CreateQuotaInput,
  CreateQualificationInput,
} from "../entities/survey";

/**
 * Survey Repository Interface
 */
export interface ISurveyRepository {
  // Surveys
  findAll(options?: { providerId?: string; isActive?: boolean; page?: number; limit?: number }): Promise<{
    surveys: ExternalSurvey[];
    total: number;
  }>;
  findById(id: string): Promise<ExternalSurvey | null>;
  findByExternalBidId(providerId: string, externalBidId: string): Promise<ExternalSurvey | null>;
  create(input: CreateSurveyInput): Promise<ExternalSurvey>;
  update(id: string, input: UpdateSurveyInput): Promise<ExternalSurvey | null>;
  upsert(input: CreateSurveyInput): Promise<ExternalSurvey>;
  deactivateByExternalBidIds(providerId: string, externalBidIds: string[]): Promise<number>;

  // Quotas
  findQuotasBySurveyId(surveyId: string): Promise<SurveyQuota[]>;
  createQuota(input: CreateQuotaInput): Promise<SurveyQuota>;
  upsertQuota(input: CreateQuotaInput): Promise<SurveyQuota>;

  // Qualifications
  findQualificationsByQuotaId(quotaId: string): Promise<QuotaQualification[]>;
  upsertQualification(input: CreateQualificationInput): Promise<QuotaQualification>;
}
