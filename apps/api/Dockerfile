# FashionDeck API Dockerfile
# Multi-stage build for production deployment

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Copy workspace package files
COPY apps/api/package*.json ./apps/api/
COPY packages/types/package*.json ./packages/types/
COPY packages/utils/package*.json ./packages/utils/

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root files
COPY package*.json ./
COPY turbo.json ./
COPY tsconfig.json ./

# Copy all workspace files
COPY apps/api ./apps/api
COPY packages ./packages

# Install all dependencies (including dev)
RUN npm ci

# Build shared packages first
RUN npm run build --filter=@fashiondeck/types
RUN npm run build --filter=@fashiondeck/utils

# Build API
RUN npm run build --filter=@fashiondeck/api

# ============================================
# Stage 3: Production
# ============================================
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copy dependencies from dependencies stage
COPY --from=dependencies --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=dependencies --chown=nestjs:nodejs /app/apps/api/node_modules ./apps/api/node_modules

# Copy built application from builder stage
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/packages/types/dist ./packages/types/dist
COPY --from=builder --chown=nestjs:nodejs /app/packages/utils/dist ./packages/utils/dist

# Copy package.json files
COPY --chown=nestjs:nodejs apps/api/package*.json ./apps/api/
COPY --chown=nestjs:nodejs packages/types/package*.json ./packages/types/
COPY --chown=nestjs:nodejs packages/utils/package*.json ./packages/utils/

# Create logs directory
RUN mkdir -p /app/logs && chown -R nestjs:nodejs /app/logs

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "apps/api/dist/main.js"]
