import { describe, expect, it, vi } from "vitest";

import {
  ENV_KEYS,
  EnvValidationError,
  SERVER_ENV_KEYS,
  WEB_ENV_KEYS,
  assertScanProviderEnv,
  parseEnv,
  parseServerEnv,
  parseWebEnv,
  type RawServerEnv,
  type RawWebEnv,
} from "./env.js";

const baseServerEnv = {
  API_CORS_ORIGIN: "http://localhost:3000",
  API_PORT: "3001",
  DATABASE_URL: "postgresql://quantalayer:quantalayer@localhost:5432/quantalayer",
  HELIUS_API_KEY: "test-helius-key",
  HELIUS_RPC_URL: "https://mainnet.helius-rpc.com",
  JUPITER_PRICE_URL: "https://api.jup.ag/price/v2",
  LOG_LEVEL: "info",
  NODE_ENV: "development",
  RATE_LIMIT_SCANS_PER_MINUTE: "10",
  REDIS_URL: "redis://localhost:6379",
  SCAN_CACHE_TTL_SECONDS: "3600",
  SENTRY_DSN: "",
  SOLANA_CLUSTER: "mainnet-beta",
} satisfies RawServerEnv;

const baseWebEnv = {
  NEXT_PUBLIC_API_URL: "http://localhost:3001",
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: "",
  NODE_ENV: "development",
} satisfies RawWebEnv;

function rawServerEnv(overrides: Partial<RawServerEnv> = {}): RawServerEnv {
  return {
    ...baseServerEnv,
    ...overrides,
  };
}

function rawWebEnv(overrides: Partial<RawWebEnv> = {}): RawWebEnv {
  return {
    ...baseWebEnv,
    ...overrides,
  };
}

describe("environment keys", () => {
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

  it("splits server and web scopes without leaking public web variables into API boot", () => {
    expect(SERVER_ENV_KEYS).toEqual([
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
      "SENTRY_DSN",
      "LOG_LEVEL",
    ]);
    expect(WEB_ENV_KEYS).toEqual([
      "NODE_ENV",
      "NEXT_PUBLIC_API_URL",
      "NEXT_PUBLIC_PLAUSIBLE_DOMAIN",
    ]);
  });
});

describe("parseServerEnv", () => {
  it("parses valid environment values into typed config", () => {
    const env = parseServerEnv(rawServerEnv(), { onWarning: () => undefined });

    expect(env).toMatchObject({
      apiCorsOrigin: "http://localhost:3000",
      apiPort: 3001,
      databaseUrl: "postgresql://quantalayer:quantalayer@localhost:5432/quantalayer",
      heliusApiKey: "test-helius-key",
      logLevel: "info",
      nodeEnv: "development",
      rateLimitScansPerMinute: 10,
      scanCacheTtlSeconds: 3600,
      solanaCluster: "mainnet-beta",
    });
    expect(env.sentryDsn).toBeUndefined();
  });

  it("crashes loudly in production when the Helius key is missing", () => {
    expect(() =>
      parseServerEnv(
        rawServerEnv({
          HELIUS_API_KEY: "",
          NODE_ENV: "production",
        }),
      ),
    ).toThrow(/HELIUS_API_KEY/);
  });

  it("does not tolerate missing boot-required variables in development", () => {
    expect(() =>
      parseServerEnv(
        rawServerEnv({
          DATABASE_URL: "",
          NODE_ENV: "development",
        }),
      ),
    ).toThrow(EnvValidationError);
  });

  it("warns in development for missing optional and deferred scan variables", () => {
    const onWarning = vi.fn();

    const env = parseServerEnv(
      rawServerEnv({
        HELIUS_API_KEY: "",
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

  it("uses console.warn as the default warning handler", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    parseServerEnv(
      rawServerEnv({
        HELIUS_API_KEY: "",
        NODE_ENV: "development",
        SENTRY_DSN: "",
      }),
    );

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("HELIUS_API_KEY"));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("SENTRY_DSN"));

    warn.mockRestore();
  });

  it("requires the Helius key before a real scan can be attempted", () => {
    const env = parseServerEnv(
      rawServerEnv({
        HELIUS_API_KEY: "",
        NODE_ENV: "development",
      }),
      { onWarning: () => undefined },
    );

    expect(() => assertScanProviderEnv(env)).toThrow(/HELIUS_API_KEY/);
  });
});

describe("parseWebEnv", () => {
  it("parses public web runtime values", () => {
    const env = parseWebEnv(rawWebEnv(), { onWarning: () => undefined });

    expect(env).toEqual({
      nextPublicApiUrl: "http://localhost:3001",
      nodeEnv: "development",
    });
  });

  it("fails closed when its required public API URL is missing", () => {
    expect(() =>
      parseWebEnv(
        rawWebEnv({
          NEXT_PUBLIC_API_URL: "",
        }),
      ),
    ).toThrow(EnvValidationError);
  });

  it("warns by default for missing optional Plausible domain in development", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    parseWebEnv(rawWebEnv({ NEXT_PUBLIC_PLAUSIBLE_DOMAIN: "" }));

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("NEXT_PUBLIC_PLAUSIBLE_DOMAIN"));

    warn.mockRestore();
  });
});

describe("parseEnv", () => {
  it("keeps a full-env parser for tooling that needs both scopes", () => {
    const env = parseEnv(
      {
        ...rawServerEnv({ NODE_ENV: "production" }),
        ...rawWebEnv({ NODE_ENV: "production" }),
      },
      { onWarning: () => undefined },
    );

    expect(env).toMatchObject({
      apiPort: 3001,
      nextPublicApiUrl: "http://localhost:3001",
      nodeEnv: "production",
    });
  });
});
