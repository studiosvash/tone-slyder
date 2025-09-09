# Backend Dockerfile
FROM node:20-alpine AS base
WORKDIR /app

# Install deps separately for better caching
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --only=production && mv node_modules /prod_node_modules

# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY backend/package.json backend/package-lock.json tsconfig.json ./
RUN npm ci
COPY backend ./backend
RUN npm run --prefix backend build

# Runtime image
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Copy production deps and built app
COPY --from=base /prod_node_modules ./backend/node_modules
COPY --from=build /app/backend/dist ./backend/dist
COPY backend/package.json ./backend/package.json

EXPOSE 8080
CMD ["node", "backend/dist/index.js"]

