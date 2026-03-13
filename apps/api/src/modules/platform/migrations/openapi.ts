export const migrationsOpenApi = {
  method: "POST",
  operationId: "runInternalMigrations",
  path: "/api/internal/migrate",
  summary: "Run Better Auth migrations",
  tags: ["platform"],
} as const;
