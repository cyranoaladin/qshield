import { describe, expect, it } from "vitest";

import type { ServerEnv } from "@quantalayer/shared";

import { buildRuntimeScanProvider } from "./runtime-scan-provider.js";

describe("buildRuntimeScanProvider", () => {
  it("fails closed before constructing Helius when HELIUS_API_KEY is missing", async () => {
    let heliusConstructed = false;
    const provider = buildRuntimeScanProvider(serverEnvWithoutHeliusKey(), {
      createHeliusClient: () => {
        heliusConstructed = true;
        throw new Error("Helius should not be constructed");
      },
    });

    await expect(provider.scanAddress("11111111111111111111111111111111")).rejects.toMatchObject({
      code: "ENV_VALIDATION_ERROR",
      status: 500,
    });
    expect(heliusConstructed).toBe(false);
  });
});

function serverEnvWithoutHeliusKey(): ServerEnv {
  return {
    apiCorsOrigin: "http://localhost:3000",
    apiPort: 3001,
    databaseUrl: "postgresql://quantalayer:quantalayer@localhost:5432/quantalayer",
    heliusRpcUrl: "https://mainnet.helius-rpc.com",
    jupiterPriceUrl: "https://api.jup.ag/price/v2",
    logLevel: "silent",
    nodeEnv: "development",
    rateLimitScansPerMinute: 10,
    redisUrl: "redis://localhost:6379",
    scanCacheTtlSeconds: 3600,
    solanaCluster: "mainnet-beta",
  };
}
