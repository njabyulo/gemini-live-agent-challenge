import {
  DEFAULT_TERMINAL_SESSION_ID,
  DEFAULT_WORKSPACE_ROOT,
} from "@agent-tutor/shared/consts";
import type {
  ILessonContext,
  IRuntimeSnapshot,
  IWorkspaceBootstrapResponse,
  IWorkspaceFileRecord,
} from "@agent-tutor/shared/types";
import { getSandbox } from "@cloudflare/sandbox";

import type { IApiEnv } from "../../../utils/env";

export const LESSON_WORKSPACE_ROUTES = {
  bootstrap: "/api/lesson/bootstrap",
  file: "/api/lesson/file/main.py",
  reset: "/api/lesson/reset",
  run: "/api/lesson/run",
  runtime: "/api/lesson/runtime",
  terminal: "/api/lesson/terminal",
} as const;

export const LESSON_CONTEXT: ILessonContext = {
  courseId: "python-foundations",
  courseTitle: "Python Foundations",
  lessonId: "echo-cli-input",
  lessonTitle: "Echo command-line input",
  objective:
    "Read one CLI argument and print it back exactly as the learner typed it.",
  task: 'Fix main.py so python3 main.py "Ada Lovelace" prints Ada Lovelace exactly, without changing the casing or dropping spaces.',
  expectedOutcome:
    "The learner understands sys.argv, off-by-one argument access, and why not to transform input that should be echoed as-is.",
  focusFilePath: "/workspace/main.py",
  workspaceFiles: [
    "/workspace/main.py",
    "/workspace/README.md",
    "/workspace/test_main.py",
  ],
  commandSuggestions: [
    'python3 main.py "Ada Lovelace"',
    "python3 -m pytest -q",
  ],
};

export const STARTER_FILES: IWorkspaceFileRecord[] = [
  {
    path: "/workspace/main.py",
    isEditable: true,
    content: `import sys


def main() -> None:
    if len(sys.argv) < 2:
        print("Please provide input")
        return

    # Bug: the lesson expects the original input, not uppercase text.
    print(sys.argv[1].upper())


if __name__ == "__main__":
    main()
`,
  },
  {
    path: "/workspace/README.md",
    isEditable: false,
    content: `# Lesson: Echo command-line input

Objective:
- Read the first user-provided CLI argument.
- Print it exactly as typed.

Try:
- python3 main.py "Ada Lovelace"
- python3 -m pytest -q
`,
  },
  {
    path: "/workspace/test_main.py",
    isEditable: false,
    content: `from subprocess import run


def test_echoes_argument_exactly():
    completed = run(
        ["python3", "main.py", "Ada Lovelace"],
        capture_output=True,
        text=True,
        check=False,
    )
    assert completed.stdout.strip() == "Ada Lovelace"
`,
  },
];

export const createWorkspaceSnapshot = (
  partial?: Partial<IRuntimeSnapshot>,
): IRuntimeSnapshot => ({
  sourceCode: partial?.sourceCode ?? STARTER_FILES[0]?.content ?? "",
  command: partial?.command ?? "",
  stdout: partial?.stdout ?? "",
  stderr: partial?.stderr ?? "",
});

export const bootstrapLessonWorkspace = async (
  env: IApiEnv,
): Promise<IWorkspaceBootstrapResponse> => {
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

  for (const file of STARTER_FILES) {
    await session.writeFile(file.path, file.content);
  }

  return {
    sandboxId,
    terminalSessionId: session.id,
    lesson: LESSON_CONTEXT,
    files: STARTER_FILES,
    snapshot: createWorkspaceSnapshot(),
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
