/**
 * In-memory sliding-window rate limiter for API route protection.
 * Protects authentication endpoints from credential-stuffing and brute-force attacks.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export class MemoryRateLimiter {
  private store: Map<string, RateLimitRecord> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Periodic cleanup of expired entries every 2 minutes
    const interval = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.store.entries()) {
        if (now > record.resetTime) {
          this.store.delete(key);
        }
      }
    }, 2 * 60 * 1000);

    if (interval.unref) {
      interval.unref();
    }
  }

  public check(key: string): { success: boolean; remaining: number; reset: number } {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now > record.resetTime) {
      this.store.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return {
        success: true,
        remaining: this.maxRequests - 1,
        reset: Math.ceil((now + this.windowMs) / 1000),
      };
    }

    if (record.count >= this.maxRequests) {
      return {
        success: false,
        remaining: 0,
        reset: Math.ceil(record.resetTime / 1000),
      };
    }

    record.count += 1;
    return {
      success: true,
      remaining: this.maxRequests - record.count,
      reset: Math.ceil(record.resetTime / 1000),
    };
  }

  /**
   * Resets rate limit for a given key (e.g. after successful login)
   */
  public reset(key: string): void {
    this.store.delete(key);
  }
}

// 10 login attempts per minute per IP
export const loginRateLimiter = new MemoryRateLimiter(10, 60 * 1000);

// 5 signup attempts per minute per IP
export const signupRateLimiter = new MemoryRateLimiter(5, 60 * 1000);

// 30 AI requests per minute per IP
export const aiRateLimiter = new MemoryRateLimiter(30, 60 * 1000);

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}
