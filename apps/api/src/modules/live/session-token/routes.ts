import { createApiApp } from "../../../utils/hono";

import { createLiveSessionTokenHandler } from "./handlers";
import { LIVE_SESSION_TOKEN_ROUTES } from "./utils";

export const createLiveSessionTokenRoutes = () => {
  const app = createApiApp();

  app.post(LIVE_SESSION_TOKEN_ROUTES.token, createLiveSessionTokenHandler);

  return app;
};
