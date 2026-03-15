# Runtime Code Executor Deployment Guide

## Scope

Deploy `apps/runner-code-executor` to Google Cloud Run as the internal Python execution backend.

## Infra Source of Truth

- `infra/apps/runner-code-executor/cloudrun.yaml`
- `infra/apps/runner-code-executor/Dockerfile`

Current production service:

- `gemini-live-agent-prod-run-runner-backend-00`

## Required Environment

1. `GOOGLE_CLOUD_PROJECT`
2. `GOOGLE_CLOUD_REGION`
3. `PORT`
4. `RUNNER_EXECUTION_TIMEOUT_MS`
5. `RUNNER_MAX_STDIO_BYTES`

## Local Validation Before Deploy

```bash
pnpm --filter runner-code-executor lint
pnpm --filter runner-code-executor test
pnpm --filter runner-code-executor build
```

## Deploy

### Dev

```bash
pnpm release:dev:runner-code-executor
```

### Production

```bash
pnpm release:runner-code-executor
```

## Post-Deploy Checks

1. `GET /health` returns `200`
2. `POST /execute` runs `python3 main.py ...` successfully
3. `POST /execute` returns stdout/stderr JSON
4. `apps/api` can reach the deployed runner URL configured in `RUNNER_CODE_EXECUTOR_BASE_URL`
