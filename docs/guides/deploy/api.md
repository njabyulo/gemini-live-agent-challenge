# API Deployment Guide

## Scope

Deploy `apps/api` to the production Cloudflare Worker mounted at `gemini-live-agent.njabulomajozi.com/api/*`.

## Infra Source of Truth

- `infra/apps/api/wrangler.jsonc`
- `docs/guides/deploy/runtime-code-executor.md`

Current production worker:

- `gemini-live-agent-prod-wk-api-core-00`

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

Before deploying `apps/api`, make sure:

1. the production D1 database exists:
   - `gemini-live-agent-prod-d1-auth-core-00`
2. `apps/runner-code-executor` is deployed on Cloud Run
3. you know the runner base URL that the API should call
4. `apps/agent-tutor-live` has a shared secret chosen for live-session token verification

## Worker Secrets

Set the API secrets with Wrangler against the API config:

```bash
pnpm exec wrangler secret put BETTER_AUTH_URL --config infra/apps/api/wrangler.jsonc
pnpm exec wrangler secret put BETTER_AUTH_SECRET --config infra/apps/api/wrangler.jsonc
pnpm exec wrangler secret put BETTER_AUTH_TRUSTED_ORIGINS --config infra/apps/api/wrangler.jsonc
```

Optional:

```bash
pnpm exec wrangler secret put BETTER_AUTH_ADMIN_TOKEN --config infra/apps/api/wrangler.jsonc
```

Live tutor token secret:

```bash
pnpm exec wrangler secret put AGENT_TUTOR_LIVE_SHARED_SECRET --config infra/apps/api/wrangler.jsonc
```

Optional token TTL override:

```bash
pnpm exec wrangler secret put AGENT_TUTOR_LIVE_TOKEN_TTL_SECONDS --config infra/apps/api/wrangler.jsonc
```

Runner runtime URL:

```bash
pnpm exec wrangler secret put RUNNER_CODE_EXECUTOR_BASE_URL --config infra/apps/api/wrangler.jsonc
```

Expected values:

1. `BETTER_AUTH_URL`
   - production origin only
   - use `https://gemini-live-agent.njabulomajozi.com`
   - do not append `/api`
2. `BETTER_AUTH_SECRET`
   - long random secret used by Better Auth
3. `BETTER_AUTH_TRUSTED_ORIGINS`
   - allowed frontend origins, for example `https://gemini-live-agent.njabulomajozi.com`
   - if you add more origins later, pass a comma-separated list
4. `BETTER_AUTH_ADMIN_TOKEN`
   - only required if you use the admin migration/bootstrap route
5. `RUNNER_CODE_EXECUTOR_BASE_URL`
   - base URL for `apps/runner-code-executor`
   - recommended first value: the Cloud Run service URL
   - if the runner service returns `403`, make it publicly invokable first
6. `AGENT_TUTOR_LIVE_SHARED_SECRET`
   - shared signing secret used to mint short-lived live tutor WebSocket tokens
   - must exactly match the secret configured on `apps/agent-tutor-live`
7. `AGENT_TUTOR_LIVE_TOKEN_TTL_SECONDS`
   - optional override
   - default is `60`

Example production secret entry:

```bash
printf '%s' 'https://gemini-live-agent.njabulomajozi.com' | \
  pnpm exec wrangler secret put BETTER_AUTH_URL --config infra/apps/api/wrangler.jsonc

printf '%s' 'https://gemini-live-agent.njabulomajozi.com' | \
  pnpm exec wrangler secret put BETTER_AUTH_TRUSTED_ORIGINS --config infra/apps/api/wrangler.jsonc

printf '%s' 'https://<runner-cloud-run-url>' | \
  pnpm exec wrangler secret put RUNNER_CODE_EXECUTOR_BASE_URL --config infra/apps/api/wrangler.jsonc

printf '%s' '<shared-live-secret>' | \
  pnpm exec wrangler secret put AGENT_TUTOR_LIVE_SHARED_SECRET --config infra/apps/api/wrangler.jsonc
```

## Bindings

These are configured in `infra/apps/api/wrangler.jsonc`, not via `wrangler secret put`:

1. D1 database
   - binding: `DB`
   - production database: `gemini-live-agent-prod-d1-auth-core-00`

## Local Validation Before Deploy

```bash
pnpm --filter api lint
pnpm --filter api test
pnpm --filter api build
pnpm exec wrangler check --config infra/apps/api/wrangler.jsonc
pnpm exec wrangler deploy --dry-run --config infra/apps/api/wrangler.jsonc
```

## Deploy

### Production with Wrangler

```bash
pnpm exec wrangler deploy --config infra/apps/api/wrangler.jsonc
```

### Production with Existing Package Script

```bash
pnpm release:api
```

## Better Auth Migration

If this is a fresh production D1 database, run the Better Auth migration before judge sign-in:

1. ensure `BETTER_AUTH_ADMIN_TOKEN` is set for the deployed API Worker
2. call the migration route with that token

Example:

```bash
curl -X POST \
  https://gemini-live-agent.njabulomajozi.com/api/platform/migrations/better-auth \
  -H "x-admin-token: <BETTER_AUTH_ADMIN_TOKEN>"
```

## Post-Deploy Checks

1. Better Auth routes respond under `https://gemini-live-agent.njabulomajozi.com/api/auth/*`.
2. Login from `apps/web` succeeds against the production API.
3. `POST /api/live/token` returns `200` for authenticated users and `401` for anonymous requests.
4. `POST /api/lesson/bootstrap` creates a lesson workspace payload.
5. `POST /api/lesson/run` executes Python commands successfully.
6. If `POST /api/lesson/run` fails, verify that `RUNNER_CODE_EXECUTOR_BASE_URL` points at a healthy `apps/runner-code-executor` deployment.
7. If sign-in fails, re-check:
   - `BETTER_AUTH_URL`
   - `BETTER_AUTH_TRUSTED_ORIGINS`
   - Better Auth migration status in the D1 database
8. If the live tutor fails to authorize, re-check that `AGENT_TUTOR_LIVE_SHARED_SECRET` matches the value configured on `apps/agent-tutor-live`.
9. If `RUNNER_CODE_EXECUTOR_BASE_URL/health` returns `403`, add `roles/run.invoker` for `allUsers` on the runner Cloud Run service.
