# API Development Guide

## Scope

Run `apps/api` locally as the auth + lesson orchestration layer.

## Responsibilities

`apps/api` owns:

1. Better Auth routes
2. D1-backed auth/session state
3. lesson bootstrap and reset
4. `main.py` save/load endpoints
5. proxying lesson execution to `apps/runner-code-executor`

It does not own tutoring. That remains in `apps/agent-tutor-live`. It also does not execute Python directly anymore.

## Prerequisites

1. `pnpm install`
2. `apps/api/.dev.vars.example` copied to `apps/api/.dev.vars`
3. `apps/runner-code-executor` running locally or deployed

## Environment Setup

Create `apps/api/.dev.vars`:

```bash
BETTER_AUTH_SECRET=replace-me-with-a-long-random-secret
BETTER_AUTH_URL=http://localhost:8787
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:3000
BETTER_AUTH_ADMIN_TOKEN=replace-me-if-you-want-to-run-migrations
RUNNER_CODE_EXECUTOR_BASE_URL=http://127.0.0.1:8090
```

## Run

1. Full frontend+api loop: `pnpm dev`
2. API only: `pnpm --filter api dev`
3. Worker URL: `http://localhost:8787`

## Routes To Check

1. `GET /health`
2. `GET /api/session`
3. `POST /api/lesson/bootstrap`
4. `PUT /api/lesson/file/main.py`
5. `POST /api/lesson/run`
6. `POST /api/lesson/reset`
7. `GET|POST /api/auth/*`

## Quality Checks

1. `pnpm --filter api lint`
2. `pnpm --filter api test`
3. `pnpm --filter api build`
