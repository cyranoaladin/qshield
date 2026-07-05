import Fastify, { type FastifyInstance } from "fastify";

import { API_SERVICE_NAME } from "@qshield/shared";

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
