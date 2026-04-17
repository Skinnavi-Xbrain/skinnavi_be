# Stage 1: Dependency Installation & Build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install openssl (Required for Prisma binary on Alpine)
RUN apk add --no-cache openssl

# Copy package.json and package-lock.json
COPY package*.json ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Generate Prisma Client (Required for TS build)
RUN npx prisma generate

# Build the NestJS application
RUN npm run build

# Stage 2: Production Image
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Set environment variable to run in production mode
ENV NODE_ENV=production

# Install openssl for Prisma in the runtime container
RUN apk add --no-cache openssl

# Copy package files to install production dependencies
COPY package*.json ./

# Install ONLY production dependencies (reduces image size and increases security)
RUN npm ci --omit=dev --ignore-scripts

# Copy Prisma schema and regenerate client for the production environment
COPY prisma ./prisma
RUN npx prisma generate

# Copy ONLY the built "dist" bundle from the builder stage
COPY --from=builder /app/dist ./dist

# Create start script
RUN echo "#!/bin/sh" > /app/start.sh && \
    echo "set -e" >> /app/start.sh && \
    echo "echo \"Running migrations...\"" >> /app/start.sh && \
    echo "npx prisma migrate deploy" >> /app/start.sh && \
    echo "echo \"Starting app...\"" >> /app/start.sh && \
    echo "node dist/src/main.js" >> /app/start.sh && \
    chmod +x /app/start.sh

# Expose the application port (as requested)
EXPOSE 5000

# Start the application 
CMD ["/app/start.sh"]
