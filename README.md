# Agent Tutor

Hackathon-native Python learning workspace built for the Gemini Live Agent Challenge.

## Product Loop

1. Judge lands on `gemini-live.njabulomajozi.com`
2. Logs in with a pre-created account
3. Enters `/app`
4. Edits `main.py` in Monaco
5. Runs a real Python command in the terminal
6. Asks the tutor for help by voice
7. Gets one grounded spoken hint tied to current code and runtime output

## Architecture

- `apps/web`
  - Next.js frontend
  - Cloudflare-hosted
  - login screen at `/`
  - coding workspace at `/app`
- `apps/api`
  - Hono on Cloudflare Workers
  - Better Auth + D1
  - Cloudflare Sandbox-backed lesson execution
- `apps/agent-live`
  - real Gemini Live runtime
  - `@google/genai`
  - Google Cloud Run
- `packages/shared`
  - shared contracts and constants

## Current Hackathon Scope

- Python only
- one disposable lesson workspace
- no persistence across reloads
- real command execution
- live voice tutoring grounded on:
  - current `main.py`
  - last command
  - latest stdout/stderr

## Local Development

1. `pnpm install`
2. Copy:
   - `apps/api/.dev.vars.example` -> `apps/api/.dev.vars`
   - `apps/web/.dev.vars.example` -> `apps/web/.dev.vars`
   - `apps/agent-live/.env.example` -> `apps/agent-live/.env`
3. Fill in the required secrets
4. Run:
   - `pnpm dev`

## Main Scripts

- `pnpm dev`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm release:web`
- `pnpm release:api`
- `pnpm release:agent-live`
