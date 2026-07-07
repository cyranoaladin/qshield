import { z } from "zod";

export const jupiterPriceResponseSchema = z.object({
  data: z.record(
    z.string(),
    z.object({
      price: z.number().nonnegative().nullable().optional(),
    }),
  ),
});
