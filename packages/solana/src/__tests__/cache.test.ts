import { describe, expect, it } from "vitest";

import { MemoryCache } from "../cache/memory-cache.js";
import { RedisCache } from "../cache/redis-cache.js";

describe("cache adapters", () => {
  it("stores and expires values in memory", async () => {
    let now = 1000;
    const cache = new MemoryCache({ now: () => now });

    await cache.set("scan:test", { ok: true }, 10);
    expect(await cache.get<{ ok: boolean }>("scan:test")).toEqual({ ok: true });

    now = 11_001;
    expect(await cache.get("scan:test")).toBeNull();
  });

  it("stores JSON values through a Redis-like client", async () => {
    const writes: string[] = [];
    const redis = {
      get: async () => '{"ok":true}',
      setex: async (key: string, ttl: number, value: string) => {
        writes.push(`${key}:${ttl}:${value}`);

        return "OK";
      },
    };
    const cache = new RedisCache(redis);

    await cache.set("scan:test", { ok: true }, 60);

    expect(await cache.get("scan:test")).toEqual({ ok: true });
    expect(writes).toEqual(['scan:test:60:{"ok":true}']);
  });
});
