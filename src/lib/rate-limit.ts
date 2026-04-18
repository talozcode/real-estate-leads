/**
 * Simple in-memory rate limiter.
 *
 * Limits each IP address to MAX_REQUESTS submissions per WINDOW_MS milliseconds.
 * This resets every time the server restarts.
 *
 * For a production app with multiple server instances, replace this with
 * a Redis-based rate limiter (e.g. using the `ioredis` package).
 */

interface RateLimitEntry {
  count: number;
  resetAt: number; // timestamp in ms
}

const store = new Map<string, RateLimitEntry>();

const MAX_REQUESTS = 5;            // max submissions per window
const WINDOW_MS = 10 * 60 * 1000; // 10-minute rolling window

export function checkRateLimit(ip: string): {
  allowed: boolean;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  const entry = store.get(ip);

  // No entry, or the window has expired — start a fresh window
  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  // Window is still active and limit is exceeded
  if (entry.count >= MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  // Window is active and under the limit
  entry.count++;
  return { allowed: true };
}
