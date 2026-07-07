import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = join(import.meta.dirname, "../../../..");
const claimsMatrixPath = join(repoRoot, "docs/claims_matrix.md");

const ignoredDirectories = new Set(["articles", "reports"]);

describe("banned claim compliance", () => {
  it("defines a machine-readable banned-claims block", () => {
    const claimsMatrix = readFileSync(claimsMatrixPath, "utf8");
    const bannedClaims = extractBannedClaims(claimsMatrix);

    expect(bannedClaims).toEqual(
      expect.arrayContaining([
        "quantum-proof",
        "unhackable",
        "100% secure",
        "garanti inviolable",
        "preuve quantique",
      ]),
    );
  });

  it("keeps exact banned claims out of active docs except the claims matrix", () => {
    const claimsMatrix = readFileSync(claimsMatrixPath, "utf8");
    const bannedClaims = extractBannedClaims(claimsMatrix);
    const activeDocs = listMarkdownFiles(join(repoRoot, "docs")).filter(
      (filePath) => filePath !== claimsMatrixPath,
    );

    const violations = activeDocs.flatMap((filePath) => {
      const content = readFileSync(filePath, "utf8");

      return bannedClaims
        .filter((claim) => containsExactClaim(content, claim))
        .map((claim) => `${relative(repoRoot, filePath)} contains ${claim}`);
    });

    expect(violations).toEqual([]);
  });

  it("keeps exact banned claims out of web source and i18n messages", () => {
    const claimsMatrix = readFileSync(claimsMatrixPath, "utf8");
    const bannedClaims = extractBannedClaims(claimsMatrix);
    const sourceFiles = listSourceFiles(join(repoRoot, "apps/web/src")).filter(
      (filePath) => filePath !== import.meta.filename,
    );

    const violations = sourceFiles.flatMap((filePath) => {
      const content = readFileSync(filePath, "utf8");

      return bannedClaims
        .filter((claim) => containsExactClaim(content, claim))
        .map((claim) => `${relative(repoRoot, filePath)} contains ${claim}`);
    });

    expect(violations).toEqual([]);
  });

  it("matches banned claims case-insensitively and accent-insensitively", () => {
    expect(
      containsExactClaim("Cette formule promet une PREUVE QUÁNTIQUE.", "preuve quantique"),
    ).toBe(true);
  });
});

function extractBannedClaims(markdown: string): string[] {
  const match = /```banned-claims\n([\s\S]*?)```/u.exec(markdown);
  const claims = match?.[1];

  if (claims === undefined) {
    throw new Error("docs/claims_matrix.md must contain a fenced banned-claims block");
  }

  return claims
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));
}

function listMarkdownFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const filePath = join(directory, entry);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      if (ignoredDirectories.has(entry)) {
        return [];
      }

      return listMarkdownFiles(filePath);
    }

    return entry.endsWith(".md") ? [filePath] : [];
  });
}

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const filePath = join(directory, entry);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      return listSourceFiles(filePath);
    }

    return /\.(ts|tsx)$/u.test(entry) ? [filePath] : [];
  });
}

function containsExactClaim(content: string, claim: string): boolean {
  const normalizedContent = normalizeForClaimsSearch(content);
  const normalizedClaim = normalizeForClaimsSearch(claim);
  const escaped = normalizedClaim.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const pattern = new RegExp(`(^|[^\\p{L}\\p{N}_-])${escaped}($|[^\\p{L}\\p{N}_-])`, "iu");

  return pattern.test(normalizedContent);
}

function normalizeForClaimsSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fr-FR");
}
