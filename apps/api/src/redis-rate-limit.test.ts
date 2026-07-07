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
    expect(redis.evalCalls()).toEqual([
      {
        keyContainsRawIp: false,
        keyCount: 1,
        ttlSeconds: "60",
      },
      {
        keyContainsRawIp: false,
        keyCount: 1,
        ttlSeconds: "60",
      },
      {
        keyContainsRawIp: false,
        keyCount: 1,
        ttlSeconds: "60",
      },
    ]);
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
  private readonly calls: Array<{
    readonly keyContainsRawIp: boolean;
    readonly keyCount: number;
    readonly ttlSeconds: string;
  }> = [];
  private readonly fail: boolean;

  constructor(options: { readonly fail?: boolean } = {}) {
    this.fail = options.fail ?? false;
  }

  async eval(_script: string, keyCount: number, key: string, ttlSeconds: string): Promise<number> {
    if (this.fail) {
      throw new Error("redis unavailable");
    }

    this.calls.push({
      keyContainsRawIp: key.includes("192.0.2.10"),
      keyCount,
      ttlSeconds,
    });
    const next = (this.counters.get(key) ?? 0) + 1;
    this.counters.set(key, next);

    return next;
  }

  keys(): string[] {
    return [...this.counters.keys()];
  }

  evalCalls(): Array<{
    readonly keyContainsRawIp: boolean;
    readonly keyCount: number;
    readonly ttlSeconds: string;
  }> {
    return this.calls;
  }
}
