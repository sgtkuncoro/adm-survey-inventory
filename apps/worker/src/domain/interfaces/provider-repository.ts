import type { SurveyProvider, CreateProviderInput, UpdateProviderInput } from "../entities/provider";

/**
 * Provider Repository Interface
 * Defines the contract for provider data access
 */
export interface IProviderRepository {
  /**
   * Find all providers
   */
  findAll(): Promise<SurveyProvider[]>;

  /**
   * Find all active providers
   */
  findActive(): Promise<SurveyProvider[]>;

  /**
   * Find a provider by ID
   */
  findById(id: string): Promise<SurveyProvider | null>;

  /**
   * Find a provider by slug
   */
  findBySlug(slug: string): Promise<SurveyProvider | null>;

  /**
   * Create a new provider
   */
  create(input: CreateProviderInput): Promise<SurveyProvider>;

  /**
   * Update an existing provider
   */
  update(id: string, input: UpdateProviderInput): Promise<SurveyProvider | null>;

  /**
   * Delete a provider
   */
  delete(id: string): Promise<boolean>;
}
