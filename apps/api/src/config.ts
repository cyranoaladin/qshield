import { type ParseEnvOptions, type ServerEnv, parseServerEnv } from "@qshield/shared";

export type ApiConfig = {
  readonly corsOrigin: string;
  readonly env: ServerEnv;
  readonly port: number;
};

export function readApiConfig(
  source: Record<string, string | undefined> = process.env,
  options?: ParseEnvOptions,
): ApiConfig {
  const env = parseServerEnv(source, options);

  return {
    corsOrigin: env.apiCorsOrigin,
    env,
    port: env.apiPort,
  };
}
