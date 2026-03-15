# Gemini Live Agent

`gemini-live-agent` is an AI-native Python learning workspace built for the Gemini Live Agent Challenge.

It combines:
- a browser code editor with Monaco
- a real terminal powered by xterm.js
- disposable Python lesson workspaces executed through an internal runner service
- a live Gemini tutor hosted on Google Cloud Run

The core product loop is:
1. open the lesson workspace
2. inspect or edit the starter code
3. run the program in the terminal
4. ask the tutor for help by voice or text
5. get a grounded response based on the lesson, code, runtime output, and workspace screenshot

## Apps

- `apps/web`
  - Next.js frontend
  - login at `/`
  - lesson workspace at `/app`
- `apps/api`
  - Hono API on Cloudflare Workers
  - Better Auth + D1
  - lesson bootstrap, runner-backed execution, and live-session token minting
- `apps/runner-code-executor`
  - internal Python execution backend
  - fresh temp workspace per run
  - Cloud Run deployment target
- `apps/agent-tutor-live`
  - live agent runtime on Google Cloud Run
  - Gemini Live integration through `@google/genai`
- `packages/shared`
  - shared lesson, live-session, and auth contracts
  - shared course constants and lookup helpers

## Current Scope

- Python-focused lessons
- disposable workspaces
- live tutor with voice, transcript, and multimodal grounding
- short-lived live WebSocket authorization issued by `apps/api`
- lesson-aware guidance tied to:
  - active lesson content
  - current source code
  - latest command
  - latest stdout/stderr
  - workspace screenshot captured at help time

## Local Development

1. Install dependencies:
   - `pnpm install`
2. Create local env files:
   - `apps/api/.dev.vars`
   - `apps/web/.dev.vars`
   - `apps/agent-tutor-live/.env`
   - `apps/runner-code-executor/.env`
3. Fill in the required secrets.
   - `apps/api` and `apps/agent-tutor-live` must share the same `AGENT_TUTOR_LIVE_SHARED_SECRET`
4. Start the full stack:
   - `pnpm dev`

This runs:
- `apps/web`
- `apps/api`
- `apps/agent-tutor-live`
- `apps/runner-code-executor`

## Common Commands

- `pnpm dev`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm release:web`
- `pnpm release:api`
- `pnpm release:agent-tutor-live`
- `pnpm release:runner-code-executor`

## Challenge Docs

Submission-facing docs live in `docs/challenge`.

- [Architecture diagram and runtime flow](docs/challenge/architechure.md)
- [Google challenge integrations](docs/challenge/google-integration.md)
- [Third-party integration disclosure](docs/challenge/3rd-party-integration.md)

These docs are intended to support the Gemini Live Agent Challenge submission directly.

## Additional Docs

- [Web development guide](docs/guides/dev/web.md)
- [API development guide](docs/guides/dev/api.md)
- [Agent tutor live development guide](docs/guides/dev/agent-tutor-live.md)
- [Runtime code executor development guide](docs/guides/dev/runtime-code-executor.md)
- [Web deployment guide](docs/guides/deploy/web.md)
- [API deployment guide](docs/guides/deploy/api.md)
- [Agent tutor live deployment guide](docs/guides/deploy/agent-tutor-live.md)
- [Runtime code executor deployment guide](docs/guides/deploy/runtime-code-executor.md)
