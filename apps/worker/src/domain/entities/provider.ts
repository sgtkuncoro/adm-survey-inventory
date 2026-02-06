/**
 * SurveyProvider Domain Entity
 * Represents an external survey provider (e.g., Morning Consult)
 */
export interface SurveyProvider {
  id: string;
  name: string;
  slug: string;
  apiBaseUrl: string | null;
  credentials: string | null;
  supplierId: string | null;
  prescreenerUrl: string | null;
  privateKey: string | null;
  publicKey: string | null;
  minCpiCents: number;
  userPayoutPct: number;
  eligibilityCacheTtl: number;
  redirectUrls: Record<string, string> | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProviderInput {
  name: string;
  slug: string;
  apiBaseUrl?: string;
  credentials?: string;
  supplierId?: string;
  prescreenerUrl?: string;
  minCpiCents?: number;
  userPayoutPct?: number;
  eligibilityCacheTtl?: number;
  isActive?: boolean;
}

export interface UpdateProviderInput {
  name?: string;
  slug?: string;
  apiBaseUrl?: string;
  credentials?: string;
  supplierId?: string;
  prescreenerUrl?: string;
  privateKey?: string;
  publicKey?: string;
  minCpiCents?: number;
  userPayoutPct?: number;
  eligibilityCacheTtl?: number;
  redirectUrls?: Record<string, string>;
  isActive?: boolean;
}
