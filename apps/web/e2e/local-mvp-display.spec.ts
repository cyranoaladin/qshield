import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const outputDir = path.resolve(process.cwd(), "../../docs/reports/local_mvp_display");

const successAddress = "11111111111111111111111111111111";
const lowConfidenceAddress = "LowConfidence111111111111111111111111111";
const pdaAddress = "PdaPreview111111111111111111111111111111";
const errorAddress = "ErrorPreview11111111111111111111111111111";

test.skip(
  process.env.LOCAL_MVP_DISPLAY !== "1",
  "Local MVP display capture requires the mock API and web server.",
);
test.setTimeout(120_000);

test("captures the local MVP display connected to the mock API", async ({ page, request }) => {
  await mkdir(outputDir, { recursive: true });

  await captureStaticPage(page, "/", "01-local-landing.png", {
    height: 1000,
    width: 1440,
  });
  await captureScanLoadingAndSuccess(page);
  await captureScanState(page, lowConfidenceAddress, "03-local-scan-low-confidence.png", {
    expectedText: "Grade masqué car les données sont insuffisantes.",
  });
  await captureScanState(page, pdaAddress, "04-local-scan-pda.png", {
    expectedText: "Grade non applicable pour cette adresse.",
  });
  await captureScanState(page, errorAddress, "05-local-scan-error.png", {
    expectedText: "Service indisponible. Réessayez plus tard.",
  });
  await captureWaitlistState(page, "review@example.invalid", "Inscription enregistrée.", {
    filename: "06-local-waitlist.png",
  });
  await captureStaticPage(page, "/learn/why-solana", "07-local-learn.png", {
    height: 1200,
    width: 1440,
  });
  await captureStaticPage(page, "/stats", "08-local-stats.png", {
    height: 1200,
    width: 1440,
  });
  await captureOgCard(request);
  await captureWaitlistState(
    page,
    "duplicate@example.invalid",
    "Cette adresse e-mail est déjà inscrite.",
    { filename: "11-local-waitlist-duplicate.png" },
  );
  await captureWaitlistState(
    page,
    "error@example.invalid",
    "Service indisponible. Réessayez plus tard.",
    { filename: "12-local-waitlist-error.png" },
  );
});

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

async function captureScanLoadingAndSuccess(page: Page) {
  await page.setViewportSize({ height: 1100, width: 1440 });
  await page.goto(`/scan/${successAddress}`);
  await expect(page.getByText("Analyse des données publiques...")).toBeVisible();
  await captureScreenshot(page, "10-local-scan-loading.png");
  await expect(page.getByText("69").first()).toBeVisible();
  await captureScreenshot(page, "02-local-scan-success.png");
}

async function captureScanState(
  page: Page,
  address: string,
  filename: string,
  options: { readonly expectedText: string },
) {
  await page.setViewportSize({ height: 1100, width: 1440 });
  await page.goto(`/scan/${address}`);
  await expect(page.getByText(options.expectedText)).toBeVisible();
  await captureScreenshot(page, filename);
}

async function captureWaitlistState(
  page: Page,
  email: string,
  expectedMessage: string,
  options: { readonly filename: string },
) {
  await page.setViewportSize({ height: 1000, width: 1440 });
  await page.goto("/waitlist");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Adresse Solana publique").fill(successAddress);
  await page.getByLabel("Source").fill("local MVP display");
  await page.getByLabel("J'accepte d'être contacté au sujet des mises à jour QuantaLayer.").check();
  await page.getByRole("button", { name: "Rejoindre la liste" }).click();
  await expect(page.getByText(expectedMessage)).toBeVisible();
  await captureScreenshot(page, options.filename);
}

async function captureOgCard(request: APIRequestContext) {
  const response = await request.get(
    `/api/og/score?address=${successAddress}&qes=69&qci=82&grade=B`,
  );

  expect(response.ok()).toBe(true);
  await writeFile(path.join(outputDir, "09-local-og-card.png"), await response.body());
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
