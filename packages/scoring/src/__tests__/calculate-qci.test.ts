import { describe, expect, it } from "vitest";

import { calculateQci } from "../calculate-qci.js";

describe("calculateQci", () => {
  it("returns 100 when all confidence dimensions are complete", () => {
    expect(calculateQci(fullConfidence())).toBe(100);
  });

  it("weights unresolved prices according to the QCI specification", () => {
    expect(calculateQci({ ...fullConfidence(), resolvedPrices: 0.5 })).toBe(85);
  });

  it("rejects confidence dimensions outside [0, 1]", () => {
    expect(() => calculateQci({ ...fullConfidence(), dataFreshness: 1.2 })).toThrow(
      "dataFreshness",
    );
  });
});

function fullConfidence() {
  return {
    accountClassified: 1,
    dataFreshness: 1,
    defiPositions: 1,
    nftCnftCoverage: 1,
    resolvedPrices: 1,
    rpcDasCompleteness: 1,
    stakeAccounts: 1,
  } as const;
}
