# Web Development Guide

## Scope

Run and iterate on `apps/web` locally with a Cloudflare-targeted deployment path.

## Prerequisites

1. `pnpm install`
2. `apps/agent-live` available locally if you want real live-session verification
3. `apps/web/.dev.vars.example` copied to `apps/web/.dev.vars`

## Environment Setup

Create `apps/web/.dev.vars`:

1. `NEXT_PUBLIC_AGENT_LIVE_WS_URL`

Example:

```bash
NEXT_PUBLIC_AGENT_LIVE_WS_URL=ws://127.0.0.1:8080/live
```

## Run

1. Full stack from repo root: `pnpm dev`
2. Web only: `pnpm --filter web dev`
3. Default URL: `http://127.0.0.1:3000`

## What the page should show

1. Monaco-based lesson workspace
2. Compact file explorer
3. Deterministic test output
4. Mentor transcript panel
5. Voice controls:
   - `Talk to mentor`
   - `Start mic`
   - `Stop mic`
   - `Interrupt`
6. Screenshot sharing action

## Quality Checks

1. `pnpm --filter web lint`
2. `pnpm --filter web test`
3. `pnpm --filter web build`

## Local Verification

1. `/` renders the full demo workspace.
2. `Talk to mentor` attempts a WebSocket connection to `apps/agent-live`.
3. `Run tests` evaluates the current `ContinueButton.tsx` content and resolves one of the deterministic demo states:
   - `Hard fail`
   - `Almost there`
   - `Ready to submit`
4. Transcript UI updates cleanly when server events arrive.
5. The workspace should include:
   - top lesson objective
   - left explorer
   - center Monaco editor
   - bottom terminal panel
   - right live mentor rail
6. `Reset demo` returns the page to the initial state.

## Notes

1. `apps/web` is intentionally a focused demo surface, not the full Garrii product shell.
2. The workspace is mocked on purpose; the live-agent loop is the judged experience.
3. Feature code lives under `src/features/live-mentor`.
4. Monaco is loaded client-side only; do not move the editor into a server-rendered path.
