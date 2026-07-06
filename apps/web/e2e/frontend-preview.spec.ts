import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const address = "11111111111111111111111111111111";
const outputDir = path.resolve(process.cwd(), "../../docs/reports/frontend_preview");

const successScan = {
  address,
  breakdown: {
    observableAssetValue: 28,
    stakedOrLockedAssets: 10,
    concentration: 10,
    observableAge: 8,
    significantTokenAccounts: 6,
    recentActivity: 7,
  },
  cache: {
    hit: false,
    ttlSeconds: 3600,
  },
  estimatedMigrationExposureValueUsd: 50000,
  grade: "B",
  gradeDisplayed: true,
  qci: 82,
  qciVersion: "1.0.1",
  qes: 69,
  qesVersion: "1.1.0",
  recommendations: [
    "Prioriser l'inventaire des authorities avant toute stratégie de migration.",
    "Vérifier les comptes de stake et les assets significatifs.",
  ],
  scannedAt: "2026-07-06T12:00:00.000Z",
  status: "ok",
  warnings: [
    "Concentration unavailable in single-address scan.",
    "QCI below 80: review warnings before acting.",
  ],
};

const lowConfidenceScan = {
  address,
  breakdown: {},
  cache: {
    hit: false,
    ttlSeconds: 3600,
  },
  estimatedMigrationExposureValueUsd: 0,
  grade: null,
  gradeDisplayed: false,
  qci: 34,
  qciVersion: "1.0.1",
  qes: null,
  qesVersion: "1.1.0",
  recommendations: ["Attendre des données plus complètes avant d'interpréter le score."],
  scannedAt: "2026-07-06T12:00:00.000Z",
  status: "insufficient_data",
  warnings: [
    "QCI below 40: grade and score display are disabled.",
    "RPC/DAS pagination incomplete.",
  ],
};

const pdaScan = {
  address,
  breakdown: {},
  cache: {
    hit: false,
    ttlSeconds: 3600,
  },
  estimatedMigrationExposureValueUsd: 0,
  grade: "N/A",
  gradeDisplayed: false,
  qci: 59,
  qciVersion: "1.0.1",
  qes: null,
  qesVersion: "1.1.0",
  recommendations: ["Analyser plutôt l'owning program et ses authorities."],
  scannedAt: "2026-07-06T12:00:00.000Z",
  status: "not_applicable",
  warnings: ["Address appears off-curve/PDA: wallet-grade Ed25519 exposure is not applicable."],
};

const stats = {
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
};

test.skip(
  process.env.FRONTEND_PREVIEW !== "1",
  "Frontend preview capture is an explicit manual run.",
);

test("capture frontend preview screenshots with mocked API responses", async ({
  context,
  page,
  request,
}) => {
  await mkdir(outputDir, { recursive: true });
  await context.addInitScript(
    ({ statsPayload }) => {
      const originalFetch = window.fetch.bind(window);

      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url =
          typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

        if (url.includes("/api/v1/scan")) {
          return jsonResponse(
            window.localStorage.getItem("__quantalayer_preview_scan_payload") ?? "{}",
            Number(window.localStorage.getItem("__quantalayer_preview_scan_status") ?? "200"),
          );
        }

        if (url.includes("/api/v1/stats")) {
          return jsonResponse(JSON.stringify(statsPayload));
        }

        if (url.includes("/api/v1/waitlist")) {
          return jsonResponse(
            JSON.stringify({
              duplicate: false,
              message: "ok",
              status: "ok",
            }),
          );
        }

        return originalFetch(input, init);
      };

      function jsonResponse(body: string, status = 200) {
        return Promise.resolve(
          new Response(body, {
            headers: {
              "content-type": "application/json",
            },
            status,
          }),
        );
      }
    },
    { statsPayload: stats },
  );

  await captureLanding(page);
  await captureScanState(page, successScan, "03-scan-result-desktop.png", {
    height: 1100,
    width: 1440,
  });
  await captureScanState(page, successScan, "04-scan-result-mobile.png", {
    height: 844,
    width: 390,
  });
  await captureScanState(page, lowConfidenceScan, "05-scan-low-confidence.png", {
    height: 1000,
    width: 1440,
  });
  await captureScanState(page, pdaScan, "06-scan-pda-not-applicable.png", {
    height: 1000,
    width: 1440,
  });
  await captureScanError(page);
  await captureWaitlist(page);
  await captureStaticPage(page, "/learn/why-solana", "09-learn-why-solana.png", {
    height: 1200,
    width: 1440,
  });
  await captureStats(page);
  await captureOgCard(request);
});

async function captureLanding(page: Page) {
  await page.setViewportSize({ height: 1000, width: 1440 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "QuantaLayer" })).toBeVisible();
  await captureScreenshot(page, "01-landing-desktop.png");

  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "QuantaLayer" })).toBeVisible();
  await captureScreenshot(page, "02-landing-mobile.png");
}

async function captureScanState(
  page: Page,
  payload: typeof successScan | typeof lowConfidenceScan | typeof pdaScan,
  filename: string,
  viewport: { readonly height: number; readonly width: number },
) {
  await setScanMock(page, payload, 200);

  await page.setViewportSize(viewport);
  await page.goto(`/scan/${address}`);
  await expect(page.locator("body")).toContainText("QCI");
  await expect(page.locator("body")).toContainText(String(payload.qci));

  if (payload.status === "not_applicable") {
    await expect(page.getByText("Grade non applicable pour cette adresse.")).toBeVisible();
  } else if (payload.qes === null) {
    await expect(page.getByText("Grade masqué car les données sont insuffisantes.")).toBeVisible();
  } else {
    await expect(page.getByText(String(payload.qes)).first()).toBeVisible();
  }

  await captureScreenshot(page, filename);
}

async function captureScanError(page: Page) {
  await setScanMock(
    page,
    {
      code: "UPSTREAM_DATA_ERROR",
      status: 502,
      title: "Provider unavailable",
      type: "about:blank",
    },
    502,
  );

  await page.setViewportSize({ height: 900, width: 1440 });
  await page.goto(`/scan/${address}`);
  await expect(page.getByText("Scan indisponible. Réessayez plus tard.")).toBeVisible();
  await captureScreenshot(page, "07-scan-error.png");
}

async function captureWaitlist(page: Page) {
  await page.setViewportSize({ height: 1000, width: 1440 });
  await page.goto("/waitlist");
  await page.getByLabel("Email").fill("preview@example.invalid");
  await page.getByLabel("Wallet").fill(address);
  await page.getByLabel("Source").fill("frontend preview");
  await page.getByLabel("J'accepte d'être contacté au sujet des mises à jour QuantaLayer.").check();
  await page.getByRole("button", { name: "Rejoindre la waitlist" }).click();
  await expect(page.getByText("Inscription enregistrée.")).toBeVisible();
  await captureScreenshot(page, "08-waitlist.png");
}

async function captureStaticPage(
  page: Page,
  route: string,
  filename: string,
  viewport: { readonly height: number; readonly width: number },
) {
  await page.setViewportSize(viewport);
  await page.goto(route);
  await page.waitForLoadState("networkidle");
  await captureScreenshot(page, filename);
}

async function captureStats(page: Page) {
  await page.setViewportSize({ height: 1200, width: 1440 });
  await page.goto("/stats");
  await expect(page.getByText("128")).toBeVisible();
  await captureScreenshot(page, "10-stats-dashboard.png");
}

async function captureOgCard(request: APIRequestContext) {
  const response = await request.get(`/api/og/score?address=${address}&qes=69&qci=82&grade=B`);

  expect(response.ok()).toBe(true);
  await writeFile(path.join(outputDir, "11-og-score-card.png"), await response.body());
}

async function setScanMock(page: Page, payload: unknown, status: number) {
  await page.goto("/");
  await page.evaluate(
    ({ nextPayload, nextStatus }) => {
      window.localStorage.setItem(
        "__quantalayer_preview_scan_payload",
        JSON.stringify(nextPayload),
      );
      window.localStorage.setItem("__quantalayer_preview_scan_status", String(nextStatus));
    },
    { nextPayload: payload, nextStatus: status },
  );
}

async function captureScreenshot(page: Page, filename: string) {
  await hideNextDevTools(page);
  await page.screenshot({
    fullPage: true,
    path: path.join(outputDir, filename),
  });
}

async function hideNextDevTools(page: Page) {
  await page
    .addStyleTag({
      content: `
        nextjs-portal,
        [data-nextjs-dev-overlay],
        [data-nextjs-dev-tools-button],
        [data-nextjs-toast] {
          display: none !important;
          visibility: hidden !important;
        }
      `,
    })
    .catch(() => undefined);

  await page.evaluate(() => {
    document.querySelectorAll("nextjs-portal").forEach((element) => element.remove());
  });
}
