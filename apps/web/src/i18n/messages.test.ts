import { describe, expect, it } from "vitest";

import { getMessages } from "./messages";

describe("getMessages", () => {
  it("returns French as the default product locale content", () => {
    const messages = getMessages("fr");

    expect(messages.home.primaryAction).toBe("Scanner une adresse");
    expect(messages.home.eyebrow).toBe("Post-Quantum Readiness for Solana");
    expect(messages.metadata.title).toBe("QuantaLayer");
  });

  it("keeps English secondary locale content available", () => {
    const messages = getMessages("en");

    expect(messages.home.primaryAction).toBe("Scan address");
    expect(messages.metadata.description).toContain("Solana");
    expect(messages.metadata.description).toContain("readiness");
  });
});
