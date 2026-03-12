# Agent Tutor

Hackathon-native live coding mentor built for the Gemini Live Agent Challenge.

The project proves one loop:

- the learner stays inside a focused coding workspace
- asks for help out loud
- gets one grounded spoken hint from Gemini Live
- reruns tests and sees visible progress
- lands on a short readiness summary

## Demo Shape

The demo UI is a minimal, Codespaces-inspired lesson workspace:

- top: lesson objective and live session state
- left: compact explorer with 2-4 files
- center: Monaco editor with one active file
- bottom: terminal and test output area
- right: live mentor panel with transcript and controls

The workspace is intentionally deterministic. The judged experience is the live mentor loop, not a hosted IDE platform.

## Architecture

- `apps/web`: public frontend, intended for Cloudflare hosting
- `apps/agent-live`: the real live-agent runtime on Google Cloud Run
- `packages/shared`: shared consts, message contracts, and helpers
- `infra/apps/web`: Cloudflare deployment config
- `infra/apps/agent-live`: Cloud Run deployment config

## Stack

- `pnpm`
- `turbo`
- `Next.js`
- `Monaco Editor`
- `zustand`
- `@google/genai`
- Gemini Live API
- WebSocket transport
- Cloud Run
- Cloudflare

## Local Development

1. Copy `apps/agent-live/.env.example` to `apps/agent-live/.env`.
2. Copy `apps/web/.dev.vars.example` to `apps/web/.dev.vars` if you want explicit frontend env setup.
3. Set `GEMINI_API_KEY` in `apps/agent-live/.env`.
4. Run `pnpm install`.
5. Run `pnpm dev`.

## Scripts

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm test`
- `pnpm release:dev:web`
- `pnpm release:dev:api`

## Submission Notes

- Gemini is used through `@google/genai`.
- The live agent itself runs in `apps/agent-live` on Cloud Run.
- `apps/web` is designed to be hosted on Cloudflare at `gemini-live.njabulomajozi.com`.
- The frontend and backend hosting split is intentional and explicit.
