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

Runner runtime URL:

```bash
pnpm exec wrangler secret put RUNNER_CODE_EXECUTOR_BASE_URL --config infra/apps/api/wrangler.jsonc
```

Expected values:

1. `BETTER_AUTH_URL`
   - production origin, for example `https://gemini-live-agent.njabulomajozi.com`
2. `BETTER_AUTH_SECRET`
   - long random secret used by Better Auth
3. `BETTER_AUTH_TRUSTED_ORIGINS`
   - allowed frontend origins, for example `https://gemini-live-agent.njabulomajozi.com`
4. `BETTER_AUTH_ADMIN_TOKEN`
   - only required if you use the admin migration/bootstrap route
5. `RUNNER_CODE_EXECUTOR_BASE_URL`
   - internal runner base URL, for example a Cloud Run service URL for `apps/runner-code-executor`

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

## Post-Deploy Checks

1. Better Auth routes respond under `https://gemini-live-agent.njabulomajozi.com/api/auth/*`.
2. Login from `apps/web` succeeds against the production API.
3. `POST /api/lesson/bootstrap` creates a lesson workspace payload.
4. `POST /api/lesson/run` executes Python commands successfully.
5. If `POST /api/lesson/run` fails, verify that `RUNNER_CODE_EXECUTOR_BASE_URL` points at a healthy `apps/runner-code-executor` deployment.
