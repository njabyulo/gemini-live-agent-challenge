import type { TApiContext } from "../../../utils/hono";

export const LIVE_SESSION_TOKEN_ROUTES = {
  token: "/api/live/token",
} as const;

export const requireLiveSessionTokenSession = (c: TApiContext) => {
  const session = c.get("session");

  if (!session) {
    return null;
  }

  return session;
};
