# Google Integration

This page is written for Gemini Live Agent Challenge judges.

Google services are not an optional add-on in `gemini-live-agent`. They are part of the core product and the category fit.

## What To Verify

- Gemini Live is the tutor model/runtime
- The Google GenAI SDK is used in the live tutor backend
- The live tutor backend is hosted on Google Cloud Run
- The code-execution backend is also hosted on Google Cloud Run

## Google Services Used

### Gemini Live / Google GenAI SDK

Used for the live tutor in `apps/agent-tutor-live`.

It powers:
- real-time voice input
- transcript output
- audio output
- multimodal reasoning over:
  - lesson context
  - runtime context
  - workspace screenshots

Repo evidence:
- `apps/agent-tutor-live/package.json`
- `apps/agent-tutor-live/src/index.ts`
- `apps/agent-tutor-live/src/workflows/createLiveTutorSession.ts`

### Google Cloud Run

Used to host:

- `apps/agent-tutor-live`
- `apps/runner-code-executor`

This covers both the live tutor backend required for the Live Agents category and the internal code-execution backend.

Repo evidence:
- `infra/apps/agent-tutor-live/cloudrun.yaml`
- `infra/apps/runner-code-executor/cloudrun.yaml`
- `docs/guides/deploy/agent-tutor-live.md`
- `docs/guides/deploy/runtime-code-executor.md`

## How Google Services Show Up In The User Experience

When the learner asks for help:
1. the browser asks `apps/api` for a short-lived live-session token
2. the browser sends lesson context, runtime context, and a workspace screenshot over the live WebSocket
3. `apps/agent-tutor-live` verifies the token and receives the turn
4. `apps/agent-tutor-live` sends that grounded turn to Gemini Live
5. Gemini Live returns tutor audio and transcript output
6. the learner hears and sees the tutor response in the app

This means the Google stack is directly visible in the product:
- not just in infrastructure
- not just in a background integration
- but in the actual tutoring loop

## Summary

> `gemini-live-agent` uses Gemini Live through the Google GenAI SDK to power a real-time coding tutor that can hear the learner, speak back, and reason over lesson context, runtime output, and a screenshot of the visible workspace. Google Cloud Run hosts both the `apps/agent-tutor-live` backend and the internal code-execution runner used by the lesson workspace.

## Code Pointers

- Live tutor entrypoint:
  - `apps/agent-tutor-live/src/index.ts`
- Gemini session creation:
  - `apps/agent-tutor-live/src/workflows/createLiveTutorSession.ts`
- Cloud Run deploy surface:
  - `infra/apps/agent-tutor-live/cloudrun.yaml`
  - `infra/apps/runner-code-executor/cloudrun.yaml`
