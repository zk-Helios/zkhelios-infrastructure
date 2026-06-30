# Multi-stage build for the zkHelios API (pnpm monorepo).
# Build context must be the repo root: `docker build -f apps/api/Dockerfile .`
FROM node:20-slim AS base
RUN corepack enable && apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /repo

FROM base AS build
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY packages ./packages
COPY apps/api ./apps/api
RUN pnpm install --frozen-lockfile
# Generate the Prisma client + build the API.
RUN pnpm --filter @zkhelios/db exec prisma generate
RUN pnpm --filter @zkhelios/api build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /repo /repo
WORKDIR /repo/apps/api
EXPOSE 4000
# Run pending migrations, then start.
CMD ["sh", "-c", "pnpm --filter @zkhelios/db exec prisma migrate deploy && node dist/index.js"]
