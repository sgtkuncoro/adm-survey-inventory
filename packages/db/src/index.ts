// Database client
export { db, client, type Database } from "./client";

// Schema exports
export * from "./schema";

// Re-export drizzle utilities for convenience
export { eq, and, or, not, gt, gte, lt, lte, inArray, notInArray, isNull, isNotNull, sql } from "drizzle-orm";
