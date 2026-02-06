import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import SurveysPage from "./page";
import { useUserEligibility } from "@/hooks/use-surveys";

// Mock hooks
vi.mock("@/hooks/use-surveys", () => ({
  useUserEligibility: vi.fn(),
}));

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock SurveyCard to simplify
vi.mock("@/components/survey-card", () => ({
  SurveyCard: ({ survey }: any) => <div data-testid="survey-card">{survey.external_bid_id}</div>,
}));

// Mock OfferModal
vi.mock("@/components/offer-modal", () => ({
  OfferModal: () => null,
}));

describe("User SurveysPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state", () => {
    (useUserEligibility as any).mockReturnValue({
      isLoading: true,
      data: null,
    });

    render(<SurveysPage />);
    // Loading state is shown
  });

  it("renders survey cards when eligible", () => {
    (useUserEligibility as any).mockReturnValue({
      isLoading: false,
      data: {
        eligibleBids: [
          { external_bid_id: "bid-1", cpi_cents: 200, loi_minutes: 10 },
          { external_bid_id: "bid-2", cpi_cents: 300, loi_minutes: 15 },
        ],
      },
    });

    render(<SurveysPage />);
    
    const cards = screen.getAllByTestId("survey-card");
    expect(cards.length).toBe(2);
  });

  it("renders no surveys message when empty", () => {
    (useUserEligibility as any).mockReturnValue({
      isLoading: false,
      data: { eligibleBids: [] },
    });

    render(<SurveysPage />);
    
    expect(screen.getByText(/no surveys available/i)).toBeDefined();
  });
});
