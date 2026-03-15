import { z } from "zod";

export const SUnauthorizedLiveSessionTokenResponse = z.object({
  token: z.null(),
});

export const SLiveSessionTokenResponse = z.object({
  expiresAt: z.string().datetime(),
  token: z.string().min(1),
});
