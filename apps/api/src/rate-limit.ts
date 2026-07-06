import { RateLimitError } from "@quantalayer/shared";

export type RateLimiter = {
  readonly consume: (key: string) => Promise<void>;
};

type MemoryRateLimiterOptions = {
  readonly limit: number;
  readonly now?: () => number;
  readonly windowMs: number;
};

type Bucket = {
  readonly resetAt: number;
  readonly used: number;
};

export class MemoryRateLimiter implements RateLimiter {
  private readonly buckets = new Map<string, Bucket>();
  private readonly limit: number;
  private readonly now: () => number;
  private readonly windowMs: number;

  constructor(options: MemoryRateLimiterOptions) {
    this.limit = options.limit;
    this.now = options.now ?? Date.now;
    this.windowMs = options.windowMs;
  }

  async consume(key: string): Promise<void> {
    const now = this.now();
    const current = this.buckets.get(key);

    if (current === undefined || current.resetAt <= now) {
      this.buckets.set(key, {
        resetAt: now + this.windowMs,
        used: 1,
      });

      return;
    }

    if (current.used >= this.limit) {
      throw new RateLimitError("Scan rate limit exceeded", {
        detail: "Too many scan requests for this client IP",
      });
    }

    this.buckets.set(key, {
      resetAt: current.resetAt,
      used: current.used + 1,
    });
  }
}
