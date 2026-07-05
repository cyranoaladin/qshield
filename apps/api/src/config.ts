import { type Env, type ParseEnvOptions, parseEnv } from "@qshield/shared";

export type ApiConfig = {
  readonly corsOrigin: string;
  readonly env: Env;
  readonly port: number;
};

export function readApiConfig(
  source: Record<string, string | undefined> = process.env,
  options?: ParseEnvOptions,
): ApiConfig {
  const env = parseEnv(source, options);

  return {
    corsOrigin: env.apiCorsOrigin,
    env,
    port: env.apiPort,
  };
}
