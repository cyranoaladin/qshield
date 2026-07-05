import { describe, expect, it } from "vitest";

import { QShieldError, ValidationError, toProblemJson } from "./errors.js";

describe("toProblemJson", () => {
  it("serializes typed errors as RFC 7807 problem details", () => {
    const error = new ValidationError("Invalid request body", {
      detail: "address must be a Solana public key",
    });

    expect(toProblemJson(error, "/api/v1/scan")).toEqual({
      code: "VALIDATION_ERROR",
      detail: "address must be a Solana public key",
      instance: "/api/v1/scan",
      status: 400,
      title: "Invalid request body",
      type: "https://qshield.app/problems/validation-error",
    });
  });

  it("serializes unknown errors as internal server errors without leaking details", () => {
    expect(toProblemJson(new Error("database password leaked"))).toEqual({
      code: "INTERNAL_SERVER_ERROR",
      status: 500,
      title: "Internal Server Error",
      type: "https://qshield.app/problems/internal-server-error",
    });
  });

  it("preserves status and code from custom Q-Shield errors", () => {
    const error = new QShieldError("Upstream rejected response", {
      code: "UPSTREAM_DATA_ERROR",
      detail: "Helius response did not match schema",
      status: 502,
    });

    expect(toProblemJson(error)).toMatchObject({
      code: "UPSTREAM_DATA_ERROR",
      detail: "Helius response did not match schema",
      status: 502,
      title: "Upstream rejected response",
    });
  });
});
