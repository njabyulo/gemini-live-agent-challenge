# Web Deployment Guide

## Scope

Deploy `apps/web` to Cloudflare.

## Prerequisites

1. `pnpm install`
2. Cloudflare auth configured for `wrangler`
3. Required env vars configured for the frontend deploy
4. `apps/agent-live` deployed and reachable from the public frontend

## Infra Source of Truth

- Worker config: `infra/apps/web/wrangler.jsonc`
- Build/deploy scripts:
  - `pnpm release:dev:web`
  - `pnpm release:web`

## Domain Routing

- Public demo domain: `gemini-live.njabulomajozi.com`

## Required Environment Variables

Frontend env:

1. `NEXT_PUBLIC_AGENT_LIVE_WS_URL`

Cloudflare auth env when running deploys locally or in CI:

1. `CLOUDFLARE_ACCOUNT_ID`
2. `CLOUDFLARE_API_TOKEN`
3. `CLOUDFLARE_ZONE_ID`

## Local Validation Before Deploy

1. `pnpm --filter web lint`
2. `pnpm --filter web test`
3. `pnpm --filter web build`

## Deploy

### Dev

1. `pnpm release:dev:web`

### Production

1. `pnpm release:web`

## Post-Deploy Checks

1. `https://gemini-live.njabulomajozi.com` renders successfully.
2. The landing page shows the Monaco-based workspace with:
   - top lesson objective
   - left explorer
   - center editor
   - bottom terminal panel
   - right live mentor rail
3. Frontend can attempt a WebSocket connection to the deployed `apps/agent-live`.
4. `Run tests` transitions between:
   - `Hard fail`
   - `Almost there`
   - `Ready to submit`
5. Transcript, screenshot share, and voice controls behave normally in production.

## Rollback

1. Re-deploy the previous known-good frontend version through Cloudflare.
2. Re-check `NEXT_PUBLIC_AGENT_LIVE_WS_URL` and route configuration if the page loads but cannot reach the live backend.
