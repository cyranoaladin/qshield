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
    expect(result.qci).toBe(59);
    expect(result.grade).toBe("A");
    expect(result.gradeDisplayed).toBe(true);
    expect(result.status).toBe("fragile_estimate");
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

  it("caps QCI at 79 when concentration is unavailable", () => {
    const result = calculateQes({
      ...readFixture("high-value-wallet.json"),
      concentrationRatio: null,
    });

    expect(result.qci).toBe(79);
    expect(result.gradeDisplayed).toBe(true);
    expect(result.status).toBe("ok");
    expect(result.warnings).toContain("Concentration unavailable in single-address scan.");
  });

  it("caps QCI at 69 when two QES factors are unavailable", () => {
    const result = calculateQes({
      ...readFixture("high-value-wallet.json"),
      observableAgeDays: null,
      daysSinceLastActivity: null,
    });

    expect(result.qci).toBe(69);
    expect(result.gradeDisplayed).toBe(true);
    expect(result.status).toBe("ok");
  });

  it("caps QCI at 59 when three QES factors are unavailable", () => {
    const result = calculateQes({
      ...readFixture("high-value-wallet.json"),
      concentrationRatio: null,
      observableAgeDays: null,
      daysSinceLastActivity: null,
    });

    expect(result.qci).toBe(59);
    expect(result.gradeDisplayed).toBe(true);
    expect(result.status).toBe("fragile_estimate");
  });

  it("keeps QCI below 40 hidden even when missing-factor caps also apply", () => {
    const result = calculateQes({
      ...readFixture("low-confidence-wallet.json"),
      concentrationRatio: null,
      observableAgeDays: null,
      daysSinceLastActivity: null,
    });

    expect(result.qci).toBe(20);
    expect(result.qes).toBeNull();
    expect(result.gradeDisplayed).toBe(false);
    expect(result.status).toBe("insufficient_data");
  });

  it("renormalizes QES over observable factors when QES factors are missing", () => {
    const result = calculateQes({
      ...readFixture("high-value-wallet.json"),
      concentrationRatio: null,
      observableAgeDays: null,
      daysSinceLastActivity: null,
    });

    expect(result.qes).not.toBeNull();
    expect(result.breakdown.concentration).toBe(0);
    expect(result.breakdown.observableAge).toBe(0);
    expect(result.breakdown.recentActivity).toBe(0);
    expect(sumBreakdown(result.breakdown)).toBe(result.qes);
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
