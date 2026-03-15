import { logger } from "hono/logger";

import { createApiApp } from "./utils/hono";
import { handleApiError } from "./utils/errors";
import { applyApiCors } from "./middleware/cors";
import { attachSession } from "./middleware/session";
import { createHealthRoutes } from "./modules/platform/health/routes";
import { createMigrationRoutes } from "./modules/platform/migrations/routes";
import { createAuthSessionRoutes } from "./modules/auth/session/routes";
import { createLessonWorkspaceRoutes } from "./modules/lesson/workspace/routes";

const app = createApiApp();

app.onError(handleApiError);

app.use(logger());
app.use("/api/*", applyApiCors);
app.use("/api/*", attachSession);

app.route("/", createHealthRoutes());
app.route("/", createMigrationRoutes());
app.route("/", createAuthSessionRoutes());
app.route("/", createLessonWorkspaceRoutes());

export default app;
