# Development Guides

## Scope

Run the hackathon stack locally.

## Guides

- `api.md`
- `web.md`
- `agent-live.md`

## Local Split

1. `pnpm dev` runs `apps/api`, `apps/web`, and `apps/agent-live`.
2. The coding workspace is intentionally disposable:
   - a fresh sandbox is created on `/app`
   - reload resets the lesson workspace

## Env Files

- `apps/api/.dev.vars.example`
- `apps/web/.dev.vars.example`
- `apps/agent-live/.env.example`
- root `/.env.example` is only the aggregate reference
