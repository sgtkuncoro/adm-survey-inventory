/**
 * Survey Domain Entities
 */

export interface ExternalSurvey {
  id: string;
  providerId: string;
  externalBidId: string;
  country: string;
  cpiCents: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SurveyQuota {
  id: string;
  surveyId: string;
  externalQuotaId: string;
  cpiCents: number;
  loiMinutes: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuotaQualification {
  id: string;
  quotaId: string;
  questionId: string;
  answers: string[];
  createdAt: Date;
}

export interface CreateSurveyInput {
  providerId: string;
  externalBidId: string;
  country?: string;
  cpiCents: number;
  isActive?: boolean;
}

export interface UpdateSurveyInput {
  country?: string;
  cpiCents?: number;
  isActive?: boolean;
}

export interface CreateQuotaInput {
  surveyId: string;
  externalQuotaId: string;
  cpiCents: number;
  loiMinutes?: number;
}

export interface CreateQualificationInput {
  quotaId: string;
  questionId: string;
  answers: string[];
}
