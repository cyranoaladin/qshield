import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

const scanAddress = "11111111111111111111111111111111";

test("scan happy path renders QES and QCI", async ({ page }) => {
  await page.route("**/api/v1/scan", async (route) => {
    await route.fulfill({
      body: JSON.stringify(scanResponse(scanAddress)),
      contentType: "application/json",
      status: 200,
    });
  });

  await page.goto("/");
  await page.getByLabel("Adresse Solana").fill(scanAddress);
  await page.getByRole("button", { name: "Scanner une adresse" }).click();

  await expect(page).toHaveURL(`/scan/${scanAddress}`);
  await expect(page.getByText("QES", { exact: true })).toBeVisible();
  await expect(page.getByText("QCI", { exact: true })).toBeVisible();
  await expect(page.getByText(scanAddress)).toBeVisible();
});

test("scan page shows a sober error on provider failure", async ({ page }) => {
  await page.route("**/api/v1/scan", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        code: "VALIDATION_ERROR",
        status: 400,
        title: "Invalid Solana address",
        type: "https://quantalayer.app/problems/validation-error",
      }),
      contentType: "application/problem+json",
      status: 400,
    });
  });

  await page.goto("/scan/not-base58-0000");

  await expect(page.getByText("Service indisponible. Réessayez plus tard.")).toBeVisible();
});

test("waitlist flow submits explicit consent", async ({ page }) => {
  await page.route("**/api/v1/waitlist", async (route) => {
    const request = route.request();

    expect(request.postDataJSON()).toMatchObject({
      consent: true,
      email: "research@quantalayer.app",
      source: "e2e",
      wallet: scanAddress,
    });

    await route.fulfill({
      body: JSON.stringify({
        duplicate: false,
        message: "Waitlist registration recorded.",
        status: "ok",
      }),
      contentType: "application/json",
      status: 200,
    });
  });

  await page.goto("/waitlist");
  await page.getByLabel("E-mail").fill("research@quantalayer.app");
  await page.getByLabel("Adresse Solana publique").fill(scanAddress);
  await page.getByLabel("Source").fill("e2e");
  await page.getByLabel("J'accepte d'être contacté au sujet des mises à jour QuantaLayer.").check();
  await page.getByRole("button", { name: "Rejoindre la liste" }).click();

  await expect(page.getByText("Inscription enregistrée.")).toBeVisible();
});

test("stats page renders aggregate metrics without raw addresses", async ({ page }) => {
  await page.route("**/api/v1/stats", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        averageQci: 81,
        averageQes: 58,
        gradeDistribution: {
          A: 1,
          B: 2,
          C: 3,
          D: 0,
          E: 0,
          "N/A": 1,
        },
        lastScanTimestamp: "2026-07-05T12:00:00.000Z",
        totalEstimatedMigrationExposureValueUsd: 125000,
        totalScans: 7,
      }),
      contentType: "application/json",
      status: 200,
    });
  });

  await page.goto("/stats");

  await expect(page.getByText("Tableau de bord agrégé")).toBeVisible();
  await expect(page.getByText("Total des scans")).toBeVisible();
  await expect(page.getByText("125\u202f000\u00a0$US")).toBeVisible();
  await expect(page.getByRole("meter", { name: "C" })).toHaveAttribute("aria-valuenow", "3");
  await expect(page.getByRole("meter", { name: "C" })).toHaveAttribute("aria-valuemax", "3");
  await expect(page.locator("body")).not.toContainText(scanAddress);
});

test("OG score route returns a PNG image", async ({ page }) => {
  const response = await page.request.get(
    `/api/og/score?address=${scanAddress}&qes=69&qci=82&grade=B`,
  );

  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("image/png");
});

test("rendered public pages avoid machine-listed banned claims", async ({ page }) => {
  const bannedClaims = extractBannedClaims(
    readFileSync(new URL("../../../docs/claims_matrix.md", import.meta.url), "utf8"),
  );

  for (const path of ["/", "/waitlist", "/learn/why-solana", "/stats"]) {
    if (path === "/stats") {
      await page.route("**/api/v1/stats", async (route) => {
        await route.fulfill({
          body: JSON.stringify({
            averageQci: null,
            averageQes: null,
            gradeDistribution: {},
            lastScanTimestamp: null,
            totalEstimatedMigrationExposureValueUsd: 0,
            totalScans: 0,
          }),
          contentType: "application/json",
          status: 200,
        });
      });
    }

    await page.goto(path);
    const pageText = (await page.locator("body").innerText()).toLowerCase();

    for (const claim of bannedClaims) {
      expect(pageText).not.toContain(claim.toLowerCase());
    }
  }
});

function scanResponse(address: string) {
  return {
    address,
    breakdown: {
      concentration: 10,
      observableAge: 8,
      observableAssetValue: 28,
      recentActivity: 7,
      significantTokenAccounts: 6,
      stakedOrLockedAssets: 10,
    },
    cache: {
      hit: false,
      ttlSeconds: 300,
    },
    estimatedMigrationExposureValueUsd: 50_000,
    grade: "B",
    gradeDisplayed: true,
    qci: 82,
    qciVersion: "1.0.1",
    qes: 69,
    qesVersion: "1.1.0",
    recommendations: ["Prioritize authority inventory before migration planning."],
    scannedAt: "2026-07-05T12:00:00.000Z",
    status: "ok",
    warnings: ["Concentration unavailable in single-address scan."],
  };
}

function extractBannedClaims(markdown: string): string[] {
  const match = /```banned-claims\n([\s\S]*?)```/u.exec(markdown);
  const claims = match?.[1];

  if (claims === undefined) {
    throw new Error("Missing banned claims block");
  }

  return claims
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));
}
