import type { QesInput } from "./types.js";

export function buildRecommendations(input: QesInput, qes: number | null, qci: number): string[] {
  const recommendations: string[] = [];

  if (input.accountClass === "pda") {
    recommendations.push(
      "Review the owning program and upgrade authority rather than treating this as a wallet.",
    );
    return recommendations;
  }

  if (qci < 40) {
    recommendations.push("Improve data confidence before relying on this scan.");
  }

  if (qes !== null && qes >= 60) {
    recommendations.push("Prepare a prioritized migration plan.");
  }

  if (input.stakedOrLockedUsd > 0) {
    recommendations.push("Review stake, lockup and withdrawal authority migration steps.");
  }

  if (input.significantTokenAccounts >= 10) {
    recommendations.push("Inventory significant token accounts before migration planning.");
  }

  if (input.daysSinceLastActivity !== null && input.daysSinceLastActivity >= 365) {
    recommendations.push("Confirm account owner reachability before a migration window.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Keep account inventory current and rescan when balances change.");
  }

  return recommendations;
}
