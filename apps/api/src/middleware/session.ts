import type { MiddlewareHandler } from "hono";

import { getSessionFromHeaders } from "../utils/auth";
import type { IApiHonoEnv } from "../utils/hono";

export const attachSession: MiddlewareHandler<IApiHonoEnv> = async (
  c,
  next,
) => {
  const session = await getSessionFromHeaders(c.env, c.req.raw.headers);
  c.set("session", session);
  await next();
};
