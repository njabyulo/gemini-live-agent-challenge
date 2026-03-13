export const healthOpenApi = {
  method: "GET",
  operationId: "getHealth",
  path: "/health",
  summary: "Service health check",
  tags: ["platform"],
} as const;
