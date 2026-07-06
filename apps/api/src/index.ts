import { config as loadDotenv } from "dotenv";
import { Redis } from "ioredis";

import { formatEnvWarning } from "@quantalayer/shared";
import { HeliusClient, JupiterPriceClient, RedisCache, scanAddress } from "@quantalayer/solana";

import { readApiConfig } from "./config.js";
import { MemoryRateLimiter } from "./rate-limit.js";
import { buildServer } from "./server.js";
import { MemoryScanAggregateStore } from "./storage.js";

loadDotenv({ quiet: true });

const config = readApiConfig(process.env, {
  onWarning: (warning) => {
    console.warn(formatEnvWarning(warning));
  },
});
const redis = new Redis(config.env.redisUrl, {
  lazyConnect: false,
  maxRetriesPerRequest: 2,
});
const helius = new HeliusClient({
  apiKey: config.env.heliusApiKey ?? "",
  rpcUrl: config.env.heliusRpcUrl,
});
const jupiter = new JupiterPriceClient({
  baseUrl: config.env.jupiterPriceUrl,
});
const server = buildServer({
  cache: new RedisCache(redis),
  corsOrigin: config.corsOrigin,
  logger: {
    level: config.env.logLevel,
  },
  rateLimiter: new MemoryRateLimiter({
    limit: config.env.rateLimitScansPerMinute,
    windowMs: 60_000,
  }),
  scanCacheTtlSeconds: config.env.scanCacheTtlSeconds,
  scanProvider: {
    scanAddress: async (address) =>
      scanAddress(address, {
        cluster: config.env.solanaCluster,
        helius,
        jupiter,
      }),
  },
  scanStore: new MemoryScanAggregateStore(),
});

server.addHook("onClose", async () => {
  redis.disconnect();
});

await server.listen({
  host: "0.0.0.0",
  port: config.port,
});
