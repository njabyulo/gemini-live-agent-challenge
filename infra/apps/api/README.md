# API Infra

Cloudflare Worker and D1 configuration for `apps/api` lives here.

## Purpose

- host the authenticated lesson API
- host Better Auth routes
- provide disposable lesson workspace bootstrap
- proxy lesson execution to `apps/runner-code-executor`

## Files

- `wrangler.jsonc`

## Deploy

From repo root:

- Dev: `pnpm release:dev:api`
- Production: `pnpm release:api`
