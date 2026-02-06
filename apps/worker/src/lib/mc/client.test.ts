import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MorningConsultClient } from "./client";

// Mock data matching real MC API response structure
const mockBidsResponse = {
  bids: [
    {
      buyer_account_id: "0b6f207c-96e1-4dce-b032-566a815ad263",
      buyer_id: "9020f6f3-db41-470a-a5d7-c04fa2da9156",
      closed_at: "2022-01-01T00:00:00Z",
      country_id: "us",
      end_date: "2022-01-01T00:00:00Z",
      exclusions: [
        {
          group_id: "0bbae805-5a80-42e3-8d5f-cb056a0f825d",
          lockout_period: 7,
        },
      ],
      id: "000f09a3-bc25-4adc-a443-a9975800e7ac",
      language_ids: ["en", "es"],
      name: "My Example Survey",
      published_at: "2021-12-30T00:00:00Z",
      qualifications: [
        {
          id: "flossing",
          responses: [
            {
              id: "1",
              translations: [
                { language_id: "en", text: "Yes" },
                { language_id: "es", text: "Sí" },
              ],
            },
            {
              id: "2",
              translations: [
                { language_id: "en", text: "No" },
                { language_id: "es", text: "No" },
              ],
            },
          ],
          translations: [
            { language_id: "en", text: "Do you floss your teeth regularly?" },
            { language_id: "es", text: "¿Usas hilo dental regularmente?" },
          ],
          type: "multiple_choice",
        },
      ],
      quotas: [
        {
          cost_per_interview: 100,
          id: "6a7d0190-e6ad-4a59-9945-7ba460517f2b",
          qualifications: [
            { id: "gender", response_ids: ["1"], scope: "global" },
            { id: "age", response_ids: ["18", "19", "20", "21"], scope: "global" },
            { id: "flossing", response_ids: ["1"], scope: "bid" },
          ],
          statistics: {
            length_of_interview: 600,
            median_length_of_interview: 600,
            num_available: 500,
            num_completes: 100,
            num_failures: 0,
            num_in_progress: 0,
            num_over_quotas: 0,
            num_qualified: 100,
            num_quality_terminations: 0,
            num_timeouts: 0,
            qualified_conversion: 100,
          },
        },
      ],
      state: "active",
      statistics: {
        earnings_per_click: 50,
        estimated_length_of_interview: 720,
        incidence_rate: 100,
        length_of_interview: 600,
        median_length_of_interview: 600,
        num_available: 500,
        num_completes: 100,
        num_entrants: 100,
        num_failures: 0,
        num_in_progress: 0,
        num_over_quotas: 0,
        num_qualified: 100,
        num_quality_terminations: 0,
        num_screenouts: 0,
        num_timeouts: 0,
        qualified_conversion: 100,
        system_conversion: 100,
      },
      supplier_exclusive: false,
      survey_type: "ad_hoc",
      timeout: 3600,
      topic_id: "general",
    },
  ],
};

describe("MorningConsultClient", () => {
  let client: MorningConsultClient;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    client = new MorningConsultClient({
      apiKey: "test-api-key",
      baseUrl: "https://sample-api.morningconsult.com",
      supplierId: "test-supplier",
    });

    // Mock global fetch
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("fetchInventory", () => {
    it("should correctly parse MC API response with proper field mappings", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBidsResponse),
      });

      const { bids } = await client.fetchInventory({ state: "active" });

      // Verify the first bid was parsed correctly
      expect(bids).toHaveLength(1);

      const firstBid = bids[0];
      expect(firstBid.bidId).toBe("000f09a3-bc25-4adc-a443-a9975800e7ac"); // from 'id'
      expect(firstBid.name).toBe("My Example Survey");
      expect(firstBid.country).toBe("us"); // from 'country_id'
      expect(firstBid.state).toBe("active");
      expect(firstBid.surveyType).toBe("ad_hoc"); // from 'survey_type'

      // Verify statistics
      expect(firstBid.statistics.loi).toBe(600); // from 'length_of_interview'
      expect(firstBid.statistics.numAvailable).toBe(500);
      expect(firstBid.statistics.incidenceRate).toBe(100);

      // Verify quotas
      expect(firstBid.quotas).toHaveLength(1);

      const firstQuota = firstBid.quotas[0];
      expect(firstQuota.quotaId).toBe("6a7d0190-e6ad-4a59-9945-7ba460517f2b"); // from 'id'
      expect(firstQuota.cpi).toBe(100); // from 'cost_per_interview'
      expect(firstQuota.loi).toBe(600); // from 'statistics.length_of_interview'

      // Verify qualifications
      expect(firstQuota.qualifications).toHaveLength(3);
      expect(firstQuota.qualifications[0].questionId).toBe("gender"); // from 'id'
      expect(firstQuota.qualifications[0].answers).toContain("1"); // from 'response_ids'

      // Check age qualification
      const ageQual = firstQuota.qualifications.find((q) => q.questionId === "age");
      expect(ageQual?.answers).toEqual(["18", "19", "20", "21"]);

      // Check flossing (bid-scoped) qualification
      const flossingQual = firstQuota.qualifications.find((q) => q.questionId === "flossing");
      expect(flossingQual?.answers).toContain("1");
    });

    it("should handle pagination parameters", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ bids: [], pagination_token: "next-page-token" }),
      });

      await client.fetchInventory({
        state: "active",
        countryId: "us",
        minimumCpi: 200,
        pageSize: 20, // Max is 20
        paginationToken: "some-token",
      });

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("page_size=20"),
        expect.any(Object),
      );
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("pagination_token=some-token"),
        expect.any(Object),
      );
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("state=active"),
        expect.any(Object),
      );
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("country_id=us"),
        expect.any(Object),
      );
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("minimum_cost_per_interview=200"),
        expect.any(Object),
      );
    });

    it("should throw error on API failure", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(client.fetchInventory()).rejects.toThrow(
        "Failed to fetch MC inventory: 401",
      );
    });

    it("should handle empty bids array", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ bids: [] }),
      });

      const { bids } = await client.fetchInventory();
      expect(bids).toEqual([]);
    });

    it("should handle missing optional fields gracefully", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            bids: [
              {
                id: "test-bid-id",
                name: "Test Bid",
                country_id: "us",
                state: "active",
                survey_type: "ad_hoc",
                quotas: [
                  {
                    id: "test-quota-id",
                    cost_per_interview: 100,
                    statistics: {},
                    // No qualifications
                  },
                ],
                // Minimal statistics
                statistics: {},
              },
            ],
          }),
      });

      const { bids } = await client.fetchInventory();
      expect(bids[0].bidId).toBe("test-bid-id");
      expect(bids[0].statistics.loi).toBe(0); // Default when missing
      expect(bids[0].quotas[0].qualifications).toEqual([]);
    });
  });

  describe("fetchAllInventory", () => {
    it("should fetch all pages until no pagination_token returned", async () => {
      // First page returns 20 items with a pagination token
      const page1Bids = Array.from({ length: 20 }, (_, i) => ({
        id: `bid-${i}`,
        name: `Bid ${i}`,
        country_id: "us",
        state: "active",
        survey_type: "ad_hoc",
        quotas: [],
        statistics: {},
      }));

      // Second page returns 15 items with no token (end of data)
      const page2Bids = Array.from({ length: 15 }, (_, i) => ({
        id: `bid-${20 + i}`,
        name: `Bid ${20 + i}`,
        country_id: "us",
        state: "active",
        survey_type: "ad_hoc",
        quotas: [],
        statistics: {},
      }));

      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ bids: page1Bids, pagination_token: "next-page" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ bids: page2Bids }), // No token = last page
        });

      const allBids = await client.fetchAllInventory();

      expect(allBids).toHaveLength(35);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });
});
