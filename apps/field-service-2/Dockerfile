FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

FROM base AS builder
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/field-service-2/package.json ./apps/field-service-2/
RUN pnpm install --frozen-lockfile
COPY packages/shared ./packages/shared
COPY apps/field-service-2 ./apps/field-service-2
COPY tsconfig.base.json ./
RUN pnpm install
RUN pnpm --filter @gajayana/shared build
ARG DATABASE_URL_FIELD
ENV DATABASE_URL_FIELD=${DATABASE_URL_FIELD}
RUN pnpm --filter @gajayana/field-service-2 exec prisma generate
RUN pnpm --filter @gajayana/field-service-2 build
RUN pnpm --filter @gajayana/field-service-2 deploy /app/deploy --legacy

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/deploy/node_modules ./node_modules
COPY --from=builder /app/apps/field-service-2/dist ./dist
COPY --from=builder /app/apps/field-service-2/package.json ./package.json
COPY --from=builder /app/apps/field-service-2/prisma ./prisma
RUN pnpm dlx prisma generate
ENV NODE_ENV=production
EXPOSE 3006
CMD ["node", "dist/index.js"]
