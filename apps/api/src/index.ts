import { config as loadDotenv } from "dotenv";
import { Redis } from "ioredis";
import { PrismaClient } from "@prisma/client";
import * as Sentry from "@sentry/node";

import { formatEnvWarning } from "@quantalayer/shared";
import { RedisCache } from "@quantalayer/solana";

import { readApiConfig } from "./config.js";
import { RedisRateLimiter } from "./redis-rate-limit.js";
import { buildRuntimeScanProvider } from "./runtime-scan-provider.js";
import { buildServer } from "./server.js";
import { PrismaMvpStore } from "./storage.js";

loadDotenv({ quiet: true });

const config = readApiConfig(process.env, {
  onWarning: (warning) => {
    console.warn(formatEnvWarning(warning));
  },
});

if (config.env.sentryDsn !== undefined) {
  Sentry.init({
    dsn: config.env.sentryDsn,
    environment: config.env.nodeEnv,
    tracesSampleRate: 0,
  });
}

const redis = new Redis(config.env.redisUrl, {
  lazyConnect: false,
  maxRetriesPerRequest: 2,
});
const prisma = new PrismaClient();
const server = buildServer({
  cache: new RedisCache(redis),
  cluster: config.env.solanaCluster,
  corsOrigin: config.corsOrigin,
  logger: {
    level: config.env.logLevel,
  },
  rateLimiter: new RedisRateLimiter(redis, {
    limit: config.env.rateLimitScansPerMinute,
    windowMs: 60_000,
  }),
  scanCacheTtlSeconds: config.env.scanCacheTtlSeconds,
  scanProvider: buildRuntimeScanProvider(config.env),
  scanStore: new PrismaMvpStore(prisma),
  waitlistStore: new PrismaMvpStore(prisma),
  ...(config.env.sentryDsn === undefined
    ? {}
    : {
        captureException: (error: unknown) => {
          Sentry.captureException(error);
        },
      }),
});

server.addHook("onClose", async () => {
  await prisma.$disconnect();
  redis.disconnect();
});

await server.listen({
  host: "0.0.0.0",
  port: config.port,
});
