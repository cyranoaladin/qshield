import cors from "@fastify/cors";
import Fastify, { type FastifyInstance, type FastifyServerOptions } from "fastify";
import { z } from "zod";

import {
  QCI_VERSION,
  QES_VERSION,
  calculateQes,
  type QesInput,
  type QesResult,
} from "@quantalayer/scoring";
import {
  API_SERVICE_NAME,
  UpstreamDataError,
  ValidationError,
  toProblemJson,
} from "@quantalayer/shared";
import { MemoryCache, validateSolanaAddress, type CacheAdapter } from "@quantalayer/solana";

import { sha256Hex } from "./hash.js";
import { MemoryRateLimiter, type RateLimiter } from "./rate-limit.js";
import {
  MemoryScanAggregateStore,
  type ScanAggregateStore,
  type WaitlistStore,
} from "./storage.js";

type ScanProvider = {
  readonly scanAddress: (address: string) => Promise<{
    readonly accountClass: QesInput["accountClass"];
    readonly address: string;
    readonly concentrationRatio: number | null;
    readonly confidence: QesInput["confidence"];
    readonly daysSinceLastActivity: number | null;
    readonly observableAgeDays: number | null;
    readonly significantTokenAccounts: number;
    readonly stakedOrLockedUsd: number;
    readonly totalUsd: number;
    readonly warnings: readonly string[];
  }>;
};

export type ScanResponse = QesResult & {
  readonly cache: {
    readonly hit: boolean;
    readonly ttlSeconds: number;
  };
};

export type BuildServerOptions = {
  readonly cache?: CacheAdapter;
  readonly cluster?: "devnet" | "mainnet-beta";
  readonly corsOrigin?: string;
  readonly captureException?: (error: unknown) => void;
  readonly logger?: FastifyServerOptions["logger"];
  readonly rateLimiter?: RateLimiter;
  readonly scanCacheTtlSeconds?: number;
  readonly scanProvider?: ScanProvider;
  readonly scanStore?: ScanAggregateStore;
  readonly waitlistStore?: WaitlistStore;
};

const scanRequestSchema = z.object({
  address: z.string().trim().min(1).max(64),
});

const waitlistRequestSchema = z.object({
  consent: z.literal(true),
  email: z.string().trim().email().max(320).transform(normalizeEmail),
  source: z.string().trim().min(1).max(80).optional(),
  wallet: z.string().trim().min(1).max(64).optional(),
});

const defaultScanProvider: ScanProvider = {
  async scanAddress(): Promise<never> {
    throw new UpstreamDataError("Scan provider not configured");
  },
};

export function buildServer(options: BuildServerOptions = {}): FastifyInstance {
  const server = Fastify({
    logger: options.logger ?? false,
  });
  const cache = options.cache ?? new MemoryCache();
  const cluster = options.cluster ?? "mainnet-beta";
  const rateLimiter =
    options.rateLimiter ??
    new MemoryRateLimiter({
      limit: 10,
      windowMs: 60_000,
    });
  const scanCacheTtlSeconds = options.scanCacheTtlSeconds ?? 3_600;
  const scanProvider = options.scanProvider ?? defaultScanProvider;
  const memoryStore = new MemoryScanAggregateStore();
  const scanStore = options.scanStore ?? memoryStore;
  const waitlistStore = options.waitlistStore ?? memoryStore;

  void server.register(cors, {
    origin: options.corsOrigin ?? false,
  });

  server.addHook("onRequest", async (_request, reply) => {
    reply.header(
      "content-security-policy",
      "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
    );
    reply.header("cross-origin-resource-policy", "same-origin");
    reply.header("permissions-policy", "camera=(), microphone=(), geolocation=()");
    reply.header("referrer-policy", "no-referrer");
    reply.header("x-content-type-options", "nosniff");
    reply.header("x-frame-options", "DENY");
  });

  server.setErrorHandler((error, request, reply) => {
    const problem = toProblemJson(error, request.url);

    if (problem.status >= 500) {
      options.captureException?.(error);
    }

    request.log.warn(
      {
        code: problem.code,
        status: problem.status,
      },
      "request failed",
    );

    return reply.code(problem.status).type("application/problem+json").send(problem);
  });

  server.get("/healthz", async () => ({
    service: API_SERVICE_NAME,
    status: "ok",
  }));

  server.post("/api/v1/scan", async (request): Promise<ScanResponse> => {
    const parsed = scanRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new ValidationError("Invalid scan request body", {
        detail: parsed.error.message,
      });
    }

    const address = parsed.data.address;
    const addressValidation = validateSolanaAddress(address);

    if (!addressValidation.isValid) {
      throw new ValidationError("Invalid Solana address", {
        detail: "Address must be base58 encoded and decode to 32 bytes",
      });
    }

    const addressHash = sha256Hex(address);
    await rateLimiter.consume(sha256Hex(`ip:${request.ip}`));

    const cacheKey = scanCacheKey({
      addressHash,
      cluster,
    });
    const cached = await cache.get<QesResult>(cacheKey);

    if (cached !== null) {
      request.log.info(
        {
          addressHash,
          cacheHit: true,
          qci: cached.qci,
          qes: cached.qes,
          status: cached.status,
        },
        "scan cache hit",
      );

      return withCache(cached, true, scanCacheTtlSeconds);
    }

    const rawScan = await scanProvider.scanAddress(address);
    const scored = calculateQes({
      accountClass: rawScan.accountClass,
      address,
      concentrationRatio: rawScan.concentrationRatio,
      confidence: rawScan.confidence,
      daysSinceLastActivity: rawScan.daysSinceLastActivity,
      observableAgeDays: rawScan.observableAgeDays,
      scannedAt: new Date().toISOString(),
      significantTokenAccounts: rawScan.significantTokenAccounts,
      stakedOrLockedUsd: rawScan.stakedOrLockedUsd,
      totalUsd: rawScan.totalUsd,
    });
    const result: QesResult = {
      ...scored,
      warnings: [...new Set([...rawScan.warnings, ...scored.warnings])],
    };

    await cache.set(cacheKey, result, scanCacheTtlSeconds);
    await scanStore.recordScan({
      addressHash,
      createdAt: result.scannedAt,
      estimatedMigrationExposureValueUsd: result.estimatedMigrationExposureValueUsd,
      grade: result.grade,
      gradeDisplayed: result.gradeDisplayed,
      qci: result.qci,
      qciVersion: result.qciVersion,
      qes: result.qes,
      qesVersion: result.qesVersion,
      status: result.status,
    });

    request.log.info(
      {
        addressHash,
        cacheHit: false,
        qci: result.qci,
        qes: result.qes,
        status: result.status,
      },
      "scan completed",
    );

    return withCache(result, false, scanCacheTtlSeconds);
  });

  server.get("/api/v1/stats", async () => scanStore.getStats());

  server.post("/api/v1/waitlist", async (request) => {
    const parsed = waitlistRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new ValidationError("Invalid waitlist request body", {
        detail: parsed.error.message,
      });
    }

    if (parsed.data.wallet !== undefined) {
      const walletValidation = validateSolanaAddress(parsed.data.wallet);

      if (!walletValidation.isValid) {
        throw new ValidationError("Invalid optional wallet address", {
          detail: "Wallet must be a valid Solana address when provided",
        });
      }
    }

    const result = await waitlistStore.recordWaitlistEntry({
      consent: true,
      email: parsed.data.email,
      ...(parsed.data.source === undefined ? {} : { source: parsed.data.source }),
      ...(parsed.data.wallet === undefined ? {} : { wallet: parsed.data.wallet }),
    });

    request.log.info(
      {
        duplicate: result.duplicate,
        emailHash: sha256Hex(parsed.data.email),
      },
      "waitlist registration recorded",
    );

    return {
      duplicate: result.duplicate,
      message: "Waitlist registration recorded.",
      status: "ok",
    };
  });

  return server;
}

function withCache(result: QesResult, hit: boolean, ttlSeconds: number): ScanResponse {
  return {
    ...result,
    cache: {
      hit,
      ttlSeconds,
    },
  };
}

function scanCacheKey(options: {
  readonly addressHash: string;
  readonly cluster: "devnet" | "mainnet-beta";
}): string {
  return `scan:v1:${options.cluster}:qes-${QES_VERSION}:qci-${QCI_VERSION}:${options.addressHash}`;
}

function normalizeEmail(email: string): string {
  return email.toLowerCase();
}
