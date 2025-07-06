# Multi-stage Dockerfile for Next.js app with Prisma using Red Hat UBI

# Stage 1: Base image with Node.js
FROM registry.access.redhat.com/ubi9/nodejs-20:latest AS base
USER 0

# Install necessary packages
RUN dnf update -y && \
    dnf install -y ca-certificates && \
    dnf clean all

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Generate Prisma client
RUN npx prisma generate --no-engine

# Stage 2: Build stage
FROM registry.access.redhat.com/ubi9/nodejs-20:latest AS builder
USER 0

# Install development tools
RUN dnf update -y && \
    dnf install -y ca-certificates python3 make gcc-c++ && \
    dnf clean all

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for build)
RUN npm ci --ignore-scripts

# Generate Prisma client
RUN npx prisma generate --no-engine

# Copy source code
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV ESLINT_NO_DEV_ERRORS=true

# Build the application
RUN npm run build

# Stage 3: Runtime stage
FROM registry.access.redhat.com/ubi9/nodejs-20-minimal:latest AS runtime
USER 0

# Install runtime dependencies (curl-minimal is already included in the base image)
RUN microdnf update -y && \
    microdnf install -y ca-certificates && \
    microdnf clean all

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy production dependencies from base stage
COPY --from=base /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Copy other necessary files
COPY next.config.ts ./
COPY tsconfig.json ./

# Set ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["npm", "start"]
