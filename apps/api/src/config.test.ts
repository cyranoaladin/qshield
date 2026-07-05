import { describe, expect, it } from "vitest";

import { EnvValidationError, type RawServerEnv } from "@qshield/shared";

import { readApiConfig } from "./config.js";

const validEnv = {
  API_CORS_ORIGIN: "http://localhost:3000",
  API_PORT: "3001",
  DATABASE_URL: "postgresql://qshield:qshield@localhost:5432/qshield",
  HELIUS_API_KEY: "test-helius-key",
  HELIUS_RPC_URL: "https://mainnet.helius-rpc.com",
  JUPITER_PRICE_URL: "https://api.jup.ag/price/v2",
  LOG_LEVEL: "info",
  NODE_ENV: "production",
  RATE_LIMIT_SCANS_PER_MINUTE: "10",
  REDIS_URL: "redis://localhost:6379",
  SCAN_CACHE_TTL_SECONDS: "3600",
  SENTRY_DSN: "",
  SOLANA_CLUSTER: "mainnet-beta",
} satisfies RawServerEnv;

describe("readApiConfig", () => {
  it("returns API boot config from the shared env parser", () => {
    expect(readApiConfig(validEnv)).toEqual({
      corsOrigin: "http://localhost:3000",
      env: expect.objectContaining({
        heliusApiKey: "test-helius-key",
        nodeEnv: "production",
      }),
      port: 3001,
    });
  });

  it("throws an explicit env validation error when API boot env is missing", () => {
    expect(() =>
      readApiConfig({
        ...validEnv,
        API_PORT: "",
      }),
    ).toThrow(EnvValidationError);
  });

  it("does not require NEXT_PUBLIC variables for API boot", () => {
    expect(readApiConfig(validEnv)).toMatchObject({
      corsOrigin: "http://localhost:3000",
      port: 3001,
    });
  });
});
