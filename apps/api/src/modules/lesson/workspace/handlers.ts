import type { TApiContext } from "../../../utils/hono";

import {
  SLessonFileUpdateBody,
  SLessonLoadBody,
  SLessonRunCommandBody,
  SLessonRuntimeBody,
  SLessonSandboxQuery,
} from "./schemas";
import {
  bootstrapLessonWorkspace,
  runLessonCommand,
} from "./utils";

const requireSession = (c: TApiContext) => {
  const session = c.get("session");

  if (!session) {
    return null;
  }

  return session;
};

export const bootstrapLessonWorkspaceHandler = async (c: TApiContext) => {
  if (!requireSession(c)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const workspace = await bootstrapLessonWorkspace();
  return c.json(workspace);
};

export const loadLessonWorkspaceHandler = async (c: TApiContext) => {
  if (!requireSession(c)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = SLessonLoadBody.parse(await c.req.json());
  const workspace = await bootstrapLessonWorkspace(body.lessonId);
  return c.json(workspace);
};

export const getLessonMainFileHandler = async (c: TApiContext) => {
  if (!requireSession(c)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  SLessonSandboxQuery.parse({
    sandboxId: c.req.query("sandboxId"),
  });
  return c.json(
    {
      error:
        "Remote file reads are no longer supported. The browser now owns current file state.",
    },
    410,
  );
};

export const updateLessonMainFileHandler = async (c: TApiContext) => {
  if (!requireSession(c)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = SLessonFileUpdateBody.parse(await c.req.json());
  void body;

  return c.json({
    ok: true,
    path: "/workspace/main.py",
  });
};

export const resetLessonWorkspaceHandler = async (c: TApiContext) => {
  if (!requireSession(c)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json().catch(() => ({}));
  const parsed = SLessonLoadBody.partial().parse(body);
  const workspace = await bootstrapLessonWorkspace(parsed.lessonId);
  return c.json(workspace);
};

export const runLessonCommandHandler = async (c: TApiContext) => {
  if (!requireSession(c)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = SLessonRunCommandBody.parse(await c.req.json());
  const runtime = await runLessonCommand({
    command: body.command,
    env: c.env,
    lessonId: body.lessonId,
    sourceCode: body.sourceCode,
  });

  return c.json(runtime);
};

export const getLessonTerminalHandler = async (c: TApiContext) => {
  if (!requireSession(c)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  SLessonSandboxQuery.parse({
    sandboxId: c.req.query("sandboxId"),
  });
  return c.json(
    {
      error:
        "Interactive terminal sessions are not available in the runner-backed architecture.",
    },
    501,
  );
};

export const echoLessonRuntimeHandler = async (c: TApiContext) => {
  if (!requireSession(c)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const snapshot = SLessonRuntimeBody.parse(await c.req.json());
  return c.json(snapshot);
};
