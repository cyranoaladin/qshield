import { describe, expect, it, vi } from "vitest";

import {
  ENV_KEYS,
  EnvValidationError,
  assertScanProviderEnv,
  parseEnv,
  type RawEnv,
} from "./env.js";

const baseEnv = {
  API_CORS_ORIGIN: "http://localhost:3000",
  API_PORT: "3001",
  DATABASE_URL: "postgresql://qshield:qshield@localhost:5432/qshield",
  HELIUS_API_KEY: "test-helius-key",
  HELIUS_RPC_URL: "https://mainnet.helius-rpc.com",
  JUPITER_PRICE_URL: "https://api.jup.ag/price/v2",
  LOG_LEVEL: "info",
  NEXT_PUBLIC_API_URL: "http://localhost:3001",
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: "",
  NODE_ENV: "development",
  RATE_LIMIT_SCANS_PER_MINUTE: "10",
  REDIS_URL: "redis://localhost:6379",
  SCAN_CACHE_TTL_SECONDS: "3600",
  SENTRY_DSN: "",
  SOLANA_CLUSTER: "mainnet-beta",
} satisfies RawEnv;

function rawEnv(overrides: Partial<RawEnv> = {}): RawEnv {
  return {
    ...baseEnv,
    ...overrides,
  };
}

describe("parseEnv", () => {
  it("covers every variable from .env.example", () => {
    expect(ENV_KEYS).toEqual([
      "NODE_ENV",
      "API_PORT",
      "API_CORS_ORIGIN",
      "HELIUS_API_KEY",
      "HELIUS_RPC_URL",
      "SOLANA_CLUSTER",
      "JUPITER_PRICE_URL",
      "DATABASE_URL",
      "REDIS_URL",
      "SCAN_CACHE_TTL_SECONDS",
      "RATE_LIMIT_SCANS_PER_MINUTE",
      "NEXT_PUBLIC_API_URL",
      "NEXT_PUBLIC_PLAUSIBLE_DOMAIN",
      "SENTRY_DSN",
      "LOG_LEVEL",
    ]);
  });

  it("parses valid environment values into typed config", () => {
    const env = parseEnv(rawEnv());

    expect(env).toMatchObject({
      apiCorsOrigin: "http://localhost:3000",
      apiPort: 3001,
      databaseUrl: "postgresql://qshield:qshield@localhost:5432/qshield",
      heliusApiKey: "test-helius-key",
      logLevel: "info",
      nodeEnv: "development",
      rateLimitScansPerMinute: 10,
      scanCacheTtlSeconds: 3600,
      solanaCluster: "mainnet-beta",
    });
    expect(env.nextPublicPlausibleDomain).toBeUndefined();
    expect(env.sentryDsn).toBeUndefined();
  });

  it("crashes loudly in production when the Helius key is missing", () => {
    expect(() =>
      parseEnv(
        rawEnv({
          HELIUS_API_KEY: "",
          NODE_ENV: "production",
        }),
      ),
    ).toThrow(/HELIUS_API_KEY/);
  });

  it("does not tolerate missing boot-required variables in development", () => {
    expect(() =>
      parseEnv(
        rawEnv({
          DATABASE_URL: "",
          NODE_ENV: "development",
        }),
      ),
    ).toThrow(EnvValidationError);
  });

  it("warns in development for missing optional and deferred scan variables", () => {
    const onWarning = vi.fn();

    const env = parseEnv(
      rawEnv({
        HELIUS_API_KEY: "",
        NEXT_PUBLIC_PLAUSIBLE_DOMAIN: "",
        NODE_ENV: "development",
        SENTRY_DSN: "",
      }),
      { onWarning },
    );

    expect(env.heliusApiKey).toBeUndefined();
    expect(onWarning).toHaveBeenCalledWith(
      expect.objectContaining({
        variable: "HELIUS_API_KEY",
        severity: "deferred-required",
      }),
    );
    expect(onWarning).toHaveBeenCalledWith(
      expect.objectContaining({
        variable: "SENTRY_DSN",
        severity: "optional",
      }),
    );
  });

  it("requires the Helius key before a real scan can be attempted", () => {
    const env = parseEnv(
      rawEnv({
        HELIUS_API_KEY: "",
        NODE_ENV: "development",
      }),
    );

    expect(() => assertScanProviderEnv(env)).toThrow(/HELIUS_API_KEY/);
  });
});
