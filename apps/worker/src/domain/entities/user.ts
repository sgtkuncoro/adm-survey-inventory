/**
 * User Domain Entities
 */

export interface User {
  id: string;
  email: string | null;
  dateOfBirth: Date | null;
  gender: "M" | "F" | "O" | null;
  walletBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SurveySession {
  id: string;
  userId: string;
  providerId: string;
  bidId: string;
  quotaId: string | null;
  cpiAtClick: number;
  expectedPayout: number;
  actualPayout: number | null;
  status: "pending" | "complete" | "screenout" | "over_quota" | "quality_term" | "timeout";
  statusDetail: string | null;
  startedAt: Date;
  completedAt: Date | null;
}

export interface UserSurveyEligibility {
  id: string;
  userId: string;
  providerId: string;
  eligibleBids: any[];
  bestBid: any | null;
  fetchedAt: Date;
}

export interface CreateSessionInput {
  userId: string;
  providerId: string;
  bidId: string;
  quotaId?: string;
  cpiAtClick: number;
  expectedPayout: number;
}

export interface UpdateSessionInput {
  actualPayout?: number;
  status?: SurveySession["status"];
  statusDetail?: string;
  completedAt?: Date;
}
