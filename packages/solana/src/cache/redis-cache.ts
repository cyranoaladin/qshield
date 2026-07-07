import type { CacheAdapter } from "../types.js";

export type RedisLike = {
  readonly del?: (key: string) => Promise<number> | number;
  readonly get: (key: string) => Promise<string | null> | string | null;
  readonly setex: (key: string, ttlSeconds: number, value: string) => Promise<unknown> | unknown;
};

export class RedisCache implements CacheAdapter {
  private readonly redis: RedisLike;

  constructor(redis: RedisLike) {
    this.redis = redis;
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);

    return value === null ? null : (JSON.parse(value) as T);
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
  }

  async delete(key: string): Promise<void> {
    await this.redis.del?.(key);
  }
}
