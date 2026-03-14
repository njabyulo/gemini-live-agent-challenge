import {
  DEFAULT_LESSON_ID,
  DEFAULT_TERMINAL_SESSION_ID,
  DEFAULT_WORKSPACE_ROOT,
  getLessonDefinitionById,
} from "@agent-tutor/shared/consts";
import type {
  IRuntimeSnapshot,
  IWorkspaceBootstrapResponse,
} from "@agent-tutor/shared/types";
import { getSandbox } from "@cloudflare/sandbox";

import type { IApiEnv } from "../../../utils/env";

export const LESSON_WORKSPACE_ROUTES = {
  bootstrap: "/api/lesson/bootstrap",
  file: "/api/lesson/file/main.py",
  load: "/api/lesson/load",
  reset: "/api/lesson/reset",
  run: "/api/lesson/run",
  runtime: "/api/lesson/runtime",
  terminal: "/api/lesson/terminal",
} as const;

export const createWorkspaceSnapshot = (
  partial?: Partial<IRuntimeSnapshot>,
): IRuntimeSnapshot => ({
  sourceCode:
    partial?.sourceCode ??
    getLessonDefinitionById(DEFAULT_LESSON_ID)?.files[0]?.content ??
    "",
  command: partial?.command ?? "",
  stdout: partial?.stdout ?? "",
  stderr: partial?.stderr ?? "",
});

export const bootstrapLessonWorkspace = async (
  env: IApiEnv,
  lessonId = DEFAULT_LESSON_ID,
): Promise<IWorkspaceBootstrapResponse> => {
  const lessonDefinition = getLessonDefinitionById(lessonId);
  if (!lessonDefinition) {
    throw new Error(`Unknown lesson: ${lessonId}`);
  }

  const sandboxId = `lesson-${crypto.randomUUID().toLowerCase()}`;
  const sandbox = getSandbox(env.Sandbox, sandboxId, {
    sleepAfter: "20m",
  });

  const session = await sandbox.createSession({
    id: DEFAULT_TERMINAL_SESSION_ID,
    cwd: DEFAULT_WORKSPACE_ROOT,
    commandTimeoutMs: 60_000,
  });

  await session.mkdir(DEFAULT_WORKSPACE_ROOT, { recursive: true });

  for (const file of lessonDefinition.files) {
    await session.writeFile(file.path, file.content);
  }

  return {
    sandboxId,
    terminalSessionId: session.id,
    lesson: lessonDefinition.lesson,
    files: lessonDefinition.files,
    snapshot: createWorkspaceSnapshot({
      sourceCode: lessonDefinition.files[0]?.content ?? "",
    }),
  };
};

export const getLessonSession = async ({
  env,
  sandboxId,
}: {
  env: IApiEnv;
  sandboxId: string;
}) => {
  const sandbox = getSandbox(env.Sandbox, sandboxId, {
    sleepAfter: "20m",
  });

  return sandbox.getSession(DEFAULT_TERMINAL_SESSION_ID);
};

export const runLessonCommand = async ({
  command,
  env,
  sandboxId,
  sourceCode,
}: {
  command: string;
  env: IApiEnv;
  sandboxId: string;
  sourceCode?: string;
}): Promise<IRuntimeSnapshot> => {
  const session = await getLessonSession({ env, sandboxId });

  if (sourceCode) {
    await session.writeFile("/workspace/main.py", sourceCode);
  }

  const result = await session.exec(command, {
    cwd: DEFAULT_WORKSPACE_ROOT,
  });

  const latestSource = sourceCode
    ? sourceCode
    : (await session.readFile("/workspace/main.py")).content;

  return createWorkspaceSnapshot({
    command,
    sourceCode: latestSource,
    stderr: result.stderr,
    stdout: result.stdout,
  });
};
