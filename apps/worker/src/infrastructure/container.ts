import type { TypedSupabaseClient } from "@packages/supabase";
import type { Database } from "@packages/db";
import type { IProviderRepository, ISurveyRepository, ISyncRepository } from "../domain/interfaces";
import {
  SupabaseProviderRepository,
  SupabaseSurveyRepository,
  SupabaseSyncRepository,
} from "./repositories/supabase";
import {
  DrizzleProviderRepository,
  DrizzleSurveyRepository,
  DrizzleSyncRepository,
} from "./repositories/drizzle";

/**
 * Repository Container
 * Factory for creating repository instances based on backend configuration
 */
export interface RepositoryContainer {
  providers: IProviderRepository;
  surveys: ISurveyRepository;
  sync: ISyncRepository;
}

export type DatabaseBackend = "supabase" | "drizzle";

/**
 * Create repositories for the specified backend
 */
export function createRepositories(
  backend: DatabaseBackend,
  supabaseClient?: TypedSupabaseClient,
  drizzleClient?: Database,
): RepositoryContainer {
  switch (backend) {
    case "supabase":
      if (!supabaseClient) {
        throw new Error("Supabase client is required for supabase backend");
      }
      return {
        providers: new SupabaseProviderRepository(supabaseClient),
        surveys: new SupabaseSurveyRepository(supabaseClient),
        sync: new SupabaseSyncRepository(supabaseClient),
      };

    case "drizzle":
      if (!drizzleClient) {
        throw new Error("Drizzle client is required for drizzle backend");
      }
      return {
        providers: new DrizzleProviderRepository(drizzleClient),
        surveys: new DrizzleSurveyRepository(drizzleClient),
        sync: new DrizzleSyncRepository(drizzleClient),
      };

    default:
      throw new Error(`Unknown database backend: ${backend}`);
  }
}

/**
 * Helper to get backend from environment
 */
export function getBackendFromEnv(env: { DB_BACKEND?: string }): DatabaseBackend {
  const backend = env.DB_BACKEND || "supabase";
  if (backend !== "supabase" && backend !== "drizzle") {
    console.warn(`Unknown DB_BACKEND "${backend}", defaulting to supabase`);
    return "supabase";
  }
  return backend;
}
