# Agent Tutor

Hackathon-native live coding mentor built with Gemini Live, `@google/genai`, Cloud Run, and a focused mock workspace UI.

## Architecture

- `apps/web`: public demo frontend, intended for Cloudflare hosting
- `apps/agent-live`: the real live-agent runtime on Google Cloud Run
- `packages/shared`: shared consts, types, and helpers
- `infra/apps/web`: Cloudflare deployment config
- `infra/apps/agent-live`: Cloud Run deployment config

## Local Development

1. Copy `.env.example` to `.env`.
2. Set `GEMINI_API_KEY`.
3. Run `pnpm install`.
4. Run `pnpm dev`.

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
- `apps/web` is designed to be hosted on Cloudflare for a stable public demo URL.
