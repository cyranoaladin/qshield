import { describe, expect, it } from "vitest";

import { SOLANA_PACKAGE_STATUS } from "./index.js";

describe("solana package scaffold", () => {
  it("is explicitly scaffolded without data-layer I/O before LOT-05", () => {
    expect(SOLANA_PACKAGE_STATUS).toEqual({
      implemented: false,
      packageName: "@quantalayer/solana",
    });
  });
});
