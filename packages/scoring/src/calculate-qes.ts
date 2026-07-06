import { calculateQci, capQciForMissingQesFactors } from "./calculate-qci.js";
import { gradeForQes } from "./grade.js";
import { buildRecommendations } from "./recommendations.js";
import type { QesFactorKey, QesInput, QesResult } from "./types.js";
import { validateQesInput } from "./validation.js";
import { QCI_VERSION, QES_VERSION, QES_WEIGHTS } from "./weights.js";

type Factor = {
  readonly key: QesFactorKey;
  readonly observable: boolean;
  readonly value: number;
};

export function calculateQes(input: QesInput): QesResult {
  const scannedAt = input.scannedAt ?? new Date().toISOString();
  const normalizedInput = {
    ...input,
    scannedAt,
  };

  validateQesInput(normalizedInput);

  const qci = capQciForMissingQesFactors(calculateQci(input.confidence), input);

  if (input.accountClass === "pda") {
    const warnings = [
      "Address appears off-curve/PDA: wallet-grade Ed25519 exposure is not applicable.",
    ];

    return {
      address: input.address,
      breakdown: {},
      estimatedMigrationExposureValueUsd: input.totalUsd,
      grade: "N/A",
      gradeDisplayed: false,
      qci,
      qciVersion: QCI_VERSION,
      qes: null,
      qesVersion: QES_VERSION,
      recommendations: buildRecommendations(input, null, qci),
      scannedAt,
      status: "not_applicable",
      warnings,
    };
  }

  const warnings = buildWarnings(input, qci);

  if (qci < 40) {
    return {
      address: input.address,
      breakdown: {},
      estimatedMigrationExposureValueUsd: input.totalUsd,
      grade: null,
      gradeDisplayed: false,
      qci,
      qciVersion: QCI_VERSION,
      qes: null,
      qesVersion: QES_VERSION,
      recommendations: buildRecommendations(input, null, qci),
      scannedAt,
      status: "insufficient_data",
      warnings,
    };
  }

  const factors = buildFactors(input);
  const rawBreakdown = calculateRawBreakdown(factors);
  const qes = clampScore(
    Math.round(Object.values(rawBreakdown).reduce((sum, value) => sum + value, 0)),
  );
  const breakdown = allocateRoundedBreakdown(rawBreakdown, qes);

  return {
    address: input.address,
    breakdown,
    estimatedMigrationExposureValueUsd: input.totalUsd,
    grade: gradeForQes(qes),
    gradeDisplayed: true,
    qci,
    qciVersion: QCI_VERSION,
    qes,
    qesVersion: QES_VERSION,
    recommendations: buildRecommendations(input, qes, qci),
    scannedAt,
    status: qci < 60 ? "fragile_estimate" : "ok",
    warnings,
  };
}

function buildFactors(input: QesInput): Factor[] {
  return [
    {
      key: "observableAssetValue",
      observable: true,
      value: normalizeObservableAssetValue(input.totalUsd),
    },
    {
      key: "stakedOrLockedAssets",
      observable: true,
      value: input.totalUsd === 0 ? 0 : clamp01(input.stakedOrLockedUsd / input.totalUsd),
    },
    {
      key: "concentration",
      observable: input.concentrationRatio !== null,
      value: input.concentrationRatio ?? 0,
    },
    {
      key: "observableAge",
      observable: input.observableAgeDays !== null,
      value: input.observableAgeDays === null ? 0 : clamp01(input.observableAgeDays / 3650),
    },
    {
      key: "significantTokenAccounts",
      observable: true,
      value: clamp01(input.significantTokenAccounts / 50),
    },
    {
      key: "recentActivity",
      observable: input.daysSinceLastActivity !== null,
      value: input.daysSinceLastActivity === null ? 0 : clamp01(input.daysSinceLastActivity / 365),
    },
  ];
}

function calculateRawBreakdown(factors: readonly Factor[]): Record<QesFactorKey, number> {
  const observableWeight = factors.reduce((sum, factor) => {
    return factor.observable ? sum + QES_WEIGHTS[factor.key] : sum;
  }, 0);

  return factors.reduce(
    (breakdown, factor) => ({
      ...breakdown,
      [factor.key]:
        factor.observable && observableWeight > 0
          ? (QES_WEIGHTS[factor.key] / observableWeight) * factor.value * 100
          : 0,
    }),
    {
      concentration: 0,
      observableAge: 0,
      observableAssetValue: 0,
      recentActivity: 0,
      significantTokenAccounts: 0,
      stakedOrLockedAssets: 0,
    },
  );
}

function allocateRoundedBreakdown(
  rawBreakdown: Record<QesFactorKey, number>,
  qes: number,
): Record<string, number> {
  const entries = Object.entries(rawBreakdown).map(([key, value]) => ({
    floor: Math.floor(value),
    fraction: value - Math.floor(value),
    key,
  }));
  const floorSum = entries.reduce((sum, entry) => sum + entry.floor, 0);
  let remaining = qes - floorSum;
  const ordered = [...entries].sort((a, b) => b.fraction - a.fraction);
  const increments = new Map<string, number>();

  for (const entry of ordered) {
    if (remaining <= 0) {
      break;
    }

    increments.set(entry.key, 1);
    remaining -= 1;
  }

  return entries.reduce<Record<string, number>>((breakdown, entry) => {
    breakdown[entry.key] = entry.floor + (increments.get(entry.key) ?? 0);

    return breakdown;
  }, {});
}

function normalizeObservableAssetValue(totalUsd: number): number {
  return clamp01(Math.log10(totalUsd + 1) / 6);
}

function buildWarnings(input: QesInput, qci: number): string[] {
  const warnings: string[] = [];

  if (qci < 40) {
    warnings.push("QCI below 40: grade and score display are disabled.");
  } else if (qci < 60) {
    warnings.push("QCI below 60: displayed score is a fragile estimate.");
  } else if (qci < 80) {
    warnings.push("QCI below 80: review warnings before acting.");
  }

  if (input.concentrationRatio === null) {
    warnings.push("Concentration unavailable in single-address scan.");
  }

  if (input.observableAgeDays === null) {
    warnings.push("Observable age unavailable from current index data.");
  }

  if (input.daysSinceLastActivity === null) {
    warnings.push("Recent activity unavailable from current index data.");
  }

  return warnings;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function clampScore(score: number): number {
  return Math.min(100, Math.max(0, score));
}
