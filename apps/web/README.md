# Web App

`apps/web` is the learner-facing Next.js app for `gemini-live-agent`.

## Responsibilities

- render the sign-in screen at `/`
- render the lesson workspace at `/app`
- host Monaco, xterm.js, and the learning rail UI
- capture workspace screenshots for multimodal tutor grounding
- connect to `apps/api` for auth and lesson runtime routes
- request short-lived live-session tokens from `apps/api`
- connect to `apps/agent-tutor-live` for live tutor sessions

## Local Run

From the repo root:

- full stack: `pnpm dev`
- web only: `pnpm --filter web dev`

Default local URL:

- `http://localhost:3000`

## Runtime Config

Browser-facing runtime values:

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_AGENT_TUTOR_LIVE_WS_URL`

For local development these usually point to:

- `http://localhost:8787`
- `ws://localhost:8080/live`

The browser does not connect to the live tutor anonymously.
`apps/web` first requests `POST /api/live/token`, then opens:

- `ws://localhost:8080/live?token=<short-lived-token>`

## Verification

At `http://localhost:3000`:

1. sign in successfully
2. reach `/app`
3. switch lesson and tutor tabs
4. run a Python command and see terminal output
5. start a live tutor session
6. confirm the browser first calls `/api/live/token` before opening the tutor WebSocket
