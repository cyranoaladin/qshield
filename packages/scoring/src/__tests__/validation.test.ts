import { describe, expect, it } from "vitest";

import { calculateQes } from "../calculate-qes.js";
import type { QesInput } from "../types.js";

describe("QES input validation", () => {
  it("rejects negative monetary values", () => {
    expect(() => calculateQes({ ...validInput(), totalUsd: -1 })).toThrow("totalUsd");
  });

  it("rejects negative token account counts", () => {
    expect(() => calculateQes({ ...validInput(), significantTokenAccounts: -1 })).toThrow(
      "significantTokenAccounts",
    );
  });

  it("rejects concentration ratios outside [0, 1]", () => {
    expect(() => calculateQes({ ...validInput(), concentrationRatio: 1.01 })).toThrow(
      "concentrationRatio",
    );
  });

  it("rejects invalid scannedAt timestamps", () => {
    expect(() => calculateQes({ ...validInput(), scannedAt: "not-a-date" })).toThrow("scannedAt");
  });
});

function validInput(): QesInput {
  return {
    accountClass: "system",
    address: "QuantaLayerValidation111111111111111111111",
    concentrationRatio: 0.2,
    confidence: {
      accountClassified: 1,
      dataFreshness: 1,
      defiPositions: 1,
      nftCnftCoverage: 1,
      resolvedPrices: 1,
      rpcDasCompleteness: 1,
      stakeAccounts: 1,
    },
    daysSinceLastActivity: 10,
    observableAgeDays: 100,
    scannedAt: "2026-07-06T00:00:00.000Z",
    significantTokenAccounts: 2,
    stakedOrLockedUsd: 0,
    totalUsd: 100,
  };
}
