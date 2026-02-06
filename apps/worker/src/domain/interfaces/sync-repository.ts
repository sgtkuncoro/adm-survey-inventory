import type { SyncJobLog, CreateSyncJobInput, UpdateSyncJobInput, QualificationLegend } from "../entities/sync";

/**
 * Sync Job Repository Interface
 */
export interface ISyncRepository {
  // Jobs
  findAllJobs(limit?: number): Promise<SyncJobLog[]>;
  findJobById(id: string): Promise<SyncJobLog | null>;
  createJob(input: CreateSyncJobInput): Promise<SyncJobLog>;
  updateJob(id: string, input: UpdateSyncJobInput): Promise<SyncJobLog | null>;

  // Qualification Legend
  upsertQualificationLegend(providerId: string, questionId: string): Promise<QualificationLegend>;
}
