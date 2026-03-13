export const lessonWorkspaceOpenApi = [
  {
    method: "POST",
    operationId: "bootstrapLessonWorkspace",
    path: "/api/lesson/bootstrap",
    summary: "Create a fresh lesson workspace",
    tags: ["lesson"],
  },
  {
    method: "PUT",
    operationId: "updateLessonMainFile",
    path: "/api/lesson/file/main.py",
    summary: "Save main.py to the active lesson workspace",
    tags: ["lesson"],
  },
  {
    method: "POST",
    operationId: "runLessonCommand",
    path: "/api/lesson/run",
    summary: "Execute a command in the lesson workspace",
    tags: ["lesson"],
  },
] as const;
