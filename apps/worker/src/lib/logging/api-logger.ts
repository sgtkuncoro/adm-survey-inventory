/**
 * API Request Logger
 * Logs all requests/responses to external providers for debugging and auditing.
 */

import type { TypedSupabaseClient } from "@packages/supabase";

// ============================================================================
// Types
// ============================================================================

export interface ApiLogEntry {
  providerId: string;
  method: string;
  endpoint: string;
  requestUrl: string;
  requestHeaders?: Record<string, string>;
  requestBody?: unknown;
  responseStatus?: number;
  responseBody?: unknown;
  responseHeaders?: Record<string, string>;
  durationMs?: number;
  errorMessage?: string;
  syncJobId?: string;
}

export interface ApiLoggerConfig {
  db: TypedSupabaseClient;
  providerId: string;
  syncJobId?: string;
}

// Headers to exclude from logging (security)
const SENSITIVE_HEADERS = [
  "authorization",
  "x-api-key",
  "api-key",
  "cookie",
  "set-cookie",
];

// ============================================================================
// ApiLogger Class
// ============================================================================

export class ApiLogger {
  private db: TypedSupabaseClient;
  private providerId: string;
  private syncJobId?: string;

  constructor(config: ApiLoggerConfig) {
    this.db = config.db;
    this.providerId = config.providerId;
    this.syncJobId = config.syncJobId;
  }

  /**
   * Log an API request and response
   */
  async log(entry: Omit<ApiLogEntry, "providerId">): Promise<void> {
    try {
      const sanitizedHeaders = this.sanitizeHeaders(entry.requestHeaders);
      const sanitizedResponseHeaders = this.sanitizeHeaders(entry.responseHeaders);

      await this.db.from("api_request_logs").insert({
        provider_id: this.providerId,
        method: entry.method,
        endpoint: entry.endpoint,
        request_url: this.sanitizeUrl(entry.requestUrl),
        request_headers: sanitizedHeaders,
        request_body: entry.requestBody ?? null,
        response_status: entry.responseStatus ?? null,
        response_body: this.truncateBody(entry.responseBody),
        response_headers: sanitizedResponseHeaders,
        duration_ms: entry.durationMs ?? null,
        error_message: entry.errorMessage ?? null,
        sync_job_id: entry.syncJobId ?? this.syncJobId ?? null,
      });
    } catch (error) {
      // Don't throw - logging should not break the main flow
      console.error("[ApiLogger] Failed to log request:", error);
    }
  }

  /**
   * Wrap a fetch call with automatic logging
   */
  async loggedFetch(
    url: string,
    options: RequestInit = {},
    endpoint: string = url
  ): Promise<Response> {
    const startTime = Date.now();
    const method = options.method ?? "GET";

    let response: Response | null = null;
    let responseBody: unknown = null;
    let errorMessage: string | null = null;

    try {
      response = await fetch(url, options);
      
      // Clone response to read body without consuming it
      const clonedResponse = response.clone();
      try {
        responseBody = await clonedResponse.json();
      } catch {
        // Response may not be JSON
        responseBody = await clonedResponse.text();
      }
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      const durationMs = Date.now() - startTime;

      // Parse request body if present
      let requestBody: unknown = null;
      if (options.body) {
        try {
          requestBody = JSON.parse(options.body as string);
        } catch {
          requestBody = options.body;
        }
      }

      // Extract headers
      const requestHeaders: Record<string, string> = {};
      if (options.headers) {
        if (options.headers instanceof Headers) {
          options.headers.forEach((value, key) => {
            requestHeaders[key] = value;
          });
        } else if (Array.isArray(options.headers)) {
          options.headers.forEach(([key, value]) => {
            requestHeaders[key] = value;
          });
        } else {
          Object.assign(requestHeaders, options.headers);
        }
      }

      // Extract response headers
      const responseHeaders: Record<string, string> = {};
      if (response) {
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });
      }

      await this.log({
        method,
        endpoint: this.extractEndpoint(endpoint),
        requestUrl: url,
        requestHeaders,
        requestBody,
        responseStatus: response?.status,
        responseBody,
        responseHeaders,
        durationMs,
        errorMessage: errorMessage ?? undefined,
      });
    }

    return response!;
  }

  /**
   * Remove sensitive headers from logging
   */
  private sanitizeHeaders(
    headers?: Record<string, string>
  ): Record<string, string> | null {
    if (!headers) return null;

    const sanitized: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      if (SENSITIVE_HEADERS.includes(key.toLowerCase())) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  /**
   * Remove sensitive query params from URL
   */
  private sanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      // Remove any api_key or token params
      const sensitiveParams = ["api_key", "token", "key", "secret"];
      sensitiveParams.forEach((param) => {
        if (parsed.searchParams.has(param)) {
          parsed.searchParams.set(param, "[REDACTED]");
        }
      });
      return parsed.toString();
    } catch {
      return url;
    }
  }

  /**
   * Extract endpoint path from full URL
   */
  private extractEndpoint(urlOrEndpoint: string): string {
    try {
      const parsed = new URL(urlOrEndpoint);
      return parsed.pathname;
    } catch {
      return urlOrEndpoint;
    }
  }

  /**
   * Truncate large response bodies to prevent storage issues
   * Max ~500KB for JSONB
   */
  private truncateBody(body: unknown): unknown {
    if (!body) return null;

    const str = JSON.stringify(body);
    const maxBytes = 500 * 1024; // 500KB

    if (str.length > maxBytes) {
      return {
        _truncated: true,
        _originalSize: str.length,
        _message: `Response body truncated from ${str.length} bytes`,
      };
    }

    return body;
  }
}

/**
 * Create an ApiLogger instance
 */
export function createApiLogger(config: ApiLoggerConfig): ApiLogger {
  return new ApiLogger(config);
}
