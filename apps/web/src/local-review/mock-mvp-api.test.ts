import { describe, expect, it } from "vitest";

import {
  buildHealthResponse,
  buildScanResponse,
  buildStatsResponse,
  buildWaitlistResponse,
} from "../../../../scripts/mock-mvp-api";

describe("local MVP mock API responses", () => {
  it("returns a frontend-review health response", () => {
    const response = buildHealthResponse();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      mode: "frontend-review",
      service: "quantalayer-mock-api",
      status: "ok",
    });
  });

  it("maps preview addresses to scan states without external providers", () => {
    expect(buildScanResponse("11111111111111111111111111111111").body).toMatchObject({
      grade: "B",
      gradeDisplayed: true,
      qci: 82,
      qes: 69,
      status: "ok",
    });

    expect(buildScanResponse("LowConfidence111111111111111111111111111").body).toMatchObject({
      grade: null,
      gradeDisplayed: false,
      qci: 34,
      qes: null,
      status: "insufficient_data",
    });

    expect(buildScanResponse("PdaPreview111111111111111111111111111111").body).toMatchObject({
      grade: "N/A",
      gradeDisplayed: false,
      qci: 59,
      qes: null,
      status: "not_applicable",
    });

    expect(buildScanResponse("ErrorPreview11111111111111111111111111111")).toMatchObject({
      contentType: "application/problem+json",
      status: 502,
    });
  });

  it("returns the synthetic aggregate stats used by visual review", () => {
    expect(buildStatsResponse().body).toEqual({
      averageQci: 76,
      averageQes: 54,
      gradeDistribution: {
        A: 12,
        B: 31,
        C: 48,
        D: 25,
        E: 6,
        "N/A": 6,
      },
      lastScanTimestamp: "2026-07-06T12:00:00.000Z",
      totalEstimatedMigrationExposureValueUsd: 2450000,
      totalScans: 128,
    });
  });

  it("maps waitlist emails to success, duplicate, and error states", () => {
    expect(buildWaitlistResponse("review@example.invalid")).toMatchObject({
      body: {
        duplicate: false,
        status: "ok",
      },
      status: 200,
    });

    expect(buildWaitlistResponse("duplicate@example.invalid")).toMatchObject({
      body: {
        duplicate: true,
        status: "ok",
      },
      status: 200,
    });

    expect(buildWaitlistResponse("error@example.invalid")).toMatchObject({
      contentType: "application/problem+json",
      status: 500,
    });
  });
});
