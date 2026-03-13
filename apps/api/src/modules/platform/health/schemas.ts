import { z } from "zod";

export const SHealthResponse = z.object({
  status: z.literal("ok"),
});
