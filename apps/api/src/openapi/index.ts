import { authSessionOpenApi } from "../modules/auth/session/openapi";
import { lessonWorkspaceOpenApi } from "../modules/lesson/workspace/openapi";
import { healthOpenApi } from "../modules/platform/health/openapi";
import { migrationsOpenApi } from "../modules/platform/migrations/openapi";

export const apiOpenApiDefinition = {
  info: {
    title: "Agent Tutor API",
    description:
      "API surface for auth, disposable lesson workspaces, and hackathon runtime operations.",
    version: "0.1.0",
  },
  modules: [
    healthOpenApi,
    migrationsOpenApi,
    ...authSessionOpenApi,
    ...lessonWorkspaceOpenApi,
  ],
  tooling: {
    docs: "zudoku",
    note: "OpenAPI metadata is scaffolded here for future Zudoku documentation wiring.",
  },
} as const;
