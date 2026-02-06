import type { TypedSupabaseClient } from "@packages/supabase";
import type { ISyncRepository } from "../../../domain/interfaces/sync-repository";
import type { SyncJobLog, CreateSyncJobInput, UpdateSyncJobInput, QualificationLegend } from "../../../domain/entities/sync";

/**
 * Supabase implementation of ISyncRepository
 */
export class SupabaseSyncRepository implements ISyncRepository {
  constructor(private db: TypedSupabaseClient) {}

  async findAllJobs(limit: number = 50): Promise<SyncJobLog[]> {
    const { data, error } = await this.db
      .from("sync_job_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(this.mapJobToEntity);
  }

  async findJobById(id: string): Promise<SyncJobLog | null> {
    const { data, error } = await this.db
      .from("sync_job_logs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data ? this.mapJobToEntity(data) : null;
  }

  async createJob(input: CreateSyncJobInput): Promise<SyncJobLog> {
    const { data, error } = await this.db
      .from("sync_job_logs")
      .insert({
        provider_id: input.providerId,
        status: input.status,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapJobToEntity(data);
  }

  async updateJob(id: string, input: UpdateSyncJobInput): Promise<SyncJobLog | null> {
    const updateData: any = {};
    if (input.status !== undefined) updateData.status = input.status;
    if (input.message !== undefined) updateData.message = input.message;
    if (input.itemsProcessed !== undefined) updateData.items_processed = input.itemsProcessed;
    if (input.itemsModified !== undefined) updateData.items_modified = input.itemsModified;
    if (input.completedAt !== undefined) updateData.completed_at = input.completedAt.toISOString();

    const { data, error } = await this.db
      .from("sync_job_logs")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data ? this.mapJobToEntity(data) : null;
  }

  async upsertQualificationLegend(providerId: string, questionId: string): Promise<QualificationLegend> {
    const { data, error } = await this.db
      .from("qualification_legend")
      .upsert(
        {
          provider_id: providerId,
          question_id: questionId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "provider_id,question_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return this.mapLegendToEntity(data);
  }

  private mapJobToEntity(row: any): SyncJobLog {
    return {
      id: row.id,
      providerId: row.provider_id,
      status: row.status,
      message: row.message,
      itemsProcessed: row.items_processed ?? 0,
      itemsModified: row.items_modified ?? 0,
      startedAt: new Date(row.started_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : null,
      createdAt: new Date(row.created_at),
    };
  }

  private mapLegendToEntity(row: any): QualificationLegend {
    return {
      id: row.id,
      providerId: row.provider_id,
      questionId: row.question_id,
      questionText: row.question_text,
      answerOptions: row.answer_options,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
