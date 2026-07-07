import type { QciInput, QesInput } from "./types.js";
import { validateQciInput } from "./validation.js";
import { QCI_WEIGHTS } from "./weights.js";

export function calculateQci(confidence: QciInput): number {
  validateQciInput(confidence);

  const score = Object.entries(QCI_WEIGHTS).reduce((sum, [key, weight]) => {
    return sum + weight * confidence[key as keyof QciInput];
  }, 0);

  return clampScore(Math.round(score * 100));
}

export function capQciForMissingQesFactors(
  baseQci: number,
  input: Pick<QesInput, "concentrationRatio" | "daysSinceLastActivity" | "observableAgeDays">,
): number {
  const missing = [
    input.concentrationRatio === null,
    input.observableAgeDays === null,
    input.daysSinceLastActivity === null,
  ].filter(Boolean).length;

  if (missing >= 3) {
    return Math.min(baseQci, 59);
  }

  if (missing === 2) {
    return Math.min(baseQci, 69);
  }

  if (missing === 1) {
    return Math.min(baseQci, 79);
  }

  return baseQci;
}

function clampScore(score: number): number {
  return Math.min(100, Math.max(0, score));
}
