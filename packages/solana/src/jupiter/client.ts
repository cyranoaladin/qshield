import { UpstreamDataError } from "@quantalayer/shared";

import type { FetchLike, JupiterPriceClientLike } from "../types.js";
import { jupiterPriceResponseSchema } from "./schemas.js";

type JupiterPriceClientOptions = {
  readonly baseUrl: string;
  readonly fetchFn?: FetchLike;
  readonly timeoutMs?: number;
};

export class JupiterPriceClient implements JupiterPriceClientLike {
  private readonly baseUrl: string;
  private readonly fetchFn: FetchLike;
  private readonly timeoutMs: number;

  constructor(options: JupiterPriceClientOptions) {
    this.baseUrl = options.baseUrl;
    this.fetchFn = options.fetchFn ?? fetch;
    this.timeoutMs = options.timeoutMs ?? 10_000;
  }

  async getPrices(ids: readonly string[]): Promise<ReadonlyMap<string, number>> {
    const uniqueIds = [...new Set(ids)].filter((id) => id.length > 0);

    if (uniqueIds.length === 0) {
      return new Map();
    }

    const url = new URL(this.baseUrl);
    url.searchParams.set("ids", uniqueIds.join(","));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchFn(url, {
        method: "GET",
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new UpstreamDataError("Jupiter price request failed", {
          detail: `status=${response.status}`,
        });
      }

      const parsed = jupiterPriceResponseSchema.safeParse(await response.json());

      if (!parsed.success) {
        throw new UpstreamDataError("Invalid Jupiter price response", {
          detail: parsed.error.message,
        });
      }

      return new Map(
        Object.entries(parsed.data.data).flatMap(([id, priceData]) => {
          return priceData.price === undefined || priceData.price === null
            ? []
            : [[id, priceData.price] as const];
        }),
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
