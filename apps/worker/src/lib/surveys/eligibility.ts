import type { EligibleBid, UserQualifications } from "../mc/client";

export interface EligibilityResult {
  hasEligibleSurveys: boolean;
  bestBid?: {
    bidId: string;
    cpi: number;
    loi: number;
    userPayout: number;
    estimatedMinutes: number;
  };
  eligibleBids: EligibleBid[];
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/**
 * Map gender to MC format
 */
export function mapGender(gender: string): "M" | "F" | "O" {
  const g = gender.toUpperCase();
  if (g === "MALE" || g === "M") return "M";
  if (g === "FEMALE" || g === "F") return "F";
  return "O";
}

/**
 * Find the best bid (highest CPI) from eligible bids
 */
export function findBestBid(
  bids: EligibleBid[],
  payoutPct: number,
): EligibilityResult["bestBid"] {
  if (bids.length === 0) return undefined;

  // Get all quotas from all bids
  const allQuotas = bids.flatMap((bid) =>
    bid.quotas.map((quota) => ({
      bidId: bid.bidId,
      cpi: quota.cpi,
      loi: quota.loi,
    })),
  );

  // Sort by CPI (highest first)
  allQuotas.sort((a, b) => b.cpi - a.cpi);
  const best = allQuotas[0];

  return {
    bidId: best.bidId,
    cpi: best.cpi,
    loi: best.loi,
    userPayout: Math.floor(best.cpi * (payoutPct / 100)),
    estimatedMinutes: Math.ceil(best.loi / 60),
  };
}

/**
 * Check if cache is still fresh
 */
export function isCacheFresh(fetchedAt: Date, ttlSeconds: number): boolean {
  const cacheAge = Date.now() - new Date(fetchedAt).getTime();
  const cacheAgeSeconds = cacheAge / 1000;
  return cacheAgeSeconds < ttlSeconds;
}
