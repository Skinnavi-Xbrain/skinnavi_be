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

# Generate Prisma Client
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

# Expose the application port (as requested)
EXPOSE 5000

# Start the application 
# Note: NestJS builds to dist/src/main.js by default
CMD ["node", "dist/src/main.js"]
