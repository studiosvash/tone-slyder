# Frontend Dockerfile
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Build stage
FROM base AS build
COPY frontend ./
COPY shared ../shared
RUN npm run build

# Production stage with nginx
FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
