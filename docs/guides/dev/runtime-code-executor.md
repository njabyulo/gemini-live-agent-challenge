# Runtime Code Executor Development Guide

## Scope

Run `apps/runner-code-executor` locally as the internal Python execution backend.

## Responsibilities

`apps/runner-code-executor` owns:

1. creating a fresh temp workspace per request
2. writing lesson files into that workspace
3. executing allowed Python commands
4. returning stdout, stderr, exit code, and timing
5. cleaning up the workspace after execution

It does not own auth, lesson selection, or browser-facing routes. Those remain in `apps/api`.

## Prerequisites

1. `pnpm install`
2. Python 3 available on the local machine as `python3`
3. `apps/runner-code-executor/.env.example` copied to `apps/runner-code-executor/.env` if you want local overrides

## Environment Setup

Create `apps/runner-code-executor/.env` if needed:

```bash
PORT=8090
RUNNER_EXECUTION_TIMEOUT_MS=10000
RUNNER_MAX_STDIO_BYTES=65536
```

## Run

1. Full stack including the runner: `pnpm dev`
2. Runner only: `pnpm --filter runner-code-executor dev`
3. Health URL: `http://127.0.0.1:8090/health`

## Local Verification

1. `GET /health` returns `200`
2. `POST /execute` runs `python3 main.py ...`
3. `POST /execute` rejects unsupported commands
4. stdout/stderr are returned as JSON

## Quality Checks

1. `pnpm --filter runner-code-executor lint`
2. `pnpm --filter runner-code-executor test`
3. `pnpm --filter runner-code-executor build`
