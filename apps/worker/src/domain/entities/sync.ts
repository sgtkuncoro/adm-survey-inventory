/**
 * Sync Job Domain Entities
 */

export interface SyncJobLog {
  id: string;
  providerId: string | null;
  status: "running" | "success" | "failed";
  message: string | null;
  itemsProcessed: number;
  itemsModified: number;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
}

export interface QualificationLegend {
  id: string;
  providerId: string;
  questionId: string;
  questionText: string | null;
  answerOptions: Record<string, string> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSyncJobInput {
  providerId?: string;
  status: SyncJobLog["status"];
}

export interface UpdateSyncJobInput {
  status?: SyncJobLog["status"];
  message?: string;
  itemsProcessed?: number;
  itemsModified?: number;
  completedAt?: Date;
}
