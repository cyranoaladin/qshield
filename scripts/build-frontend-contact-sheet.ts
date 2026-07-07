import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const previewDir = path.resolve("docs/reports/frontend_preview");
const galleryPath = path.join(previewDir, "gallery.html");
const contactSheetPath = path.join(previewDir, "00-contact-sheet.png");

const screenshots = [
  ["01-landing-desktop.png", "Landing desktop"],
  ["02-landing-mobile.png", "Landing mobile"],
  ["03-scan-result-desktop.png", "Scan result desktop"],
  ["04-scan-result-mobile.png", "Scan result mobile"],
  ["05-scan-low-confidence.png", "Low confidence"],
  ["06-scan-pda-not-applicable.png", "PDA not applicable"],
  ["07-scan-error.png", "API error"],
  ["08-waitlist.png", "Waitlist"],
  ["09-learn-why-solana.png", "Learn why Solana"],
  ["10-stats-dashboard.png", "Stats dashboard"],
  ["11-og-score-card.png", "OG score card"],
  ["12-waitlist-mobile.png", "Waitlist mobile"],
  ["13-learn-mobile.png", "Learn mobile"],
  ["14-stats-mobile.png", "Stats mobile"],
  ["15-scan-loading.png", "Scan loading"],
  ["16-waitlist-duplicate.png", "Waitlist duplicate"],
  ["17-waitlist-error.png", "Waitlist error"],
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
    throw new Error(`Missing frontend preview screenshots: ${missing.join(", ")}`);
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
    <title>QuantaLayer Frontend Preview</title>
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

      @media (max-width: 520px) {
        main {
          padding: 24px 16px 40px;
        }

        .grid {
          grid-template-columns: minmax(0, 1fr);
        }

        .shot img {
          height: 280px;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <p>QuantaLayer Scan MVP</p>
        <h1>Frontend Preview Gallery</h1>
        <p>Static, dependency-free visual review pack. Images are synthetic frontend captures with mocked API responses.</p>
      </header>
      <section class="grid" aria-label="Frontend screenshots">
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
