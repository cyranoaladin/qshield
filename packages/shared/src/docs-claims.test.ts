import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const docsDir = path.join(repoRoot, "docs");
const claimsMatrixPath = path.join(docsDir, "claims_matrix.md");

const guardedDocs = new Set(["glossary_pqc.md", "threat_model_qscan.md", "whitepaper_v0.1.md"]);

function normalizeForClaimsSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fr-FR");
}

function readBannedWordsBlock(markdown: string): string[] {
  const match = markdown.match(/```banned-words\n(?<words>[\s\S]*?)\n```/u);

  if (!match?.groups?.words) {
    throw new Error("Missing fenced banned-words block in docs/claims_matrix.md");
  }

  return match.groups.words
    .split("\n")
    .map((word) => word.trim())
    .filter((word) => word.length > 0);
}

describe("normative documentation claims policy", () => {
  it("does not use banned claims outside the claims matrix source of truth", () => {
    expect(existsSync(claimsMatrixPath)).toBe(true);

    const bannedWords = readBannedWordsBlock(readFileSync(claimsMatrixPath, "utf8"));
    const guardedMarkdownFiles = readdirSync(docsDir).filter(
      (fileName) => fileName.endsWith(".md") && guardedDocs.has(fileName),
    );

    expect(guardedMarkdownFiles.sort()).toEqual([...guardedDocs].sort());

    const violations = guardedMarkdownFiles.flatMap((fileName) => {
      const markdown = normalizeForClaimsSearch(readFileSync(path.join(docsDir, fileName), "utf8"));

      return bannedWords
        .filter((bannedWord) => markdown.includes(normalizeForClaimsSearch(bannedWord)))
        .map((bannedWord) => `${fileName}: ${bannedWord}`);
    });

    expect(violations).toEqual([]);
  });
});
