import {
  DEFAULT_LESSON_ID,
  DEFAULT_TERMINAL_SESSION_ID,
  getLessonDefinitionById,
} from "@agent-tutor/shared/consts";
import type {
  IRuntimeSnapshot,
  IWorkspaceFileRecord,
  IWorkspaceBootstrapResponse,
} from "@agent-tutor/shared/types";

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
  lessonId = DEFAULT_LESSON_ID,
): Promise<IWorkspaceBootstrapResponse> => {
  const lessonDefinition = getLessonDefinitionById(lessonId);
  if (!lessonDefinition) {
    throw new Error(`Unknown lesson: ${lessonId}`);
  }

  return {
    sandboxId: `lesson-${crypto.randomUUID().toLowerCase()}`,
    terminalSessionId: DEFAULT_TERMINAL_SESSION_ID,
    lesson: lessonDefinition.lesson,
    files: lessonDefinition.files,
    snapshot: createWorkspaceSnapshot({
      sourceCode: lessonDefinition.files[0]?.content ?? "",
    }),
  };
};

const getRunnerBaseUrl = (env: IApiEnv) => {
  const value = env.RUNNER_CODE_EXECUTOR_BASE_URL;
  if (value?.trim()) {
    return value.replace(/\/$/, "");
  }

  try {
    const authUrl = new URL(env.BETTER_AUTH_URL);
    if (
      authUrl.hostname === "localhost" ||
      authUrl.hostname === "127.0.0.1"
    ) {
      return "http://127.0.0.1:8090";
    }
  } catch {
    // Ignore malformed auth URL and fall through to explicit error.
  }

  throw new Error(
    "RUNNER_CODE_EXECUTOR_BASE_URL is required outside local development.",
  );
};

const tokenizeCommand = (input: string): string[] => {
  const tokens: string[] = [];
  let current = "";
  let quote: '"' | "'" | null = null;
  let escaped = false;

  for (const character of input) {
    if (escaped) {
      current += character;
      escaped = false;
      continue;
    }

    if (character === "\\") {
      escaped = true;
      continue;
    }

    if (quote) {
      if (character === quote) {
        quote = null;
      } else {
        current += character;
      }
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }

    if (/\s/u.test(character)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += character;
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
};

const buildWorkspaceFiles = ({
  lessonId,
  sourceCode,
}: {
  lessonId: string;
  sourceCode?: string;
}): IWorkspaceFileRecord[] => {
  const lessonDefinition = getLessonDefinitionById(lessonId);
  if (!lessonDefinition) {
    throw new Error(`Unknown lesson: ${lessonId}`);
  }

  return lessonDefinition.files.map((file) =>
    file.path === "/workspace/main.py" && typeof sourceCode === "string"
      ? {
          ...file,
          content: sourceCode,
        }
      : file,
  );
};

const executeWithRunner = async ({
  command,
  env,
  files,
}: {
  command: string;
  env: IApiEnv;
  files: IWorkspaceFileRecord[];
}) => {
  const response = await fetch(`${getRunnerBaseUrl(env)}/execute`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      command: tokenizeCommand(command),
      files: files.map((file) => ({
        content: file.content,
        path: file.path.replace(/^\/workspace\//, ""),
      })),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Runner request failed with status ${response.status}`);
  }

  return (await response.json()) as {
    durationMs: number;
    exitCode: number | null;
    stderr: string;
    stdout: string;
    timedOut: boolean;
  };
};

export const runLessonCommand = async ({
  command,
  env,
  lessonId,
  sourceCode,
}: {
  command: string;
  env: IApiEnv;
  lessonId: string;
  sourceCode?: string;
}): Promise<IRuntimeSnapshot> => {
  const files = buildWorkspaceFiles({ lessonId, sourceCode });
  const result = await executeWithRunner({
    command,
    env,
    files,
  });

  return createWorkspaceSnapshot({
    command,
    sourceCode:
      files.find((file) => file.path === "/workspace/main.py")?.content ?? "",
    stderr: result.stderr,
    stdout: result.timedOut
      ? `${result.stdout}\n[command timed out after ${result.durationMs}ms]`
      : result.stdout,
  });
};
