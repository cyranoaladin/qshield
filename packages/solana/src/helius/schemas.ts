import { z } from "zod";

export const heliusTokenInfoSchema = z.object({
  balance: z.union([z.string(), z.number()]).transform((value) => String(value)),
  decimals: z.number().int().nonnegative(),
  symbol: z.string().optional(),
  token_program: z.string().optional(),
});

export const heliusAssetSchema = z
  .object({
    id: z.string(),
    interface: z.string().default("Unknown"),
    token_info: heliusTokenInfoSchema.optional(),
  })
  .transform((asset) => ({
    id: asset.id,
    interface: asset.interface,
    ...(asset.token_info === undefined
      ? {}
      : {
          tokenInfo: {
            balance: asset.token_info.balance,
            decimals: asset.token_info.decimals,
            mint: asset.id,
            ...(asset.token_info.symbol === undefined ? {} : { symbol: asset.token_info.symbol }),
          },
        }),
  }));

export const heliusAssetsPageSchema = z.object({
  items: z.array(heliusAssetSchema),
  limit: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
  total: z.number().int().nonnegative().optional(),
});

export const solBalanceResultSchema = z.object({
  value: z.number().int().nonnegative(),
});

export const stakeAccountsResultSchema = z.array(
  z.object({
    account: z.object({
      lamports: z.number().int().nonnegative(),
    }),
  }),
);
