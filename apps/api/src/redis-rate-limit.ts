import { InfrastructureUnavailableError, RateLimitError } from "@quantalayer/shared";

import { sha256Hex } from "./hash.js";
import type { RateLimiter } from "./rate-limit.js";

type RedisLike = {
  readonly eval: (script: string, keyCount: number, ...args: string[]) => Promise<unknown>;
};

type RedisRateLimiterOptions = {
  readonly keyPrefix?: string;
  readonly limit: number;
  readonly windowMs: number;
};

export class RedisRateLimiter implements RateLimiter {
  private readonly keyPrefix: string;
  private readonly limit: number;
  private readonly redis: RedisLike;
  private readonly windowSeconds: number;

  constructor(redis: RedisLike, options: RedisRateLimiterOptions) {
    this.keyPrefix = options.keyPrefix ?? "rate:scan";
    this.limit = options.limit;
    this.redis = redis;
    this.windowSeconds = Math.max(1, Math.ceil(options.windowMs / 1000));
  }

  async consume(key: string): Promise<void> {
    const redisKey = `${this.keyPrefix}:${sha256Hex(key)}`;

    try {
      const count = Number(
        await this.redis.eval(RATE_LIMIT_LUA_SCRIPT, 1, redisKey, String(this.windowSeconds)),
      );

      if (count > this.limit) {
        throw new RateLimitError("Scan rate limit exceeded", {
          detail: "Too many scan requests for this client IP",
        });
      }
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error;
      }

      throw new InfrastructureUnavailableError("Rate limiter unavailable", {
        detail: error instanceof Error ? error.message : "Redis rate limit operation failed",
      });
    }
  }
}

const RATE_LIMIT_LUA_SCRIPT = `
local current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("EXPIRE", KEYS[1], ARGV[1])
end
return current
`;
