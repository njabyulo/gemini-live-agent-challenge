import { getAuth } from "../../../utils/auth";
import type { TApiContext } from "../../../utils/hono";

import { requireSession } from "./utils";
import { SUnauthorizedSessionResponse } from "./schemas";

export const handleBetterAuthEntry = (c: TApiContext) => {
  const auth = getAuth(c.env);
  return auth.handler(c.req.raw);
};

export const getSessionHandler = (c: TApiContext) => {
  const session = requireSession(c);

  if (!session) {
    return c.json(SUnauthorizedSessionResponse.parse({ session: null }), 401);
  }

  return c.json(session);
};
