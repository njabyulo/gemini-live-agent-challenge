import { z } from "zod";

export const SMigrationResponse = z.object({
  message: z.string(),
  created: z.array(z.string()).optional(),
  added: z.array(z.string()).optional(),
});
