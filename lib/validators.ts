import { z } from "zod";

export const reservationSchema = z.object({
  productId: z.string().min(1),
  warehouseId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const reservationParamsSchema =
  z.object({
    id: z.string().min(1),
  });