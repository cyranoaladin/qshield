import { describe, expect, it } from "vitest";

import { SCORING_PACKAGE_STATUS } from "./index.js";

describe("scoring package scaffold", () => {
  it("is explicitly scaffolded without implementing QES before LOT-04", () => {
    expect(SCORING_PACKAGE_STATUS).toEqual({
      implemented: false,
      packageName: "@qshield/scoring",
    });
  });
});
