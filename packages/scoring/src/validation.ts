import { ValidationError } from "@quantalayer/shared";

import type { QciInput, QesInput } from "./types.js";

const ACCOUNT_CLASSES = new Set(["multisig", "pda", "program", "system", "unknown"]);

export function validateQesInput(input: QesInput): void {
  if (!ACCOUNT_CLASSES.has(input.accountClass)) {
    throw new ValidationError("Invalid accountClass", { detail: "accountClass is unsupported" });
  }

  requireNonNegativeFinite("totalUsd", input.totalUsd);
  requireNonNegativeFinite("stakedOrLockedUsd", input.stakedOrLockedUsd);
  requireNonNegativeInteger("significantTokenAccounts", input.significantTokenAccounts);
  requireNullableNonNegativeInteger("observableAgeDays", input.observableAgeDays);
  requireNullableNonNegativeInteger("daysSinceLastActivity", input.daysSinceLastActivity);

  if (
    input.concentrationRatio !== null &&
    (input.concentrationRatio < 0 || input.concentrationRatio > 1)
  ) {
    throw new ValidationError("Invalid concentrationRatio", {
      detail: "concentrationRatio must be null or between 0 and 1",
    });
  }

  if (input.scannedAt !== undefined) {
    requireIsoTimestamp(input.scannedAt);
  }

  validateQciInput(input.confidence);
}

export function validateQciInput(confidence: QciInput): void {
  for (const [key, value] of Object.entries(confidence)) {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new ValidationError(`Invalid ${key}`, {
        detail: `${key} must be between 0 and 1`,
      });
    }
  }
}

function requireNonNegativeFinite(field: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new ValidationError(`Invalid ${field}`, {
      detail: `${field} must be a non-negative finite number`,
    });
  }
}

function requireNonNegativeInteger(field: string, value: number): void {
  requireNonNegativeFinite(field, value);

  if (!Number.isInteger(value)) {
    throw new ValidationError(`Invalid ${field}`, {
      detail: `${field} must be an integer`,
    });
  }
}

function requireNullableNonNegativeInteger(field: string, value: number | null): void {
  if (value === null) {
    return;
  }

  requireNonNegativeInteger(field, value);
}

function requireIsoTimestamp(value: string): void {
  const date = new Date(value);

  if (Number.isNaN(date.getTime()) || date.toISOString() !== value) {
    throw new ValidationError("Invalid scannedAt", {
      detail: "scannedAt must be a valid ISO 8601 UTC timestamp",
    });
  }
}
