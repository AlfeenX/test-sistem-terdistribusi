FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

FROM base AS builder
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/booking-service/package.json ./apps/booking-service/
RUN pnpm install --frozen-lockfile
COPY packages/shared ./packages/shared
COPY apps/booking-service ./apps/booking-service
COPY tsconfig.base.json ./
RUN pnpm install
RUN pnpm --filter @gajayana/shared build
ARG DATABASE_URL_BOOKING
ENV DATABASE_URL_BOOKING=${DATABASE_URL_BOOKING}
RUN pnpm --filter @gajayana/booking-service exec prisma generate
RUN pnpm --filter @gajayana/booking-service build
RUN pnpm --filter @gajayana/booking-service deploy /app/deploy --legacy

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/deploy/node_modules ./node_modules
COPY --from=builder /app/deploy/dist ./dist
COPY --from=builder /app/deploy/package.json ./package.json
COPY --from=builder /app/apps/booking-service/prisma ./prisma
RUN pnpm dlx prisma generate
ENV NODE_ENV=production
EXPOSE 3003
CMD ["node", "dist/index.js"]
