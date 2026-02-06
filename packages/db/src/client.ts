import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Connection string from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create postgres client
const client = postgres(connectionString, {
  max: 10, // Connection pool size
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create drizzle client with schema
export const db = drizzle(client, { schema });

// Export the raw client for migrations or raw queries if needed
export { client };

// Type for the database client
export type Database = typeof db;
