import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("OpenAPI document", () => {
  it("documents the MVP routes", () => {
    const spec = JSON.parse(
      readFileSync(new URL("../../../docs/openapi.json", import.meta.url), "utf8"),
    ) as {
      readonly paths: Record<string, unknown>;
    };

    expect(spec.paths).toHaveProperty("/healthz");
    expect(spec.paths).toHaveProperty("/api/v1/scan");
    expect(spec.paths).toHaveProperty("/api/v1/stats");
    expect(spec.paths).toHaveProperty("/api/v1/waitlist");
  });
});
