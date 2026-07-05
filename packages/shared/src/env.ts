import { z } from "zod";

import { QuantaLayerError } from "./errors.js";

export const SERVER_ENV_KEYS = [
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
] as const;

export const WEB_ENV_KEYS = [
  "NODE_ENV",
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_PLAUSIBLE_DOMAIN",
] as const;

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
export type ServerEnvKey = (typeof SERVER_ENV_KEYS)[number];
export type WebEnvKey = (typeof WEB_ENV_KEYS)[number];

export type RawEnv = Record<EnvKey, string | undefined>;
export type RawServerEnv = Record<ServerEnvKey, string | undefined>;
export type RawWebEnv = Record<WebEnvKey, string | undefined>;

export type EnvWarningSeverity = "optional" | "deferred-required";

export type EnvWarning = {
  readonly message: string;
  readonly severity: EnvWarningSeverity;
  readonly variable: EnvKey;
};

export type ParseEnvOptions = {
  readonly onWarning?: (warning: EnvWarning) => void;
};

export type ServerEnv = {
  readonly apiCorsOrigin: string;
  readonly apiPort: number;
  readonly databaseUrl: string;
  readonly heliusApiKey?: string;
  readonly heliusRpcUrl: string;
  readonly jupiterPriceUrl: string;
  readonly logLevel: LogLevel;
  readonly nodeEnv: NodeEnv;
  readonly rateLimitScansPerMinute: number;
  readonly redisUrl: string;
  readonly scanCacheTtlSeconds: number;
  readonly sentryDsn?: string;
  readonly solanaCluster: SolanaCluster;
};

export type WebEnv = {
  readonly nextPublicApiUrl: string;
  readonly nextPublicPlausibleDomain?: string;
  readonly nodeEnv: NodeEnv;
};

export type Env = ServerEnv & WebEnv;

export type EnvWithScanProvider = ServerEnv & {
  readonly heliusApiKey: string;
};

export type NodeEnv = "development" | "production" | "test";
export type SolanaCluster = "devnet" | "mainnet-beta";
export type LogLevel = "debug" | "error" | "fatal" | "info" | "silent" | "trace" | "warn";

type EnvValidationIssue = {
  readonly message: string;
  readonly variable: EnvKey | "unknown";
};

export class EnvValidationError extends QuantaLayerError {
  readonly issues: readonly EnvValidationIssue[];

  constructor(issues: readonly EnvValidationIssue[]) {
    const detail = issues.map((issue) => `${issue.variable}: ${issue.message}`).join("; ");

    super(`Invalid QuantaLayer environment: ${detail}`, {
      code: "ENV_VALIDATION_ERROR",
      detail,
      status: 500,
    });
    this.name = "EnvValidationError";
    this.issues = issues;
  }
}

const nodeEnvSchema = z.enum(["development", "production", "test"]);
const logLevelSchema = z.enum(["debug", "error", "fatal", "info", "silent", "trace", "warn"]);

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

const serverEnvSchema = z
  .object({
    API_CORS_ORIGIN: requiredUrl("API_CORS_ORIGIN"),
    API_PORT: integerEnv("API_PORT", 1, 65_535),
    DATABASE_URL: requiredUrl("DATABASE_URL"),
    HELIUS_API_KEY: optionalString,
    HELIUS_RPC_URL: requiredUrl("HELIUS_RPC_URL"),
    JUPITER_PRICE_URL: requiredUrl("JUPITER_PRICE_URL"),
    LOG_LEVEL: logLevelSchema,
    NODE_ENV: nodeEnvSchema,
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

const webEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: requiredUrl("NEXT_PUBLIC_API_URL"),
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: optionalString,
  NODE_ENV: nodeEnvSchema,
});

export function parseServerEnv(
  source: Record<string, string | undefined>,
  options: ParseEnvOptions = {},
): ServerEnv {
  const parsed = serverEnvSchema.safeParse(pickEnv(source, SERVER_ENV_KEYS));

  if (!parsed.success) {
    throw envValidationError(parsed.error);
  }

  const env: ServerEnv = {
    apiCorsOrigin: parsed.data.API_CORS_ORIGIN,
    apiPort: parsed.data.API_PORT,
    databaseUrl: parsed.data.DATABASE_URL,
    heliusRpcUrl: parsed.data.HELIUS_RPC_URL,
    jupiterPriceUrl: parsed.data.JUPITER_PRICE_URL,
    logLevel: parsed.data.LOG_LEVEL,
    nodeEnv: parsed.data.NODE_ENV,
    rateLimitScansPerMinute: parsed.data.RATE_LIMIT_SCANS_PER_MINUTE,
    redisUrl: parsed.data.REDIS_URL,
    scanCacheTtlSeconds: parsed.data.SCAN_CACHE_TTL_SECONDS,
    solanaCluster: parsed.data.SOLANA_CLUSTER,
    ...(parsed.data.HELIUS_API_KEY === undefined
      ? {}
      : { heliusApiKey: parsed.data.HELIUS_API_KEY }),
    ...(parsed.data.SENTRY_DSN === undefined ? {} : { sentryDsn: parsed.data.SENTRY_DSN }),
  };

  emitServerDevelopmentWarnings(env, options.onWarning ?? warnToConsole);

  return env;
}

export function parseWebEnv(
  source: Record<string, string | undefined>,
  options: ParseEnvOptions = {},
): WebEnv {
  const parsed = webEnvSchema.safeParse(pickEnv(source, WEB_ENV_KEYS));

  if (!parsed.success) {
    throw envValidationError(parsed.error);
  }

  const env: WebEnv = {
    nextPublicApiUrl: parsed.data.NEXT_PUBLIC_API_URL,
    nodeEnv: parsed.data.NODE_ENV,
    ...(parsed.data.NEXT_PUBLIC_PLAUSIBLE_DOMAIN === undefined
      ? {}
      : { nextPublicPlausibleDomain: parsed.data.NEXT_PUBLIC_PLAUSIBLE_DOMAIN }),
  };

  emitWebDevelopmentWarnings(env, options.onWarning ?? warnToConsole);

  return env;
}

export function parseEnv(
  source: Record<string, string | undefined>,
  options: ParseEnvOptions = {},
): Env {
  const serverEnv = parseServerEnv(source, options);
  const webEnv = parseWebEnv(source, options);

  return {
    ...serverEnv,
    ...webEnv,
  };
}

export function assertScanProviderEnv(env: ServerEnv): asserts env is EnvWithScanProvider {
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

function pickEnv<Key extends EnvKey>(
  source: Record<string, string | undefined>,
  keys: readonly Key[],
): Record<Key, string | undefined> {
  return Object.fromEntries(keys.map((key) => [key, source[key]])) as Record<
    Key,
    string | undefined
  >;
}

function envValidationError(error: z.ZodError): EnvValidationError {
  return new EnvValidationError(
    error.issues.map((issue) => ({
      message: issue.message,
      variable: envKeyFromPath(issue.path),
    })),
  );
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

function emitServerDevelopmentWarnings(
  env: ServerEnv,
  onWarning: (warning: EnvWarning) => void,
): void {
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

  if (env.sentryDsn === undefined) {
    onWarning({
      message: "Sentry reporting is disabled until this optional value is set.",
      severity: "optional",
      variable: "SENTRY_DSN",
    });
  }
}

function emitWebDevelopmentWarnings(env: WebEnv, onWarning: (warning: EnvWarning) => void): void {
  if (env.nodeEnv !== "development") {
    return;
  }

  if (env.nextPublicPlausibleDomain === undefined) {
    onWarning({
      message: "Plausible analytics is disabled until this optional value is set.",
      severity: "optional",
      variable: "NEXT_PUBLIC_PLAUSIBLE_DOMAIN",
    });
  }
}

function warnToConsole(warning: EnvWarning): void {
  console.warn(formatEnvWarning(warning));
}
