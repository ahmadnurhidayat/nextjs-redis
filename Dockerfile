FROM node:20-alpine AS base
RUN apk add --no-cache openssl
ARG REDIS_OM_URL
ARG GITHUB_TOKEN

# Set environment variables
ENV REDIS_OM_URL=$REDIS_OM_URL
ENV GITHUB_TOKEN=$GITHUB_TOKEN

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production=false

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./ 
COPY --from=builder /app/.next/static ./.next/static

USER node
EXPOSE 3000
CMD ["node", "server.js"]