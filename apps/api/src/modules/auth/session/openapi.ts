export const authSessionOpenApi = [
  {
    method: "GET",
    operationId: "getSession",
    path: "/api/session",
    summary: "Get the current authenticated session",
    tags: ["auth"],
  },
  {
    method: "GET|POST",
    operationId: "handleBetterAuth",
    path: "/api/auth/*",
    summary: "Better Auth route entrypoint",
    tags: ["auth"],
  },
] as const;
