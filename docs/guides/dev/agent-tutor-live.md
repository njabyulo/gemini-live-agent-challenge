# Agent Tutor Live Development Guide

## Scope

Run `apps/agent-tutor-live` locally as the real Gemini Live tutor runtime.

## Responsibilities

`apps/agent-tutor-live` owns:

1. WebSocket/live session handling
2. live-session token verification during WebSocket upgrade
3. Gemini Live connection
4. lesson/runtime tool execution
5. tutor orchestration

It is not a proxy for `apps/api`.

## Prerequisites

1. `pnpm install`
2. `apps/agent-tutor-live/.env.example` copied to `apps/agent-tutor-live/.env`
3. Valid `GEMINI_API_KEY`
4. the same `AGENT_TUTOR_LIVE_SHARED_SECRET` that `apps/api` uses locally

## Environment Setup

Create `apps/agent-tutor-live/.env`:

```bash
GEMINI_API_KEY=your-key
AGENT_TUTOR_LIVE_SHARED_SECRET=shared-local-secret
PORT=8080
GEMINI_LIVE_MODEL=gemini-2.5-flash-native-audio-preview-12-2025
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_REGION=us-central1
```

## Run

1. Full stack including the live backend: `pnpm dev`
2. Direct package command: `pnpm --filter agent-tutor-live dev`
3. Health URL: `http://localhost:8080/health`
4. WebSocket URL: `ws://localhost:8080/live`
5. WebSocket requires a short-lived `token` query param minted by `apps/api`

## Local Verification

1. `GET /health` returns `200`
2. WebSocket upgrade on `/live` rejects requests without a valid token
3. WebSocket connects on `/live?token=...` when `apps/api` minted the token
4. `start` events seed the Python lesson/runtime context
5. `context` events update the tutor with new source code and stdout/stderr
6. Audio input and transcript events round-trip

## Quality Checks

1. `pnpm --filter agent-tutor-live lint`
2. `pnpm --filter agent-tutor-live test`
3. `pnpm --filter agent-tutor-live build`
