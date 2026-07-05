import { describe, expect, it } from "vitest";

import { API_SERVICE_NAME, WEB_SERVICE_NAME } from "./index.js";

describe("shared constants", () => {
  it("exports stable service names for scaffolded apps", () => {
    expect(API_SERVICE_NAME).toBe("quantalayer-api");
    expect(WEB_SERVICE_NAME).toBe("quantalayer-web");
  });
});
