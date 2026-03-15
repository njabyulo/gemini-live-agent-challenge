FROM node:22-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python3-pip python-is-python3 \
  && python3 -m pip install --no-cache-dir pytest \
  && rm -rf /var/lib/apt/lists/*

COPY apps/runner-code-executor/package.json ./package.json

RUN corepack enable && pnpm install --frozen-lockfile=false

COPY apps/runner-code-executor/tsconfig.json ./tsconfig.json
COPY apps/runner-code-executor/src ./src

RUN pnpm exec tsup src/index.ts --format esm --dts --out-dir dist --clean

ENV PORT=8080

EXPOSE 8080

CMD ["node", "dist/index.js"]
