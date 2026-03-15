# Web Deployment Guide

## Scope

Deploy `apps/web` to the production Cloudflare Worker on `gemini-live-agent.njabulomajozi.com`.

## Infra Source of Truth

- `infra/apps/web/wrangler.jsonc`
- `apps/web/open-next.config.ts`

Current production worker:

- `gemini-live-agent-prod-wk-web-core-00`

## Cloudflare Auth

Authenticate Wrangler before deploying:

```bash
pnpm exec wrangler whoami
```

Required shell environment:

1. `CLOUDFLARE_ACCOUNT_ID`
2. `CLOUDFLARE_API_TOKEN`
3. `CLOUDFLARE_ZONE_ID`

## Dependencies

Before deploying `apps/web`, make sure these are already live:

1. `apps/api`
   - mounted at `https://gemini-live-agent.njabulomajozi.com/api/*`
   - configured with `AGENT_TUTOR_LIVE_SHARED_SECRET`
2. `apps/agent-tutor-live`
   - reachable at its Cloud Run `run.app` WebSocket URL
   - configured with the same `AGENT_TUTOR_LIVE_SHARED_SECRET`

## Runtime Config

The web app does not require hidden runtime secrets by default. Its browser-facing config should be set as normal Wrangler `vars`, not `wrangler secret put`, because these values are intentionally exposed to the client bundle.

Required public runtime values:

1. `NEXT_PUBLIC_API_BASE_URL`
2. `NEXT_PUBLIC_AGENT_TUTOR_LIVE_WS_URL`

Example `vars` block for `infra/apps/web/wrangler.jsonc`:

```jsonc
{
  "vars": {
    "NEXT_PUBLIC_API_BASE_URL": "https://gemini-live-agent.njabulomajozi.com",
    "NEXT_PUBLIC_AGENT_TUTOR_LIVE_WS_URL": "wss://<agent-tutor-live-service>.a.run.app/live"
  }
}
```

If you change `vars`, deploy the worker again for the change to take effect.

Connection model:

1. the browser calls `POST /api/live/token`
2. `apps/api` returns a short-lived signed token
3. `apps/web` opens `wss://<agent-tutor-live-service>.a.run.app/live?token=<...>`
4. `apps/agent-tutor-live` verifies the token before accepting the socket

Current source of truth:

- `infra/apps/web/wrangler.jsonc`

If you prefer setting the value through Wrangler rather than editing the file by hand, update the config first, then deploy.

## Local Validation Before Deploy

```bash
pnpm --filter web lint
pnpm --filter web test
pnpm --filter web build
pnpm exec opennextjs-cloudflare build --config infra/apps/web/wrangler.jsonc
pnpm exec wrangler check --config infra/apps/web/wrangler.jsonc
pnpm exec wrangler deploy --dry-run --config infra/apps/web/wrangler.jsonc
```

## Deploy

### Production with Wrangler

```bash
pnpm exec wrangler deploy --config infra/apps/web/wrangler.jsonc
```

### Production with Existing Package Script

```bash
pnpm release:web
```

## Post-Deploy Checks

1. `https://gemini-live-agent.njabulomajozi.com` renders the login screen.
2. Login moves the user into `/app`.
3. The frontend can reach:
   - `https://gemini-live-agent.njabulomajozi.com/api/*`
   - the configured `agent-tutor-live` WebSocket URL
4. starting the tutor first calls `POST /api/live/token`
5. `/app` renders the editor, terminal, and learning rail without runtime configuration errors.
6. If the live tutor WebSocket fails with `403`, add `roles/run.invoker` for `allUsers` on the `agent-tutor-live` Cloud Run service.
