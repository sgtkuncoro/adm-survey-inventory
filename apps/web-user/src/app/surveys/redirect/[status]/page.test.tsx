import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import SurveyRedirectPage from "./page";
import { useParams, useSearchParams } from "next/navigation";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
  useSearchParams: vi.fn(),
}));

// Mock Link
vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe("SurveyRedirectPage", () => {
  it("renders success state with payout", () => {
    (useParams as any).mockReturnValue({ status: "complete" });
    (useSearchParams as any).mockReturnValue({
      get: (key: string) => (key === "payout" ? "250" : null),
    });

    render(<SurveyRedirectPage />);

    expect(screen.getByText("Survey Completed!")).toBeDefined();
    expect(screen.getByText("$2.50")).toBeDefined();
  });

  it("renders screenout state", () => {
    (useParams as any).mockReturnValue({ status: "screenout" });
    (useSearchParams as any).mockReturnValue({ get: () => null });

    render(<SurveyRedirectPage />);

    expect(screen.getByText("Not a Match")).toBeDefined();
  });

  it("renders quota full state", () => {
    (useParams as any).mockReturnValue({ status: "over_quota" });
    (useSearchParams as any).mockReturnValue({ get: () => null });

    render(<SurveyRedirectPage />);

    expect(screen.getByText("Quota Full")).toBeDefined();
  });
});
