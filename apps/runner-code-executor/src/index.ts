import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { z } from "zod";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, normalize, resolve } from "node:path";
import { spawn } from "node:child_process";

const SRunnerFile = z.object({
  content: z.string(),
  path: z.string().min(1),
});

const SExecuteRequest = z.object({
  command: z.array(z.string().min(1)).min(1),
  files: z.array(SRunnerFile).min(1),
});

const PORT = Number(process.env.PORT ?? "8090");
const EXECUTION_TIMEOUT_MS = Number(
  process.env.RUNNER_EXECUTION_TIMEOUT_MS ?? "10000",
);
const MAX_STDIO_BYTES = Number(process.env.RUNNER_MAX_STDIO_BYTES ?? "65536");

const app = new Hono();

const getWorkspacePath = (workspaceRoot: string, filePath: string) => {
  const normalizedPath = normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, "");
  const absolutePath = resolve(workspaceRoot, normalizedPath);

  if (!absolutePath.startsWith(resolve(workspaceRoot))) {
    throw new Error(`Refusing to write outside workspace: ${filePath}`);
  }

  return absolutePath;
};

const isSupportedCommand = (command: string[]) => {
  if (command[0] !== "python3") {
    return false;
  }

  if (command[1] === "main.py") {
    return true;
  }

  return (
    command.length >= 4 &&
    command[1] === "-m" &&
    command[2] === "pytest" &&
    command[3] === "-q"
  );
};

const truncateOutput = (value: string) => {
  if (Buffer.byteLength(value, "utf8") <= MAX_STDIO_BYTES) {
    return value;
  }

  return `${value.slice(0, MAX_STDIO_BYTES)}\n[output truncated]`;
};

const executeCommand = async ({
  command,
  workspaceRoot,
}: {
  command: string[];
  workspaceRoot: string;
}) =>
  await new Promise<{
    durationMs: number;
    exitCode: number | null;
    stderr: string;
    stdout: string;
    timedOut: boolean;
  }>((resolvePromise, rejectPromise) => {
    const startedAt = Date.now();
    const child = spawn(command[0], command.slice(1), {
      cwd: workspaceRoot,
      env: {
        HOME: workspaceRoot,
        PATH: process.env.PATH,
        PYTHONDONTWRITEBYTECODE: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let settled = false;
    let timedOut = false;

    const finish = (result: {
      exitCode: number | null;
      stderr: string;
      stdout: string;
      timedOut: boolean;
    }) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeoutId);
      resolvePromise({
        durationMs: Date.now() - startedAt,
        ...result,
      });
    };

    const timeoutId = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, EXECUTION_TIMEOUT_MS);

    child.stdout.on("data", (chunk) => {
      stdout = truncateOutput(`${stdout}${chunk.toString()}`);
    });

    child.stderr.on("data", (chunk) => {
      stderr = truncateOutput(`${stderr}${chunk.toString()}`);
    });

    child.on("error", (error) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeoutId);
      rejectPromise(error);
    });

    child.on("close", (exitCode) => {
      finish({
        exitCode,
        stderr,
        stdout,
        timedOut,
      });
    });
  });

app.get("/health", (c) =>
  c.json({
    ok: true,
    service: "runner-code-executor",
  }),
);

app.post("/execute", async (c) => {
  const payload = SExecuteRequest.parse(await c.req.json());

  if (!isSupportedCommand(payload.command)) {
    return c.json(
      {
        error:
          "Unsupported command. Only python3 main.py ... and python3 -m pytest -q are allowed.",
      },
      400,
    );
  }

  const workspaceRoot = await mkdtemp(join(tmpdir(), "agent-tutor-run-"));

  try {
    for (const file of payload.files) {
      const absolutePath = getWorkspacePath(workspaceRoot, file.path);
      await mkdir(dirname(absolutePath), { recursive: true });
      await writeFile(absolutePath, file.content, "utf8");
    }

    const result = await executeCommand({
      command: payload.command,
      workspaceRoot,
    });

    return c.json(result);
  } finally {
    await rm(workspaceRoot, { force: true, recursive: true });
  }
});

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`[runner-code-executor] listening on http://127.0.0.1:${info.port}`);
  },
);
