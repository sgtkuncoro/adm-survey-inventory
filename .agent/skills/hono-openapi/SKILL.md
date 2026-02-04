---
name: hono-openapi
description: Guidelines for writing type-safe API documentation with @hono/zod-openapi and Scalar.
---

# Hono OpenAPI Documentation

This project uses `@hono/zod-openapi` to generate OpenAPI (Swagger) documentation automatically from TyeSafe route definitions.

## 1. Setup

Routes should use `OpenAPIHono` instead of the standard `Hono` class to enable OpenAPI features.

```typescript
import { OpenAPIHono } from "@hono/zod-openapi";

const app = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>();
```

## 2. Defining Routes

Use `createRoute` to define the route metadata and schema. This ensures that the implementation matches the documentation.

### Example Route Definition

```typescript
import { createRoute, z } from "@hono/zod-openapi";

const getUserRoute = createRoute({
  method: "get",
  path: "/{id}",
  summary: "Get user by ID",
  tags: ["Users"],
  request: {
    params: z.object({
      id: z.string().openapi({ example: "123" }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            id: z.string(),
            name: z.string(),
          }),
        },
      },
      description: "Retrieve the user",
    },
    404: {
      description: "User not found",
    },
  },
});
```

## 3. Implementing Routes

Use `app.openapi()` to implement the logic for a defined route. The handler will be type-safe based on the route definition.

```typescript
app.openapi(getUserRoute, async (c) => {
  const { id } = c.req.valid("param");
  // ... logic
  return c.json({ id, name: "John Doe" }, 200);
});
```

## 4. Serving Documentation

The OpenAPI specification and UI should be served at the root of the worker or API group.

```typescript
import { apiReference } from "@scalar/hono-api-reference";

// Export the specification
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "My API",
  },
});

// Serve the UI
app.get(
  "/ui",
  apiReference({
    spec: {
      url: "/doc",
    },
  }),
);
```

## 5. Best Practices

- **Summary & Tags**: Always provide a `summary` and `tags` for every route to keep the UI organized.
- **Examples**: Use `.openapi({ example: "..." })` on Zod schemas to provide helpful examples in the docs.
- **Validation**: Always use `c.req.valid("json")`, `c.req.valid("query")`, etc., to leverage the type safety provided by the route definition.
- **Error Responses**: Document common error responses (400, 401, 404, 500) so consumers know what to expect.
