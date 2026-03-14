# Agent Live Development Guide

## Scope

Run `apps/agent-live` locally as the real Gemini Live tutor runtime.

## Responsibilities

`apps/agent-live` owns:

1. WebSocket/live session handling
2. Gemini Live connection
3. lesson/runtime tool execution
4. tutor orchestration

It is not a proxy for `apps/api`.

## Prerequisites

1. `pnpm install`
2. `apps/agent-live/.env.example` copied to `apps/agent-live/.env`
3. Valid `GEMINI_API_KEY`

## Environment Setup

Create `apps/agent-live/.env`:

```bash
GEMINI_API_KEY=your-key
PORT=8080
GEMINI_LIVE_MODEL=gemini-2.5-flash-native-audio-preview-12-2025
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_REGION=us-central1
```

## Run

1. Full stack including the live backend: `pnpm dev`
2. Direct package command: `pnpm --filter agent-live dev`
3. Health URL: `http://localhost:8080/health`
4. WebSocket URL: `ws://localhost:8080/live`

## Local Verification

1. `GET /health` returns `200`
2. WebSocket connects on `/live`
3. `start` events seed the Python lesson/runtime context
4. `context` events update the tutor with new source code and stdout/stderr
5. Audio input and transcript events round-trip

## Quality Checks

1. `pnpm --filter agent-live lint`
2. `pnpm --filter agent-live test`
3. `pnpm --filter agent-live build`
