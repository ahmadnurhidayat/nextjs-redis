# Base Image
FROM node:20-alpine AS base

# Environment setup
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ARG REDIS_OM_URL
ARG GITHUB_TOKEN

# Install core dependencies
RUN corepack enable && apk add --no-cache openssl

# Dependencies Stage
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Builder Stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . . 
RUN pnpm build

# Production Stage
FROM base AS production-stage
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules

# Use non-root user
USER nextjs

# Expose port and start the app
EXPOSE 3000
CMD ["pnpm", "start"]