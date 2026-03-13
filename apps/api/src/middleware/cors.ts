import type { MiddlewareHandler } from "hono";
import { cors } from "hono/cors";

import { getTrustedOrigins } from "../utils/env";
import type { IApiHonoEnv } from "../utils/hono";

export const applyApiCors: MiddlewareHandler<IApiHonoEnv> = async (c, next) => {
  const middleware = cors({
    credentials: true,
    origin: getTrustedOrigins(c.env),
  });

  return middleware(c, next);
};
