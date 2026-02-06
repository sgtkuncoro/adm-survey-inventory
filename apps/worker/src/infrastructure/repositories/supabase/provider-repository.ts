import type { TypedSupabaseClient } from "@packages/supabase";
import type { IProviderRepository } from "../../../domain/interfaces/provider-repository";
import type { SurveyProvider, CreateProviderInput, UpdateProviderInput } from "../../../domain/entities/provider";

/**
 * Supabase implementation of IProviderRepository
 */
export class SupabaseProviderRepository implements IProviderRepository {
  constructor(private db: TypedSupabaseClient) {}

  async findAll(): Promise<SurveyProvider[]> {
    const { data, error } = await this.db
      .from("survey_providers")
      .select("*")
      .order("name");

    if (error) throw error;
    return (data || []).map(this.mapToEntity);
  }

  async findActive(): Promise<SurveyProvider[]> {
    const { data, error } = await this.db
      .from("survey_providers")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    return (data || []).map(this.mapToEntity);
  }

  async findById(id: string): Promise<SurveyProvider | null> {
    const { data, error } = await this.db
      .from("survey_providers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }
    return data ? this.mapToEntity(data) : null;
  }

  async findBySlug(slug: string): Promise<SurveyProvider | null> {
    const { data, error } = await this.db
      .from("survey_providers")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data ? this.mapToEntity(data) : null;
  }

  async create(input: CreateProviderInput): Promise<SurveyProvider> {
    const { data, error } = await this.db
      .from("survey_providers")
      .insert({
        name: input.name,
        slug: input.slug,
        api_base_url: input.apiBaseUrl,
        credentials: input.credentials,
        supplier_id: input.supplierId,
        prescreener_url: input.prescreenerUrl,
        min_cpi_cents: input.minCpiCents ?? 200,
        user_payout_pct: input.userPayoutPct ?? 50,
        eligibility_cache_ttl: input.eligibilityCacheTtl ?? 60,
        is_active: input.isActive ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapToEntity(data);
  }

  async update(id: string, input: UpdateProviderInput): Promise<SurveyProvider | null> {
    const updateData: any = { updated_at: new Date().toISOString() };
    
    if (input.name !== undefined) updateData.name = input.name;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.apiBaseUrl !== undefined) updateData.api_base_url = input.apiBaseUrl;
    if (input.credentials !== undefined) updateData.credentials = input.credentials;
    if (input.supplierId !== undefined) updateData.supplier_id = input.supplierId;
    if (input.prescreenerUrl !== undefined) updateData.prescreener_url = input.prescreenerUrl;
    if (input.privateKey !== undefined) updateData.private_key = input.privateKey;
    if (input.publicKey !== undefined) updateData.public_key = input.publicKey;
    if (input.minCpiCents !== undefined) updateData.min_cpi_cents = input.minCpiCents;
    if (input.userPayoutPct !== undefined) updateData.user_payout_pct = input.userPayoutPct;
    if (input.eligibilityCacheTtl !== undefined) updateData.eligibility_cache_ttl = input.eligibilityCacheTtl;
    if (input.redirectUrls !== undefined) updateData.redirect_urls = input.redirectUrls;
    if (input.isActive !== undefined) updateData.is_active = input.isActive;

    const { data, error } = await this.db
      .from("survey_providers")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data ? this.mapToEntity(data) : null;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.db
      .from("survey_providers")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  }

  private mapToEntity(row: any): SurveyProvider {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      apiBaseUrl: row.api_base_url,
      credentials: row.credentials,
      supplierId: row.supplier_id,
      prescreenerUrl: row.prescreener_url,
      privateKey: row.private_key,
      publicKey: row.public_key,
      minCpiCents: row.min_cpi_cents,
      userPayoutPct: row.user_payout_pct,
      eligibilityCacheTtl: row.eligibility_cache_ttl,
      redirectUrls: row.redirect_urls,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
