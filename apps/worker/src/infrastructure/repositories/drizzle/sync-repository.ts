import { eq, desc } from "drizzle-orm";
import type { Database } from "@packages/db";
import { syncJobLogs, qualificationLegend } from "@packages/db";
import type { ISyncRepository } from "../../../domain/interfaces/sync-repository";
import type { SyncJobLog, CreateSyncJobInput, UpdateSyncJobInput, QualificationLegend } from "../../../domain/entities/sync";

/**
 * Drizzle implementation of ISyncRepository
 */
export class DrizzleSyncRepository implements ISyncRepository {
  constructor(private db: Database) {}

  async findAllJobs(limit: number = 50): Promise<SyncJobLog[]> {
    const results = await this.db
      .select()
      .from(syncJobLogs)
      .orderBy(desc(syncJobLogs.createdAt))
      .limit(limit);

    return results.map(this.mapJobToEntity);
  }

  async findJobById(id: string): Promise<SyncJobLog | null> {
    const results = await this.db
      .select()
      .from(syncJobLogs)
      .where(eq(syncJobLogs.id, id))
      .limit(1);

    return results[0] ? this.mapJobToEntity(results[0]) : null;
  }

  async createJob(input: CreateSyncJobInput): Promise<SyncJobLog> {
    const results = await this.db
      .insert(syncJobLogs)
      .values({
        providerId: input.providerId,
        status: input.status,
        startedAt: new Date(),
      })
      .returning();

    return this.mapJobToEntity(results[0]);
  }

  async updateJob(id: string, input: UpdateSyncJobInput): Promise<SyncJobLog | null> {
    const updateData: Partial<typeof syncJobLogs.$inferInsert> = {};
    if (input.status !== undefined) updateData.status = input.status;
    if (input.message !== undefined) updateData.message = input.message;
    if (input.itemsProcessed !== undefined) updateData.itemsProcessed = input.itemsProcessed;
    if (input.itemsModified !== undefined) updateData.itemsModified = input.itemsModified;
    if (input.completedAt !== undefined) updateData.completedAt = input.completedAt;

    const results = await this.db
      .update(syncJobLogs)
      .set(updateData)
      .where(eq(syncJobLogs.id, id))
      .returning();

    return results[0] ? this.mapJobToEntity(results[0]) : null;
  }

  async upsertQualificationLegend(providerId: string, questionId: string): Promise<QualificationLegend> {
    const results = await this.db
      .insert(qualificationLegend)
      .values({
        providerId,
        questionId,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [qualificationLegend.providerId, qualificationLegend.questionId],
        set: {
          updatedAt: new Date(),
        },
      })
      .returning();

    return this.mapLegendToEntity(results[0]);
  }

  private mapJobToEntity(row: typeof syncJobLogs.$inferSelect): SyncJobLog {
    return {
      id: row.id,
      providerId: row.providerId,
      status: row.status as SyncJobLog["status"],
      message: row.message,
      itemsProcessed: row.itemsProcessed ?? 0,
      itemsModified: row.itemsModified ?? 0,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      createdAt: row.createdAt,
    };
  }

  private mapLegendToEntity(row: typeof qualificationLegend.$inferSelect): QualificationLegend {
    return {
      id: row.id,
      providerId: row.providerId,
      questionId: row.questionId,
      questionText: row.questionText,
      answerOptions: row.answerOptions as Record<string, string> | null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
