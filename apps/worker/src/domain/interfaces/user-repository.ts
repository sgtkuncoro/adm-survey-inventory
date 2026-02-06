import type { User, SurveySession, CreateSessionInput, UpdateSessionInput, UserSurveyEligibility } from "../entities/user";

/**
 * User Repository Interface
 */
export interface IUserRepository {
  // Users
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  updateWalletBalance(id: string, amount: number): Promise<User | null>;

  // Sessions
  findSessionById(id: string): Promise<SurveySession | null>;
  findSessionsByUserId(userId: string, limit?: number): Promise<SurveySession[]>;
  createSession(input: CreateSessionInput): Promise<SurveySession>;
  updateSession(id: string, input: UpdateSessionInput): Promise<SurveySession | null>;

  // Eligibility Cache
  findEligibility(userId: string, providerId: string): Promise<UserSurveyEligibility | null>;
  upsertEligibility(userId: string, providerId: string, eligibleBids: any[], bestBid: any): Promise<UserSurveyEligibility>;
}
