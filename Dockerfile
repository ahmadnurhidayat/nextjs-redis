FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ARG REDIS_OM_URL
ARG GITHUB_TOKEN
RUN corepack enable && apk add --no-cache openssl

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

RUN pnpm prune --prod --config.ignore-scripts=true

FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules

RUN addgroup -S nextjs && adduser -S nextjs -G nextjs && \
    chown -R nextjs:nextjs /app
USER nextjs

EXPOSE 3000
CMD ["pnpm", "start"]