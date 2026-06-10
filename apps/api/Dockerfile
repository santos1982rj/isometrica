FROM node:22-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm

# Layer 1: dependencies (cached unless package.json/lock changes)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/api/package.json ./apps/api/
COPY packages/*/package.json ./packages/
RUN pnpm install --frozen-lockfile

# Layer 2: source (cached unless source changes)
COPY apps/api/ ./apps/api/
COPY packages/ ./packages/

RUN pnpm build --filter @isometrica/api
RUN pnpm prune --prod

FROM node:22-alpine
WORKDIR /app
RUN npm install -g pnpm

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/prisma.config.ts ./apps/api/
COPY package.json pnpm-workspace.yaml ./

EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

CMD ["node", "apps/api/dist/main"]
