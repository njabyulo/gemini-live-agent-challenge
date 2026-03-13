# API Deployment Guide

## Scope

Deploy `apps/api` to Cloudflare Workers.

## Infra Source of Truth

- `infra/apps/api/wrangler.jsonc`
- `infra/apps/api/Dockerfile`

## Required Environment

Worker/runtime:

1. `BETTER_AUTH_URL`
2. `BETTER_AUTH_SECRET`
3. `BETTER_AUTH_TRUSTED_ORIGINS`
4. `BETTER_AUTH_ADMIN_TOKEN` if you want the migration endpoint

Cloudflare account:

1. `CLOUDFLARE_ACCOUNT_ID`
2. `CLOUDFLARE_API_TOKEN`
3. `CLOUDFLARE_ZONE_ID`

Bindings:

1. D1 database ID
2. Sandbox Durable Object + container config

## Local Validation Before Deploy

1. `pnpm --filter api lint`
2. `pnpm --filter api test`
3. `pnpm --filter api build`

## Deploy

### Dev

`pnpm release:dev:api`

### Production

`pnpm release:api`

## Post-Deploy Checks

1. `GET /health` returns `200`
2. Better Auth routes respond
3. Login works from `apps/web`
4. `POST /api/lesson/bootstrap` creates a sandbox-backed workspace
5. `POST /api/lesson/run` executes Python commands successfully
