import { describe, expect, it } from "vitest";

import { UpstreamDataError } from "@quantalayer/shared";

import { HeliusClient } from "../helius/client.js";

describe("HeliusClient", () => {
  it("paginates DAS getAssetsByOwner with showFungible enabled", async () => {
    const requests: unknown[] = [];
    const client = new HeliusClient({
      apiKey: "test-key",
      fetchFn: async (_url, init) => {
        const body = JSON.parse(String(init?.body));
        requests.push(body);

        if (body.params.page === 1) {
          return jsonResponse({
            result: {
              items: [fungibleAsset("MintA", "1000000", 6), fungibleAsset("MintB", "10", 0)],
              limit: 2,
              page: 1,
              total: 3,
            },
          });
        }

        return jsonResponse({
          result: {
            items: [fungibleAsset("MintC", "2", 0)],
            limit: 2,
            page: 2,
            total: 3,
          },
        });
      },
      rpcUrl: "https://example.helius-rpc.com",
    });

    const assets = await client.getAssetsByOwner("Owner111111111111111111111111111111111");

    expect(assets).toHaveLength(3);
    expect(requests).toHaveLength(2);
    expect(requests[0]).toMatchObject({
      method: "getAssetsByOwner",
      params: {
        displayOptions: { showFungible: true },
        limit: 1000,
        page: 1,
      },
    });
  });

  it("throws UpstreamDataError on malformed provider data", async () => {
    const client = new HeliusClient({
      apiKey: "test-key",
      fetchFn: async () => jsonResponse({ result: { items: "bad" } }),
      rpcUrl: "https://example.helius-rpc.com",
    });

    await expect(
      client.getAssetsByOwner("Owner111111111111111111111111111111111"),
    ).rejects.toBeInstanceOf(UpstreamDataError);
  });

  it("retries transient provider failures", async () => {
    let calls = 0;
    const client = new HeliusClient({
      apiKey: "test-key",
      fetchFn: async () => {
        calls += 1;

        return calls === 1
          ? jsonResponse({ error: { message: "busy" } }, 500)
          : jsonResponse({
              result: {
                items: [],
                limit: 1000,
                page: 1,
                total: 0,
              },
            });
      },
      rpcUrl: "https://example.helius-rpc.com",
    });

    await expect(
      client.getAssetsByOwner("Owner111111111111111111111111111111111"),
    ).resolves.toEqual([]);
    expect(calls).toBe(2);
  });

  it("does not retry non-rate-limited client errors", async () => {
    let calls = 0;
    const client = new HeliusClient({
      apiKey: "test-key",
      fetchFn: async () => {
        calls += 1;

        return jsonResponse({ error: { message: "bad request" } }, 400);
      },
      rpcUrl: "https://example.helius-rpc.com",
    });

    await expect(
      client.getAssetsByOwner("Owner111111111111111111111111111111111"),
    ).rejects.toBeInstanceOf(UpstreamDataError);
    expect(calls).toBe(1);
  });
});

function fungibleAsset(mint: string, balance: string, decimals: number) {
  return {
    id: mint,
    interface: "FungibleToken",
    token_info: {
      balance,
      decimals,
      symbol: mint.slice(0, 4),
      token_program: "spl-token",
    },
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}
