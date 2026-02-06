import { hc } from "hono/client";
// import type { AppType } from "../../../../apps/worker/src/index";
// Point to Cloudflare Worker URL (local or production)
const WORKER_URL =
  process.env.NEXT_PUBLIC_WORKER_URL || "http://localhost:8787";

export const client = hc<any>(WORKER_URL) as any;
