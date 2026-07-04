import { buildServer } from "./server.js";

const DEFAULT_API_PORT = 3001;

function readPort(): number {
  const rawPort = process.env.API_PORT;

  if (rawPort === undefined || rawPort === "") {
    return DEFAULT_API_PORT;
  }

  const parsedPort = Number.parseInt(rawPort, 10);

  if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65_535) {
    throw new Error("API_PORT must be an integer between 1 and 65535");
  }

  return parsedPort;
}

const server = buildServer();
const port = readPort();

await server.listen({
  host: "0.0.0.0",
  port,
});
