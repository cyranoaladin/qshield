import { UpstreamDataError } from "@quantalayer/shared";

import type { FetchLike, HeliusAsset, StakeAccount } from "../types.js";
import {
  heliusAssetsPageSchema,
  solBalanceResultSchema,
  stakeAccountsResultSchema,
} from "./schemas.js";

type HeliusClientOptions = {
  readonly apiKey: string;
  readonly fetchFn?: FetchLike;
  readonly maxRetries?: number;
  readonly rpcUrl: string;
  readonly timeoutMs?: number;
};

export class HeliusClient {
  private readonly apiKey: string;
  private readonly fetchFn: FetchLike;
  private readonly maxRetries: number;
  private readonly rpcUrl: string;
  private readonly timeoutMs: number;

  constructor(options: HeliusClientOptions) {
    this.apiKey = options.apiKey;
    this.fetchFn = options.fetchFn ?? fetch;
    this.maxRetries = options.maxRetries ?? 2;
    this.rpcUrl = options.rpcUrl;
    this.timeoutMs = options.timeoutMs ?? 10_000;
  }

  async getAssetsByOwner(address: string): Promise<readonly HeliusAsset[]> {
    const assets: HeliusAsset[] = [];
    let page = 1;
    const limit = 1000;

    for (;;) {
      const result = await this.request("getAssetsByOwner", {
        displayOptions: {
          showFungible: true,
        },
        limit,
        ownerAddress: address,
        page,
      });
      const parsed = heliusAssetsPageSchema.safeParse(result);

      if (!parsed.success) {
        throw new UpstreamDataError("Invalid Helius DAS response", {
          detail: parsed.error.message,
        });
      }

      assets.push(...parsed.data.items);

      const total = parsed.data.total ?? assets.length;
      const pageLimit = parsed.data.limit ?? limit;

      if (assets.length >= total || parsed.data.items.length < pageLimit) {
        break;
      }

      page += 1;
    }

    return assets;
  }

  async getSolBalanceLamports(address: string): Promise<bigint> {
    const result = await this.request("getBalance", [address]);
    const parsed = solBalanceResultSchema.safeParse(result);

    if (!parsed.success) {
      throw new UpstreamDataError("Invalid Helius balance response", {
        detail: parsed.error.message,
      });
    }

    return BigInt(parsed.data.value);
  }

  async getStakeAccountsByAuthority(address: string): Promise<readonly StakeAccount[]> {
    const accountsByPubkey = new Map<string, { readonly lamports: bigint }>();

    for (const offset of [12, 44]) {
      const result = await this.request("getProgramAccounts", [
        "Stake11111111111111111111111111111111111111",
        {
          encoding: "jsonParsed",
          filters: [
            {
              memcmp: {
                bytes: address,
                offset,
              },
            },
          ],
        },
      ]);
      const parsed = stakeAccountsResultSchema.safeParse(result);

      if (!parsed.success) {
        throw new UpstreamDataError("Invalid Helius stake response", {
          detail: parsed.error.message,
        });
      }

      for (const stakeAccount of parsed.data) {
        accountsByPubkey.set(stakeAccount.pubkey, {
          lamports: BigInt(stakeAccount.account.lamports),
        });
      }
    }

    return [...accountsByPubkey.values()];
  }

  private async request(method: string, params: unknown): Promise<unknown> {
    const body = {
      id: "quantalayer",
      jsonrpc: "2.0",
      method,
      params,
    };
    const url = heliusRpcUrlWithApiKey(this.rpcUrl, this.apiKey);

    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await this.fetchFn(url, {
          body: JSON.stringify(body),
          headers: {
            "content-type": "application/json",
          },
          method: "POST",
          signal: controller.signal,
        });
        const payload = (await response.json()) as {
          readonly error?: unknown;
          readonly result?: unknown;
        };

        if (response.ok && payload.error === undefined) {
          return payload.result;
        }

        if (!shouldRetry(response.status) || attempt === this.maxRetries) {
          throw new UpstreamDataError("Helius RPC request failed", {
            detail: `method=${method} status=${response.status}`,
          });
        }
      } catch (error) {
        if (error instanceof UpstreamDataError) {
          throw error;
        }

        if (attempt === this.maxRetries) {
          throw new UpstreamDataError("Helius RPC request failed", {
            detail: error instanceof Error ? error.message : `method=${method}`,
          });
        }
      } finally {
        clearTimeout(timeout);
      }

      await sleep(25 * 2 ** attempt);
    }

    throw new UpstreamDataError("Helius RPC request failed", {
      detail: `method=${method}`,
    });
  }
}

function heliusRpcUrlWithApiKey(rpcUrl: string, apiKey: string): string {
  const url = new URL(rpcUrl);

  if (!url.searchParams.has("api-key")) {
    url.searchParams.set("api-key", apiKey);
  }

  return url.toString();
}

function shouldRetry(status: number): boolean {
  return status === 429 || status >= 500;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
