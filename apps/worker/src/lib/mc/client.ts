export interface MCConfig {
  apiKey: string;
  baseUrl: string;
  supplierId: string;
}

export interface UserQualifications {
  age: number;
  gender: "M" | "F" | "O";
}

export interface EligibleBid {
  bidId: string;
  quotas: {
    quotaId: string;
    cpi: number;
    loi: number;
  }[];
}

/**
 * Morning Consult API Client
 */
export class MorningConsultClient {
  private apiKey: string;
  private baseUrl: string;
  private supplierId: string;

  constructor(config: MCConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
    this.supplierId = config.supplierId;
  }

  /**
   * Check user eligibility for surveys
   * POST /supplier/eligibility
   */
  async checkEligibility(
    qualifications: UserQualifications,
    bidIds: string[],
  ): Promise<EligibleBid[]> {
    const response = await fetch(`${this.baseUrl}/supplier/eligibility`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        qualifications: this.mapQualifications(qualifications),
        bid_ids: bidIds,
      }),
    });

    if (!response.ok) {
      throw new Error(`MC eligibility check failed: ${response.status}`);
    }

    const data = (await response.json()) as any;
    return this.parseEligibleBids(data.eligible_bids || []);
  }

  /**
   * Fetch all available bids for this supplier
   * GET /supplier/inventory
   */
  async fetchInventory(): Promise<EligibleBid[]> {
    const response = await fetch(`${this.baseUrl}/supplier/inventory`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch MC inventory: ${response.status}`);
    }

    const data = (await response.json()) as any;
    return this.parseEligibleBids(data.bids || []);
  }

  /**
   * Get MC's public key for signature verification
   * GET /lookup/public-key
   */
  async getPublicKey(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/lookup/public-key`, {
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
    const response = await fetch(`${this.baseUrl}/user/public-keys`, {
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
      `${this.baseUrl}/user/redirect-urls/${statusId}`,
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
    const response = await fetch(`${this.baseUrl}/user/redirect-urls/default`, {
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

  private parseEligibleBids(bids: any[]): EligibleBid[] {
    if (!Array.isArray(bids)) return [];

    return bids.map((bid) => ({
      bidId: bid.bid_id,
      quotas: (bid.quotas || []).map((quota: any) => ({
        quotaId: quota.quota_id,
        cpi: quota.cpi,
        loi: quota.loi,
      })),
    }));
  }
}
