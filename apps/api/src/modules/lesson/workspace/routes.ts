import { createApiApp } from "../../../utils/hono";

import {
  bootstrapLessonWorkspaceHandler,
  echoLessonRuntimeHandler,
  getLessonMainFileHandler,
  getLessonTerminalHandler,
  resetLessonWorkspaceHandler,
  runLessonCommandHandler,
  updateLessonMainFileHandler,
} from "./handlers";
import { LESSON_WORKSPACE_ROUTES } from "./utils";

export const createLessonWorkspaceRoutes = () => {
  const app = createApiApp();

  app.post(
    LESSON_WORKSPACE_ROUTES.bootstrap,
    bootstrapLessonWorkspaceHandler,
  );
  app.get(LESSON_WORKSPACE_ROUTES.file, getLessonMainFileHandler);
  app.put(LESSON_WORKSPACE_ROUTES.file, updateLessonMainFileHandler);
  app.post(LESSON_WORKSPACE_ROUTES.reset, resetLessonWorkspaceHandler);
  app.post(LESSON_WORKSPACE_ROUTES.run, runLessonCommandHandler);
  app.get(LESSON_WORKSPACE_ROUTES.terminal, getLessonTerminalHandler);
  app.post(LESSON_WORKSPACE_ROUTES.runtime, echoLessonRuntimeHandler);

  return app;
};
