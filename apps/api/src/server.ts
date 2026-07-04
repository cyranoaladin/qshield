import Fastify, { type FastifyInstance } from "fastify";

const API_SERVICE_NAME = "qshield-api";

export function buildServer(): FastifyInstance {
  const server = Fastify({
    logger: false,
  });

  server.get("/healthz", async () => ({
    service: API_SERVICE_NAME,
    status: "ok",
  }));

  return server;
}
