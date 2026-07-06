import { describe, expect, it } from "vitest";

import { RedisRateLimiter } from "./redis-rate-limit.js";

describe("RedisRateLimiter", () => {
  it("hashes keys and enforces the configured window limit", async () => {
    const redis = new FakeRedis();
    const limiter = new RedisRateLimiter(redis, {
      limit: 2,
      windowMs: 60_000,
    });

    await limiter.consume("192.0.2.10");
    await limiter.consume("192.0.2.10");

    await expect(limiter.consume("192.0.2.10")).rejects.toMatchObject({
      code: "RATE_LIMIT_ERROR",
      status: 429,
    });
    expect(redis.keys()).toHaveLength(1);
    expect(redis.keys()[0]).not.toContain("192.0.2.10");
    expect(redis.expires()).toEqual([60]);
  });

  it("fails closed when Redis cannot be reached", async () => {
    const redis = new FakeRedis({ fail: true });
    const limiter = new RedisRateLimiter(redis, {
      limit: 10,
      windowMs: 60_000,
    });

    await expect(limiter.consume("192.0.2.10")).rejects.toMatchObject({
      code: "INFRASTRUCTURE_UNAVAILABLE",
      status: 503,
    });
  });
});

class FakeRedis {
  private readonly counters = new Map<string, number>();
  private readonly expireSeconds: number[] = [];
  private readonly fail: boolean;

  constructor(options: { readonly fail?: boolean } = {}) {
    this.fail = options.fail ?? false;
  }

  async incr(key: string): Promise<number> {
    if (this.fail) {
      throw new Error("redis unavailable");
    }

    const next = (this.counters.get(key) ?? 0) + 1;
    this.counters.set(key, next);

    return next;
  }

  async expire(_key: string, seconds: number): Promise<number> {
    if (this.fail) {
      throw new Error("redis unavailable");
    }

    this.expireSeconds.push(seconds);

    return 1;
  }

  keys(): string[] {
    return [...this.counters.keys()];
  }

  expires(): number[] {
    return this.expireSeconds;
  }
}
