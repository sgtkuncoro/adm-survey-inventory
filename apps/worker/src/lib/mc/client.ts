/**
 * Morning Consult API Client
 * Based on official API documentation: https://sample-api.morningconsult.com/docs/
 */

import { ApiLogger } from "../logging/api-logger";

// ============================================================================
// API Response Types (matching actual MC API)
// ============================================================================

/** MC API Qualification on a quota */
interface MCApiQuotaQualification {
  id: string;
  response_ids: string[];
  scope: "bid" | "global";
}

/** MC API Quota statistics */
interface MCApiQuotaStatistics {
  length_of_interview: number; // seconds
  median_length_of_interview: number;
  num_available: number;
  num_completes: number;
  num_in_progress: number;
  qualified_conversion: number;
}

/** MC API Quota */
interface MCApiQuota {
  id: string; // UUID
  cost_per_interview: number; // cents (1-10000)
  qualifications?: MCApiQuotaQualification[];
  statistics: MCApiQuotaStatistics;
  state: "draft" | "active" | "paused" | "closed";
}

/** MC API Bid statistics */
interface MCApiBidStatistics {
  earnings_per_click: number;
  estimated_length_of_interview: number;
  incidence_rate: number;
  length_of_interview: number;
  median_length_of_interview: number;
  num_available: number;
  num_completes: number;
  num_entrants: number;
  num_in_progress: number;
  qualified_conversion: number;
  system_conversion: number;
}

/** MC API Bid (from /supplier/bids response) */
interface MCApiBid {
  id: string; // UUID - this is what we need for bidId!
  name: string;
  country_id: string; // 2-letter code like "us", "au"
  language_ids: string[];
  state: "draft" | "active" | "paused" | "closed";
  survey_type: "ad_hoc" | "b2b" | "daily_tracker" | "omnibus";
  topic_id: string;
  timeout: number;
  end_date: string;
  published_at: string;
  closed_at?: string;
  buyer_account_id: string;
  buyer_id: string;
  supplier_exclusive: boolean;
  quotas: MCApiQuota[];
  statistics: MCApiBidStatistics;
  exclusions?: { group_id: string; lockout_period?: number }[];
  qualifications?: {
    id: string;
    type: "multiple_choice";
    responses: { id: string; translations: { language_id: string; text: string }[] }[];
    translations: { language_id: string; text: string }[];
  }[];
}

/** MC API paginated response for /supplier/bids */
interface MCApiSupplierBidsResponse {
  bids: MCApiBid[];
}

// ============================================================================
// Client Config & Domain Types
// ============================================================================

export interface MCConfig {
  apiKey: string;
  baseUrl: string;
  supplierId: string;
  logger?: ApiLogger; // Optional API logger for request/response tracking
}

export interface UserQualifications {
  age: number;
  gender: "M" | "F" | "O";
}

/** Normalized bid structure for internal use */
export interface EligibleBid {
  bidId: string;
  name: string;
  country: string;
  languageIds: string[]; // Language codes (e.g., ["en", "es"])
  state: string;
  surveyType: string;
  statistics: {
    loi: number; // Length of interview in seconds
    numAvailable: number;
    incidenceRate: number;
  };
  quotas: {
    quotaId: string;
    cpi: number; // Cost per interview in cents
    loi: number; // From quota statistics, in seconds
    // Quota-level statistics for Needed/Filled
    numAvailable: number; // Slots remaining ("Needed")
    numCompletes: number; // Completed surveys ("Filled")
    isOpen: boolean; // Whether quota is still accepting
    qualifications: {
      questionId: string;
      answers: string[]; // response_ids from API
    }[];
  }[];
}

export interface FetchInventoryOptions {
  state?: "active" | "paused" | "closed";
  countryId?: string;
  minimumCpi?: number; // in cents
  pageSize?: number; // Max: 20
  paginationToken?: string; // Base64 encoded token for next page
}

// ============================================================================
// Morning Consult Client
// ============================================================================

export class MorningConsultClient {
  private apiKey: string;
  private baseUrl: string;
  private supplierId: string;
  private logger?: ApiLogger;

  constructor(config: MCConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
    this.supplierId = config.supplierId;
    this.logger = config.logger;
  }

  /**
   * Internal fetch wrapper with optional logging
   */
  private async loggedFetch(
    url: string,
    options: RequestInit,
    endpoint: string
  ): Promise<Response> {
    if (this.logger) {
      return this.logger.loggedFetch(url, options, endpoint);
    }
    return fetch(url, options);
  }

  /**
   * Check user eligibility for surveys
   * POST /supplier/eligibility
   */
  async checkEligibility(
    qualifications: UserQualifications,
    bidIds: string[],
  ): Promise<EligibleBid[]> {
    const url = `${this.baseUrl}/v1/supplier/eligibility`;
    const response = await this.loggedFetch(
      url,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qualifications: this.mapQualifications(qualifications),
          bid_ids: bidIds,
        }),
      },
      "/v1/supplier/eligibility"
    );

    if (!response.ok) {
      throw new Error(`MC eligibility check failed: ${response.status}`);
    }

    const data = (await response.json()) as any;
    return this.parseApiBids(data.eligible_bids || []);
  }

  /**
   * Fetch all available bids for this supplier
   * GET /supplier/bids
   */
  async fetchInventory(options: FetchInventoryOptions = {}): Promise<{ bids: EligibleBid[]; paginationToken?: string }> {
    const params = new URLSearchParams();
    
    // Pagination - MC API max page_size is 20
    params.set("page_size", String(Math.min(options.pageSize ?? 20, 20)));
    if (options.paginationToken) {
      params.set("pagination_token", options.paginationToken);
    }
    
    // Filters
    if (options.state) {
      params.set("state", options.state);
    }
    if (options.countryId) {
      params.set("country_id", options.countryId);
    }
    if (options.minimumCpi) {
      params.set("minimum_cost_per_interview", String(options.minimumCpi));
    }

    const url = `${this.baseUrl}/v1/supplier/bids?${params.toString()}`;
    
    const response = await this.loggedFetch(
      url,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      },
      "/v1/supplier/bids"
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch MC inventory: ${response.status}`);
    }

    const data = (await response.json()) as MCApiSupplierBidsResponse & { pagination_token?: string };
    return {
      bids: this.parseApiBids(data.bids || []),
      paginationToken: data.pagination_token,
    };
  }

  /**
   * Fetch all pages of inventory (handles pagination automatically)
   */
  async fetchAllInventory(options: Omit<FetchInventoryOptions, 'paginationToken'> = {}): Promise<EligibleBid[]> {
    const allBids: EligibleBid[] = [];
    let paginationToken: string | undefined;
    const pageSize = Math.min(options.pageSize ?? 20, 20); // MC API max is 20
    
    while (true) {
      const result = await this.fetchInventory({
        ...options,
        pageSize,
        paginationToken,
      });
      
      allBids.push(...result.bids);
      
      // If no pagination token, we've reached the end
      if (!result.paginationToken) {
        break;
      }
      
      paginationToken = result.paginationToken;
    }
    
    return allBids;
  }

  /**
   * Get MC's public key for signature verification
   * GET /lookup/public-key
   */
  async getPublicKey(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/v1/lookup/public-key`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to get MC public key: ${response.status}`);
    }

    const data = (await response.json()) as any;
    return data.public_key;
  }

  /**
   * Register our public key with MC
   * POST /user/public-keys
   */
  async registerPublicKey(publicKey: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/v1/user/public-keys`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ public_key: publicKey }),
    });

    if (!response.ok) {
      throw new Error(`Failed to register public key: ${response.status}`);
    }
  }

  /**
   * Set redirect URL for a specific status
   * PUT /user/redirect-urls/{status_id}
   */
  async setRedirectUrl(statusId: string, url: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/v1/user/redirect-urls/${statusId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to set redirect URL: ${response.status}`);
    }
  }

  /**
   * Set default redirect URL
   * PUT /user/redirect-urls/default
   */
  async setDefaultRedirectUrl(url: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/v1/user/redirect-urls/default`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`Failed to set default redirect URL: ${response.status}`);
    }
  }

  private mapQualifications(q: UserQualifications) {
    return [
      { question_id: "age", answers: [q.age.toString()] },
      { question_id: "gender", answers: [q.gender] },
    ];
  }

  /**
   * Parse MC API bids into our normalized EligibleBid format
   */
  private parseApiBids(bids: MCApiBid[]): EligibleBid[] {
    if (!Array.isArray(bids)) return [];

    return bids.map((bid) => ({
      bidId: bid.id, // FIXED: was looking for bid_id, but API returns 'id'
      name: bid.name,
      country: bid.country_id, // FIXED: was looking for country, but API returns 'country_id'
      languageIds: bid.language_ids || [], // Language codes from bid level
      state: bid.state?.toLowerCase(),
      surveyType: bid.survey_type,
      statistics: {
        loi: bid.statistics?.length_of_interview ?? 0,
        numAvailable: bid.statistics?.num_available ?? 0,
        incidenceRate: bid.statistics?.incidence_rate ?? 0,
      },
      quotas: (bid.quotas || []).map((quota) => ({
        quotaId: quota.id, // FIXED: was looking for quota_id, but API returns 'id'
        cpi: quota.cost_per_interview, // FIXED: was 'cpi', API returns 'cost_per_interview'
        loi: quota.statistics?.length_of_interview ?? 0, // FIXED: was 'loi', API nests in statistics
        // Quota-level statistics for Needed/Filled
        numAvailable: quota.statistics?.num_available ?? 0,
        numCompletes: quota.statistics?.num_completes ?? 0,
        isOpen: quota.state?.toLowerCase() === "active",
        qualifications: (quota.qualifications || []).map((q) => ({
          questionId: q.id, // FIXED: was question_id
          answers: q.response_ids || [], // FIXED: was 'answers', API returns 'response_ids'
        })),
      })),
    }));
  }
}
