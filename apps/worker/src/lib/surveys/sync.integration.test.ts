import { describe, it, expect, vi, beforeEach } from "vitest";
import { syncSurveyInventory } from "./sync";

// Mock Supabase Client
const mockSupabase = {
  from: vi.fn(),
};

// Mock Morning Consult Client
const mockFetchInventory = vi.fn();
vi.mock("../mc/client", () => {
    return {
        MorningConsultClient: vi.fn().mockImplementation(() => ({
            fetchInventory: mockFetchInventory
        }))
    }
});

describe("Sync Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should sync surveys correctly", async () => {
    // Setup Mock DB Responses
    const mockInsert = vi.fn().mockReturnValue({ data: { id: "log-1" }, error: null, select: vi.fn().mockReturnThis(), single: vi.fn().mockReturnThis() });
    const mockSelect = vi.fn();
    const mockUpdate = vi.fn();
    const mockUpsert = vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockReturnValue({ data: { id: "survey-1" } }) }) });

    mockSupabase.from.mockImplementation((table) => {
        if (table === "sync_job_logs") return { insert: mockInsert, update: mockUpdate };
        if (table === "survey_providers") return { select: mockSelect };
        if (table === "external_surveys") return { select: mockSelect, upsert: mockUpsert, update: mockUpdate, eq: vi.fn().mockReturnThis(), in: vi.fn().mockReturnThis() };
        if (table === "survey_quotas") return { upsert: mockUpsert };
        if (table === "qualification_legend") return { upsert: mockUpsert };
        if (table === "quota_qualifications") return { upsert: mockUpsert };
        return {};
    });

    // Mock Providers
    mockSelect.mockReturnValueOnce({ data: [{ id: "prov-1", credentials: "key", api_base_url: "url", is_active: true }] });
    
    // Mock Inventory from MC
    mockFetchInventory.mockResolvedValue([
        {
            bidId: "bid-1",
            country: "US",
            quotas: [
                { quotaId: "q-1", cpi: 200, loi: 600, qualifications: [] }
            ]
        }
    ]);

    // Exec
    await syncSurveyInventory(mockSupabase as any);

    // Assert
    expect(mockFetchInventory).toHaveBeenCalled();
    expect(mockSupabase.from).toHaveBeenCalledWith("external_surveys");
    // Verify Upsert called
    // We can inspect mockUpsert.mock.calls to verify payload
  });
});
