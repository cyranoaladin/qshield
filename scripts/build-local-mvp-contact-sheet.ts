import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const previewDir = path.resolve("docs/reports/local_mvp_display");
const galleryPath = path.join(previewDir, "gallery.html");
const contactSheetPath = path.join(previewDir, "00-local-contact-sheet.png");

const screenshots = [
  ["01-local-landing.png", "Landing"],
  ["02-local-scan-success.png", "Scan success"],
  ["03-local-scan-low-confidence.png", "Scan low confidence"],
  ["04-local-scan-pda.png", "Scan PDA"],
  ["05-local-scan-error.png", "Scan error"],
  ["06-local-waitlist.png", "Waitlist success"],
  ["07-local-learn.png", "Learn"],
  ["08-local-stats.png", "Stats"],
  ["09-local-og-card.png", "OG card"],
  ["10-local-scan-loading.png", "Scan loading"],
  ["11-local-waitlist-duplicate.png", "Waitlist duplicate"],
  ["12-local-waitlist-error.png", "Waitlist error"],
] as const;

function main() {
  mkdirSync(previewDir, { recursive: true });
  assertScreenshotsExist();
  writeFileSync(galleryPath, buildGalleryHtml(), "utf8");
  formatGallery();
  renderContactSheet();

  console.log(`Wrote ${path.relative(process.cwd(), galleryPath)}`);
  console.log(`Wrote ${path.relative(process.cwd(), contactSheetPath)}`);
}

function assertScreenshotsExist() {
  const missing = screenshots
    .map(([file]) => file)
    .filter((file) => !existsSync(path.join(previewDir, file)));

  if (missing.length > 0) {
    throw new Error(`Missing local MVP screenshots: ${missing.join(", ")}`);
  }
}

function buildGalleryHtml(): string {
  const cards = screenshots
    .map(([file, title]) => {
      return `
        <article class="shot">
          <a href="./${file}">
            <img alt="${escapeHtml(title)}" src="./${file}" />
          </a>
          <h2>${escapeHtml(title)}</h2>
          <p><a href="./${file}">Open original PNG</a></p>
        </article>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>QuantaLayer Local MVP Display</title>
    <style>
      :root {
        color-scheme: light;
        --background: #f7faf9;
        --border: #dfe7e5;
        --foreground: #17202a;
        --muted: #5f6f6d;
        --primary: #167f75;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: var(--background);
        color: var(--foreground);
        font-family:
          Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      main {
        margin: 0 auto;
        max-width: 1480px;
        padding: 40px 28px 56px;
      }

      header {
        display: grid;
        gap: 10px;
        margin-bottom: 28px;
      }

      h1 {
        font-size: clamp(32px, 5vw, 58px);
        line-height: 1;
        margin: 0;
      }

      p {
        color: var(--muted);
        line-height: 1.55;
        margin: 0;
      }

      a {
        color: var(--primary);
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
      }

      .grid {
        display: grid;
        gap: 22px;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      }

      .shot {
        background: #fff;
        border: 1px solid var(--border);
        border-radius: 12px;
        display: grid;
        gap: 12px;
        min-width: 0;
        padding: 16px;
      }

      .shot img {
        background: #fff;
        border: 1px solid var(--border);
        border-radius: 8px;
        display: block;
        height: 360px;
        object-fit: contain;
        object-position: top center;
        width: 100%;
      }

      .shot h2 {
        font-size: 18px;
        line-height: 1.2;
        margin: 0;
      }

      .shot p {
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <p>QuantaLayer Scan MVP</p>
        <h1>Local MVP Display</h1>
        <p>Captures from the local Next.js frontend connected to scripts/mock-mvp-api.ts. No real provider, API or database calls.</p>
      </header>
      <section class="grid" aria-label="Local MVP screenshots">
        ${cards}
      </section>
    </main>
  </body>
</html>
`;
}

function renderContactSheet() {
  execFileSync(
    "pnpm",
    [
      "--filter",
      "@quantalayer/web",
      "exec",
      "playwright",
      "screenshot",
      "--full-page",
      "--wait-for-timeout=1500",
      "--viewport-size=1600,2400",
      pathToFileURL(galleryPath).toString(),
      contactSheetPath,
    ],
    { stdio: "inherit" },
  );
}

function formatGallery() {
  execFileSync("pnpm", ["exec", "prettier", "--write", galleryPath], { stdio: "inherit" });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

main();
