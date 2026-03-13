import { createApiApp } from "../../../utils/hono";

import { handleBetterAuthEntry, getSessionHandler } from "./handlers";
import { AUTH_SESSION_ROUTES } from "./utils";

export const createAuthSessionRoutes = () => {
  const app = createApiApp();

  app.on(["GET", "POST"], AUTH_SESSION_ROUTES.auth, handleBetterAuthEntry);
  app.get(AUTH_SESSION_ROUTES.session, getSessionHandler);

  return app;
};
