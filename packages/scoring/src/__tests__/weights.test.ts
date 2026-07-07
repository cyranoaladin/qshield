import { describe, expect, it } from "vitest";

import { QCI_WEIGHTS, QES_VERSION, QES_WEIGHTS, QCI_VERSION } from "../weights.js";

describe("scoring weights", () => {
  it("exports the normative scoring versions", () => {
    expect(QES_VERSION).toBe("1.1.0");
    expect(QCI_VERSION).toBe("1.0.1");
  });

  it("keeps QES weights normalized", () => {
    const total = Object.values(QES_WEIGHTS).reduce((sum, weight) => sum + weight, 0);

    expect(total).toBeCloseTo(1, 10);
  });

  it("keeps QCI weights normalized", () => {
    const total = Object.values(QCI_WEIGHTS).reduce((sum, weight) => sum + weight, 0);

    expect(total).toBeCloseTo(1, 10);
  });
});
