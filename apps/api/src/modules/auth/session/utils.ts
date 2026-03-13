import type { TApiContext } from "../../../utils/hono";

export const AUTH_SESSION_ROUTES = {
  auth: "/api/auth/*",
  session: "/api/session",
} as const;

export const requireSession = (c: TApiContext) => {
  const session = c.get("session");

  if (!session) {
    return null;
  }

  return session;
};
