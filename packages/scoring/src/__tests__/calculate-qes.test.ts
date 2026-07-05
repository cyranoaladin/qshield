import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { calculateQes } from "../calculate-qes.js";
import type { QesInput } from "../types.js";

const fixturesDir = join(import.meta.dirname, "../fixtures");

describe("calculateQes", () => {
  it("returns a low score for an empty wallet without throwing", () => {
    const result = calculateQes(readFixture("empty-wallet.json"));

    expect(result.qes).toBe(0);
    expect(result.qci).toBe(100);
    expect(result.grade).toBe("A");
    expect(result.gradeDisplayed).toBe(true);
    expect(result.status).toBe("ok");
    expect(sumBreakdown(result.breakdown)).toBe(result.qes);
  });

  it("scores a high-value concentrated wallet as high migration criticality", () => {
    const result = calculateQes(readFixture("high-value-wallet.json"));

    expect(result.qes).toBe(73);
    expect(result.grade).toBe("D");
    expect(result.estimatedMigrationExposureValueUsd).toBe(1_000_000);
    expect(result.recommendations).toContain("Prepare a prioritized migration plan.");
    expect(sumBreakdown(result.breakdown)).toBe(result.qes);
  });

  it("hides grade and score display when QCI is below 40", () => {
    const result = calculateQes(readFixture("low-confidence-wallet.json"));

    expect(result.qci).toBe(20);
    expect(result.qes).toBeNull();
    expect(result.grade).toBeNull();
    expect(result.gradeDisplayed).toBe(false);
    expect(result.status).toBe("insufficient_data");
    expect(result.warnings).toContain("QCI below 40: grade and score display are disabled.");
  });

  it("marks PDA/off-curve accounts as not applicable to wallet-grade scoring", () => {
    const result = calculateQes(readFixture("off-curve-address.json"));

    expect(result.qes).toBeNull();
    expect(result.grade).toBe("N/A");
    expect(result.gradeDisplayed).toBe(false);
    expect(result.status).toBe("not_applicable");
    expect(result.warnings.join(" ")).toContain("off-curve");
  });

  it("raises criticality for dormant accounts through recent activity factor", () => {
    const result = calculateQes({
      ...readFixture("empty-wallet.json"),
      daysSinceLastActivity: 900,
      totalUsd: 1_000,
    });

    expect(result.qes).toBe(37);
    expect(result.grade).toBe("B");
  });

  it("is deterministic for fixed input", () => {
    const input = readFixture("high-value-wallet.json");

    expect(calculateQes(input)).toEqual(calculateQes(input));
  });

  it("clamps extreme scores to 100", () => {
    const result = calculateQes({
      ...readFixture("high-value-wallet.json"),
      concentrationRatio: 1,
      daysSinceLastActivity: 50_000,
      observableAgeDays: 50_000,
      significantTokenAccounts: 5_000,
      stakedOrLockedUsd: 10_000_000,
      totalUsd: 10_000_000,
    });

    expect(result.qes).toBe(100);
    expect(result.grade).toBe("E");
  });
});

function readFixture(fileName: string): QesInput {
  return JSON.parse(readFileSync(join(fixturesDir, fileName), "utf8")) as QesInput;
}

function sumBreakdown(breakdown: Record<string, number>): number {
  return Object.values(breakdown).reduce((sum, component) => sum + component, 0);
}
