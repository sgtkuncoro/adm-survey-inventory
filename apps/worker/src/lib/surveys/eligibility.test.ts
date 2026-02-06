import { describe, it, expect } from "vitest";
import { calculateAge, mapGender } from "./eligibility";

describe("Eligibility Logic", () => {
  describe("calculateAge", () => {
    it("should calculate age correctly", () => {
        // Mock current date to ensure stability
        const mockDate = new Date("2024-01-01");
        // vi.useFakeTimers().setSystemTime(mockDate); // Complexity not needed if we just do math check
        
        // 2000-01-01 -> 24 on 2024-01-01
        const dob = "2000-01-01";
        // Simple age calc check: current year - birth year, adjusted for month
        // We rely on the function logic. Let's assume standard behavior.
        // Since we can't easily mock system time globally without setup, let's use relative dates
        
        const today = new Date();
        const year = today.getFullYear();
        const age20 = `${year - 20}-01-01`;
        
        expect(calculateAge(age20)).toBe(20);
    });
  });

  describe("mapGender", () => {
      it("should map M to M", () => expect(mapGender("M")).toBe("M"));
      it("should map F to F", () => expect(mapGender("F")).toBe("F"));
      it("should map male to M", () => expect(mapGender("male")).toBe("M"));
      it("should map female to F", () => expect(mapGender("female")).toBe("F"));
      it("should default to O", () => expect(mapGender("unknown")).toBe("O"));
  });
});
