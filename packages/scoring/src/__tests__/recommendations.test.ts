import { describe, expect, it } from "vitest";

import { buildRecommendations } from "../recommendations.js";
import type { QesInput } from "../types.js";

describe("buildRecommendations", () => {
  it("recommends confidence improvement when QCI is low", () => {
    expect(buildRecommendations(baseInput(), 35, 20)).toContain(
      "Improve data confidence before relying on this scan.",
    );
  });

  it("recommends authority review for PDA/off-curve addresses", () => {
    expect(buildRecommendations({ ...baseInput(), accountClass: "pda" }, null, 100)).toContain(
      "Review the owning program and upgrade authority rather than treating this as a wallet.",
    );
  });

  it("recommends stake migration planning for locked value", () => {
    expect(buildRecommendations({ ...baseInput(), stakedOrLockedUsd: 900 }, 50, 100)).toContain(
      "Review stake, lockup and withdrawal authority migration steps.",
    );
  });
});

function baseInput(): QesInput {
  return {
    accountClass: "system",
    address: "QuantaLayerRecommendation11111111111111111",
    concentrationRatio: 0.1,
    confidence: {
      accountClassified: 1,
      dataFreshness: 1,
      defiPositions: 1,
      nftCnftCoverage: 1,
      resolvedPrices: 1,
      rpcDasCompleteness: 1,
      stakeAccounts: 1,
    },
    daysSinceLastActivity: 30,
    observableAgeDays: 365,
    scannedAt: "2026-07-06T00:00:00.000Z",
    significantTokenAccounts: 1,
    stakedOrLockedUsd: 0,
    totalUsd: 1_000,
  };
}
