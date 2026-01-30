---
name: drizzle-schema
description: Reference for defining Drizzle ORM schemas, fields, and relations correctly.
---

# Drizzle Schema Definition

When defining schema in `packages/db`:

1.  **Imports**: `import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";`
2.  **Fields**:
    - Use `text("name").notNull()` for standard strings.
    - Use `timestamp("created_at").defaultNow().notNull()` for timestamps.
3.  **Relations**:
    - Use `relations()` from `drizzle-orm` to define one-to-many or one-to-one for the application layer (querying with `.with()`).
    - ensure foreign keys are defined in the table definition: `userId: text("user_id").references(() => users.id)`.
