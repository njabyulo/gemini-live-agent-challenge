# API Infra

Cloudflare Worker, D1, and Sandbox configuration for `apps/api` lives here.

## Purpose

- host the authenticated lesson API
- host Better Auth routes
- provide disposable lesson workspace bootstrap
- provide the terminal execution surface through Cloudflare Sandbox

## Files

- `wrangler.jsonc`
- `Dockerfile`

## Deploy

From repo root:

- Dev: `pnpm release:dev:api`
- Production: `pnpm release:api`
