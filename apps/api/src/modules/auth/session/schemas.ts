import { z } from "zod";

export const SUnauthorizedSessionResponse = z.object({
  session: z.null(),
});
