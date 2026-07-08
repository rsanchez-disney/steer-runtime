/**
 * Retry utility with exponential backoff for Appium operations.
 * Usage: await withRetry(() => someAppiumCall(), { maxAttempts: 3 });
 */

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: Error) => boolean;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts || 3;
  const baseDelay = options.baseDelayMs || 2000;
  const maxDelay = options.maxDelayMs || 8000;
  const shouldRetry = options.shouldRetry || defaultShouldRetry;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;

      if (attempt === maxAttempts || !shouldRetry(err)) {
        throw err;
      }

      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}

function defaultShouldRetry(error: Error): boolean {
  const msg = error.message.toLowerCase();
  // Don't retry on session-level errors or invalid element errors
  if (msg.includes("no such session") || msg.includes("invalid session")) return false;
  if (msg.includes("no such element")) return false;
  // Retry on timeouts, connection errors, and stale elements
  if (msg.includes("timeout") || msg.includes("econnrefused") || msg.includes("stale")) return true;
  // Retry on generic server errors
  if (msg.includes("500") || msg.includes("502") || msg.includes("503")) return true;
  return false;
}
