export const liveSessionTokenOpenApi = [
  {
    method: "POST",
    operationId: "createLiveSessionToken",
    path: "/api/live/token",
    summary: "Issue a short-lived token for the live tutor WebSocket",
    tags: ["live"],
  },
] as const;
