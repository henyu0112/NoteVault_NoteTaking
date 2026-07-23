# ── Stage 1: Build the Vue app ─────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source and build
COPY . .

# VITE_API_URL is injected at build time via --build-arg
ARG VITE_API_URL=http://localhost:3001/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Stage 2: Serve with Nginx ──────────────────────────────────────────────────
FROM nginx:stable-alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom Nginx config to handle Vue Router (SPA fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
