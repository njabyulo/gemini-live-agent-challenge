import type { TApiContext } from "../../../utils/hono";

import {
  SLessonFileUpdateBody,
  SLessonRunCommandBody,
  SLessonRuntimeBody,
  SLessonSandboxQuery,
} from "./schemas";
import {
  bootstrapLessonWorkspace,
  getLessonSession,
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

  const workspace = await bootstrapLessonWorkspace(c.env);
  return c.json(workspace);
};

export const getLessonMainFileHandler = async (c: TApiContext) => {
  if (!requireSession(c)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { sandboxId } = SLessonSandboxQuery.parse({
    sandboxId: c.req.query("sandboxId"),
  });
  const lessonSession = await getLessonSession({ env: c.env, sandboxId });
  const file = await lessonSession.readFile("/workspace/main.py");

  return c.json({
    path: "/workspace/main.py",
    content: file.content,
  });
};

export const updateLessonMainFileHandler = async (c: TApiContext) => {
  if (!requireSession(c)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = SLessonFileUpdateBody.parse(await c.req.json());
  const lessonSession = await getLessonSession({
    env: c.env,
    sandboxId: body.sandboxId,
  });

  await lessonSession.writeFile("/workspace/main.py", body.content);

  return c.json({
    ok: true,
    path: "/workspace/main.py",
  });
};

export const resetLessonWorkspaceHandler = async (c: TApiContext) => {
  if (!requireSession(c)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const workspace = await bootstrapLessonWorkspace(c.env);
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
    sandboxId: body.sandboxId,
    sourceCode: body.sourceCode,
  });

  return c.json(runtime);
};

export const getLessonTerminalHandler = async (c: TApiContext) => {
  if (!requireSession(c)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { sandboxId } = SLessonSandboxQuery.parse({
    sandboxId: c.req.query("sandboxId"),
  });
  const lessonSession = await getLessonSession({ env: c.env, sandboxId });
  return lessonSession.terminal(c.req.raw);
};

export const echoLessonRuntimeHandler = async (c: TApiContext) => {
  if (!requireSession(c)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const snapshot = SLessonRuntimeBody.parse(await c.req.json());
  return c.json(snapshot);
};
