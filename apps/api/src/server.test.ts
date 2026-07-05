import { describe, expect, it } from "vitest";

import { buildServer } from "./server.js";

describe("buildServer", () => {
  it("serves the health endpoint", async () => {
    const server = buildServer();

    const response = await server.inject({
      method: "GET",
      url: "/healthz",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      service: "quantalayer-api",
      status: "ok",
    });

    await server.close();
  });
});
