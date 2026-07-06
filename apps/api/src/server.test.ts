import { describe, expect, it } from "vitest";

import { calculateQci } from "@quantalayer/scoring";
import { UpstreamDataError } from "@quantalayer/shared";
import { MemoryCache, type RawWalletScan } from "@quantalayer/solana";

import { MemoryRateLimiter } from "./rate-limit.js";
import { buildServer } from "./server.js";
import { MemoryScanAggregateStore } from "./storage.js";

describe("buildServer", () => {
  it("serves the health endpoint", async () => {
    const server = buildServer();

    const response = await server.inject({
      method: "GET",
      url: "/healthz",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      service: "quantalayer-api",
      status: "ok",
    });

    await server.close();
  });

  it("rejects invalid scan addresses with problem+json", async () => {
    const context = testContext();
    const server = buildServer(context.options);

    const response = await server.inject({
      method: "POST",
      payload: { address: "not-base58-0000" },
      url: "/api/v1/scan",
    });

    expect(response.statusCode).toBe(400);
    expect(response.headers["content-type"]).toContain("application/problem+json");
    expect(response.json()).toMatchObject({
      code: "VALIDATION_ERROR",
      status: 400,
    });
    expect(context.calls).toBe(0);

    await server.close();
  });

  it("scans, caches, and persists only aggregate rows without raw addresses", async () => {
    const context = testContext();
    const server = buildServer(context.options);
    const address = "11111111111111111111111111111111";

    const first = await server.inject({
      method: "POST",
      payload: { address },
      url: "/api/v1/scan",
    });
    const second = await server.inject({
      method: "POST",
      payload: { address },
      url: "/api/v1/scan",
    });

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
    expect(first.json()).toMatchObject({
      address,
      cache: { hit: false, ttlSeconds: 300 },
      gradeDisplayed: true,
      qci: calculateQci(rawWalletScan(address).confidence),
    });
    expect(second.json()).toMatchObject({
      address,
      cache: { hit: true, ttlSeconds: 300 },
    });
    expect(context.calls).toBe(1);
    expect(context.store.rows()).toHaveLength(1);
    expect(context.store.rows()[0]?.addressHash).not.toBe(address);
    expect(JSON.stringify(context.store.rows())).not.toContain(address);

    await server.close();
  });

  it("fails closed on provider errors", async () => {
    const context = testContext({
      scanAddress: async () => {
        throw new UpstreamDataError("Provider unavailable");
      },
    });
    const server = buildServer(context.options);

    const response = await server.inject({
      method: "POST",
      payload: { address: "11111111111111111111111111111111" },
      url: "/api/v1/scan",
    });

    expect(response.statusCode).toBe(502);
    expect(response.json()).toMatchObject({
      code: "UPSTREAM_DATA_ERROR",
      status: 502,
    });
    expect(context.store.rows()).toHaveLength(0);

    await server.close();
  });

  it("returns a problem response on invalid provider-to-scoring input", async () => {
    const context = testContext({
      scanAddress: async (address) => ({
        ...rawWalletScan(address),
        totalUsd: -1,
      }),
    });
    const server = buildServer(context.options);

    const response = await server.inject({
      method: "POST",
      payload: { address: "11111111111111111111111111111111" },
      url: "/api/v1/scan",
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      code: "VALIDATION_ERROR",
    });
    expect(context.store.rows()).toHaveLength(0);

    await server.close();
  });

  it("rate limits scan requests by client IP", async () => {
    const context = testContext({
      rateLimitScansPerMinute: 1,
    });
    const server = buildServer(context.options);
    const request = {
      method: "POST" as const,
      payload: { address: "11111111111111111111111111111111" },
      url: "/api/v1/scan",
    };

    expect((await server.inject(request)).statusCode).toBe(200);
    const limited = await server.inject(request);

    expect(limited.statusCode).toBe(429);
    expect(limited.json()).toMatchObject({
      code: "RATE_LIMIT_ERROR",
      status: 429,
    });

    await server.close();
  });

  it("returns aggregate stats without raw addresses", async () => {
    const context = testContext();
    const server = buildServer(context.options);

    await server.inject({
      method: "POST",
      payload: { address: "11111111111111111111111111111111" },
      url: "/api/v1/scan",
    });
    const stats = await server.inject({
      method: "GET",
      url: "/api/v1/stats",
    });

    expect(stats.statusCode).toBe(200);
    expect(stats.json()).toMatchObject({
      averageQci: expect.any(Number),
      gradeDistribution: expect.objectContaining({ B: 1 }),
      totalScans: 1,
    });
    expect(JSON.stringify(stats.json())).not.toContain("11111111111111111111111111111111");

    await server.close();
  });

  it("records waitlist entries with explicit consent", async () => {
    const context = testContext();
    const server = buildServer(context.options);

    const response = await server.inject({
      method: "POST",
      payload: {
        consent: true,
        email: "Research@QuantaLayer.App",
        source: "mvp-test",
        wallet: "11111111111111111111111111111111",
      },
      url: "/api/v1/waitlist",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      duplicate: false,
      message: "Waitlist registration recorded.",
      status: "ok",
    });
    expect(context.store.waitlistRows()).toEqual([
      {
        consent: true,
        email: "research@quantalayer.app",
        source: "mvp-test",
        wallet: "11111111111111111111111111111111",
      },
    ]);

    await server.close();
  });

  it("rejects invalid waitlist emails", async () => {
    const context = testContext();
    const server = buildServer(context.options);

    const response = await server.inject({
      method: "POST",
      payload: {
        consent: true,
        email: "not-an-email",
      },
      url: "/api/v1/waitlist",
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      code: "VALIDATION_ERROR",
      status: 400,
    });
    expect(context.store.waitlistRows()).toHaveLength(0);

    await server.close();
  });

  it("requires explicit waitlist consent", async () => {
    const context = testContext();
    const server = buildServer(context.options);

    const response = await server.inject({
      method: "POST",
      payload: {
        consent: false,
        email: "research@quantalayer.app",
      },
      url: "/api/v1/waitlist",
    });

    expect(response.statusCode).toBe(400);
    expect(context.store.waitlistRows()).toHaveLength(0);

    await server.close();
  });

  it("deduplicates waitlist entries idempotently", async () => {
    const context = testContext();
    const server = buildServer(context.options);
    const request = {
      method: "POST" as const,
      payload: {
        consent: true,
        email: "research@quantalayer.app",
      },
      url: "/api/v1/waitlist",
    };

    expect((await server.inject(request)).json()).toMatchObject({
      duplicate: false,
    });
    expect((await server.inject(request)).json()).toMatchObject({
      duplicate: true,
    });
    expect(context.store.waitlistRows()).toHaveLength(1);

    await server.close();
  });

  it("rejects invalid optional waitlist wallets", async () => {
    const context = testContext();
    const server = buildServer(context.options);

    const response = await server.inject({
      method: "POST",
      payload: {
        consent: true,
        email: "research@quantalayer.app",
        wallet: "not-base58-0000",
      },
      url: "/api/v1/waitlist",
    });

    expect(response.statusCode).toBe(400);
    expect(context.store.waitlistRows()).toHaveLength(0);

    await server.close();
  });
});

function testContext(
  overrides: {
    readonly rateLimitScansPerMinute?: number;
    readonly scanAddress?: (address: string) => Promise<RawWalletScan>;
  } = {},
) {
  let calls = 0;
  const cache = new MemoryCache();
  const store = new MemoryScanAggregateStore();
  const scanAddress =
    overrides.scanAddress ??
    (async (address: string) => {
      calls += 1;

      return rawWalletScan(address);
    });

  return {
    get calls() {
      return calls;
    },
    options: {
      cache,
      corsOrigin: "http://localhost:3000",
      rateLimiter: new MemoryRateLimiter({
        limit: overrides.rateLimitScansPerMinute ?? 10,
        windowMs: 60_000,
      }),
      scanCacheTtlSeconds: 300,
      scanProvider: { scanAddress },
      scanStore: store,
      waitlistStore: store,
    },
    store,
  };
}

function rawWalletScan(address: string): RawWalletScan {
  return {
    accountClass: "system",
    address,
    concentrationRatio: 0.5,
    confidence: {
      accountClassified: 1,
      dataFreshness: 1,
      defiPositions: 1,
      nftCnftCoverage: 1,
      resolvedPrices: 1,
      rpcDasCompleteness: 1,
      stakeAccounts: 1,
    },
    daysSinceLastActivity: 2,
    observableAgeDays: 120,
    significantTokenAccounts: 2,
    solBalanceLamports: 1_000_000_000n,
    source: {
      cluster: "mainnet-beta",
      priceProvider: "jupiter",
      rpcProvider: "helius",
    },
    stakedOrLockedUsd: 5_000,
    tokenAccountsCount: 2,
    totalUsd: 50_000,
    warnings: [],
  };
}
