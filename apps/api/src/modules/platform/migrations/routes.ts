import { createApiApp } from "../../../utils/hono";

import { runMigrationsHandler } from "./handlers";
import { PLATFORM_MIGRATION_ROUTES } from "./utils";

export const createMigrationRoutes = () => {
  const app = createApiApp();

  app.post(PLATFORM_MIGRATION_ROUTES.migrate, runMigrationsHandler);

  return app;
};
