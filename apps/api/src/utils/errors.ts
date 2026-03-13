import type { ErrorHandler } from "hono";

import type { IApiHonoEnv } from "./hono";

export const handleApiError: ErrorHandler<IApiHonoEnv> = (error, c) => {
  const message =
    error instanceof Error ? error.message : "Internal Server Error";

  if (/session|sandbox|not found|invalid/iu.test(message)) {
    return c.json({ error: message }, 400);
  }

  console.error("[api] unhandled error", error);
  return c.json({ error: message }, 500);
};
