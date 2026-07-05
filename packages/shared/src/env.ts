import { z } from "zod";

import { QShieldError } from "./errors.js";

export const ENV_KEYS = [
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
] as const;

export type EnvKey = (typeof ENV_KEYS)[number];
export type RawEnv = Record<EnvKey, string | undefined>;

export type EnvWarningSeverity = "optional" | "deferred-required";

export type EnvWarning = {
  readonly message: string;
  readonly severity: EnvWarningSeverity;
  readonly variable: EnvKey;
};

export type ParseEnvOptions = {
  readonly onWarning?: (warning: EnvWarning) => void;
};

export type Env = {
  readonly apiCorsOrigin: string;
  readonly apiPort: number;
  readonly databaseUrl: string;
  readonly heliusApiKey?: string;
  readonly heliusRpcUrl: string;
  readonly jupiterPriceUrl: string;
  readonly logLevel: LogLevel;
  readonly nextPublicApiUrl: string;
  readonly nextPublicPlausibleDomain?: string;
  readonly nodeEnv: NodeEnv;
  readonly rateLimitScansPerMinute: number;
  readonly redisUrl: string;
  readonly scanCacheTtlSeconds: number;
  readonly sentryDsn?: string;
  readonly solanaCluster: SolanaCluster;
};

export type EnvWithScanProvider = Env & {
  readonly heliusApiKey: string;
};

export type NodeEnv = "development" | "production" | "test";
export type SolanaCluster = "devnet" | "mainnet-beta";
export type LogLevel = "debug" | "error" | "fatal" | "info" | "silent" | "trace" | "warn";

type EnvValidationIssue = {
  readonly message: string;
  readonly variable: EnvKey | "unknown";
};

export class EnvValidationError extends QShieldError {
  readonly issues: readonly EnvValidationIssue[];

  constructor(issues: readonly EnvValidationIssue[]) {
    const detail = issues.map((issue) => `${issue.variable}: ${issue.message}`).join("; ");

    super(`Invalid Q-Shield environment: ${detail}`, {
      code: "ENV_VALIDATION_ERROR",
      detail,
      status: 500,
    });
    this.name = "EnvValidationError";
    this.issues = issues;
  }
}

const integerEnv = (variable: EnvKey, min: number, max: number) =>
  z
    .string()
    .trim()
    .regex(/^\d+$/, `${variable} must be an integer`)
    .transform((value) => Number.parseInt(value, 10))
    .refine((value) => value >= min && value <= max, {
      message: `${variable} must be between ${min} and ${max}`,
    });

const requiredString = (variable: EnvKey) => z.string().trim().min(1, `${variable} is required`);

const requiredUrl = (variable: EnvKey) =>
  requiredString(variable).url(`${variable} must be a valid URL`);

const optionalString = z.preprocess(emptyStringToUndefined, z.string().trim().min(1).optional());

const optionalUrl = (variable: EnvKey) =>
  z.preprocess(
    emptyStringToUndefined,
    z.string().trim().url(`${variable} must be a valid URL`).optional(),
  );

const rawEnvSchema = z
  .object({
    API_CORS_ORIGIN: requiredUrl("API_CORS_ORIGIN"),
    API_PORT: integerEnv("API_PORT", 1, 65_535),
    DATABASE_URL: requiredUrl("DATABASE_URL"),
    HELIUS_API_KEY: optionalString,
    HELIUS_RPC_URL: requiredUrl("HELIUS_RPC_URL"),
    JUPITER_PRICE_URL: requiredUrl("JUPITER_PRICE_URL"),
    LOG_LEVEL: z.enum(["debug", "error", "fatal", "info", "silent", "trace", "warn"]),
    NEXT_PUBLIC_API_URL: requiredUrl("NEXT_PUBLIC_API_URL"),
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN: optionalString,
    NODE_ENV: z.enum(["development", "production", "test"]),
    RATE_LIMIT_SCANS_PER_MINUTE: integerEnv("RATE_LIMIT_SCANS_PER_MINUTE", 1, 10_000),
    REDIS_URL: requiredUrl("REDIS_URL"),
    SCAN_CACHE_TTL_SECONDS: integerEnv("SCAN_CACHE_TTL_SECONDS", 1, 86_400),
    SENTRY_DSN: optionalUrl("SENTRY_DSN"),
    SOLANA_CLUSTER: z.enum(["devnet", "mainnet-beta"]),
  })
  .superRefine((env, context) => {
    if (env.NODE_ENV === "production" && env.HELIUS_API_KEY === undefined) {
      context.addIssue({
        code: "custom",
        message: "HELIUS_API_KEY is required in production",
        path: ["HELIUS_API_KEY"],
      });
    }
  });

export function parseEnv(
  source: Record<string, string | undefined>,
  options: ParseEnvOptions = {},
): Env {
  const parsed = rawEnvSchema.safeParse(pickEnv(source));

  if (!parsed.success) {
    throw new EnvValidationError(
      parsed.error.issues.map((issue) => ({
        message: issue.message,
        variable: envKeyFromPath(issue.path),
      })),
    );
  }

  const env: Env = {
    apiCorsOrigin: parsed.data.API_CORS_ORIGIN,
    apiPort: parsed.data.API_PORT,
    databaseUrl: parsed.data.DATABASE_URL,
    heliusRpcUrl: parsed.data.HELIUS_RPC_URL,
    jupiterPriceUrl: parsed.data.JUPITER_PRICE_URL,
    logLevel: parsed.data.LOG_LEVEL,
    nextPublicApiUrl: parsed.data.NEXT_PUBLIC_API_URL,
    nodeEnv: parsed.data.NODE_ENV,
    rateLimitScansPerMinute: parsed.data.RATE_LIMIT_SCANS_PER_MINUTE,
    redisUrl: parsed.data.REDIS_URL,
    scanCacheTtlSeconds: parsed.data.SCAN_CACHE_TTL_SECONDS,
    solanaCluster: parsed.data.SOLANA_CLUSTER,
    ...(parsed.data.HELIUS_API_KEY === undefined
      ? {}
      : { heliusApiKey: parsed.data.HELIUS_API_KEY }),
    ...(parsed.data.NEXT_PUBLIC_PLAUSIBLE_DOMAIN === undefined
      ? {}
      : { nextPublicPlausibleDomain: parsed.data.NEXT_PUBLIC_PLAUSIBLE_DOMAIN }),
    ...(parsed.data.SENTRY_DSN === undefined ? {} : { sentryDsn: parsed.data.SENTRY_DSN }),
  };

  emitDevelopmentWarnings(env, options.onWarning ?? ignoreWarning);

  return env;
}

export function assertScanProviderEnv(env: Env): asserts env is EnvWithScanProvider {
  if (env.heliusApiKey === undefined) {
    throw new EnvValidationError([
      {
        message: "HELIUS_API_KEY is required before attempting a real scan",
        variable: "HELIUS_API_KEY",
      },
    ]);
  }
}

export function formatEnvWarning(warning: EnvWarning): string {
  return `[env:${warning.severity}] ${warning.variable}: ${warning.message}`;
}

function emptyStringToUndefined(value: unknown): unknown {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
}

function pickEnv(source: Record<string, string | undefined>): RawEnv {
  return Object.fromEntries(ENV_KEYS.map((key) => [key, source[key]])) as RawEnv;
}

function envKeyFromPath(path: readonly PropertyKey[]): EnvValidationIssue["variable"] {
  const firstPathPart = path[0];

  if (typeof firstPathPart !== "string") {
    return "unknown";
  }

  return isEnvKey(firstPathPart) ? firstPathPart : "unknown";
}

function isEnvKey(value: string): value is EnvKey {
  return ENV_KEYS.some((key) => key === value);
}

function emitDevelopmentWarnings(env: Env, onWarning: (warning: EnvWarning) => void): void {
  if (env.nodeEnv !== "development") {
    return;
  }

  if (env.heliusApiKey === undefined) {
    onWarning({
      message: "API can boot for local development, but real scans must fail until this is set.",
      severity: "deferred-required",
      variable: "HELIUS_API_KEY",
    });
  }

  if (env.nextPublicPlausibleDomain === undefined) {
    onWarning({
      message: "Plausible analytics is disabled until this optional value is set.",
      severity: "optional",
      variable: "NEXT_PUBLIC_PLAUSIBLE_DOMAIN",
    });
  }

  if (env.sentryDsn === undefined) {
    onWarning({
      message: "Sentry reporting is disabled until this optional value is set.",
      severity: "optional",
      variable: "SENTRY_DSN",
    });
  }
}

function ignoreWarning(): void {
  return;
}
