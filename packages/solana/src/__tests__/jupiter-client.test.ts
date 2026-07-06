import { describe, expect, it } from "vitest";

import { JupiterPriceClient } from "../jupiter/client.js";

describe("JupiterPriceClient", () => {
  it("queries prices in one batched request", async () => {
    const urls: string[] = [];
    const client = new JupiterPriceClient({
      baseUrl: "https://price.example.test/v2",
      fetchFn: async (url) => {
        urls.push(String(url));

        return new Response(
          JSON.stringify({
            data: {
              MintA: { price: 2.5 },
              MintB: { price: 7 },
            },
          }),
        );
      },
    });

    const prices = await client.getPrices(["MintA", "MintB"]);

    expect(urls).toHaveLength(1);
    expect(urls[0]).toContain("ids=MintA%2CMintB");
    expect(prices.get("MintA")).toBe(2.5);
    expect(prices.get("MintB")).toBe(7);
  });
});
