import { describe, expect, it } from "vitest";

import { scanAddress } from "../scan-address.js";
import type { HeliusDataClient, JupiterPriceClientLike } from "../types.js";

describe("scanAddress", () => {
  it("maps read-only provider data into RawWalletScan", async () => {
    const helius: HeliusDataClient = {
      getAssetsByOwner: async () => [
        {
          id: "MintA",
          interface: "FungibleToken",
          tokenInfo: {
            balance: "10000000",
            decimals: 6,
            mint: "MintA",
          },
        },
        {
          id: "MintB",
          interface: "FungibleToken",
          tokenInfo: {
            balance: "500",
            decimals: 0,
            mint: "MintB",
          },
        },
      ],
      getSolBalanceLamports: async () => 2_000_000_000n,
      getStakeAccountsByAuthority: async () => [{ lamports: 1_000_000_000n }],
    };
    const jupiter: JupiterPriceClientLike = {
      getPrices: async (ids) =>
        new Map(
          ids.includes("MintA")
            ? [
                ["So11111111111111111111111111111111111111112", 100],
                ["MintA", 5],
              ]
            : [],
        ),
    };

    const result = await scanAddress("11111111111111111111111111111111", {
      cluster: "mainnet-beta",
      helius,
      jupiter,
    });

    expect(result.accountClass).toBe("system");
    expect(result.solBalanceLamports).toBe(2_000_000_000n);
    expect(result.tokenAccountsCount).toBe(2);
    expect(result.significantTokenAccounts).toBe(1);
    expect(result.totalUsd).toBe(350);
    expect(result.stakedOrLockedUsd).toBe(100);
    expect(result.confidence.resolvedPrices).toBeGreaterThan(0);
    expect(result.confidence.resolvedPrices).toBeLessThan(1);
    expect(result.source).toEqual({
      cluster: "mainnet-beta",
      priceProvider: "jupiter",
      rpcProvider: "helius",
    });
  });
});
