import { describe, expect, it } from "vitest";

import { buildContentSecurityPolicy } from "../../next.config";

describe("web content security policy", () => {
  it("allows the configured public API URL for local MVP review", () => {
    expect(buildContentSecurityPolicy("http://127.0.0.1:3101")).toContain(
      "connect-src 'self' http://localhost:3001 http://127.0.0.1:3101 https://api.quantalayer.app",
    );
  });
});
