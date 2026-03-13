import { createApiApp } from "../../../utils/hono";

import { getHealthHandler } from "./handlers";
import { PLATFORM_HEALTH_ROUTES } from "./utils";

export const createHealthRoutes = () => {
  const app = createApiApp();

  app.get(PLATFORM_HEALTH_ROUTES.health, getHealthHandler);

  return app;
};
