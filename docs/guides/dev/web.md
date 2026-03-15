# Web Development Guide

## Scope

Run `apps/web` locally as the judge-facing frontend.

## Prerequisites

1. `pnpm install`
2. `apps/web/.dev.vars.example` copied to `apps/web/.dev.vars`

## Environment Setup

Create `apps/web/.dev.vars`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8787
NEXT_PUBLIC_AGENT_TUTOR_LIVE_WS_URL=ws://localhost:8080/live
```

Local prerequisite:

- `apps/api/.dev.vars` must include `AGENT_TUTOR_LIVE_SHARED_SECRET`
- `apps/agent-tutor-live/.env` must include the same `AGENT_TUTOR_LIVE_SHARED_SECRET`

## Run

1. Full local stack: `pnpm dev`
2. Web only: `pnpm --filter web dev`
3. App URL: `http://localhost:3000`

## What You Should See

At `/`:

1. The sign-in screen for the judge account
2. No sign-up path

At `/app` after login:

1. The workspace shell loads without runtime errors
2. Monaco editor with:
   - `main.py`
   - `README.md`
   - `test_main.py`
3. Bottom terminal area powered by `@xterm/xterm`
4. Right-side learning rail with `Lesson` and `Tutor`
 5. Header mic control available across the learning rail

## Local Verification

1. Login succeeds against `apps/api`
2. `/app` boots a fresh disposable workspace
3. Editing `main.py` updates the in-memory lesson state
4. Running `python3 main.py "Ada Lovelace"` shows real runtime output in the terminal
5. Loading a lesson provisions a fresh workspace again
6. Voice tutor can connect to `apps/agent-tutor-live`
7. Starting the tutor first requests `POST /api/live/token`, then opens the WebSocket with `?token=...`

## Quality Checks

1. `pnpm --filter web lint`
2. `pnpm --filter web test`
3. `pnpm --filter web build`
