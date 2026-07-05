import { config as loadDotenv } from "dotenv";

import { formatEnvWarning } from "@quantalayer/shared";

import { readApiConfig } from "./config.js";
import { buildServer } from "./server.js";

loadDotenv({ quiet: true });

const config = readApiConfig(process.env, {
  onWarning: (warning) => {
    console.warn(formatEnvWarning(warning));
  },
});
const server = buildServer();

await server.listen({
  host: "0.0.0.0",
  port: config.port,
});
