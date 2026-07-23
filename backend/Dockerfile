FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copy source files
COPY . .

# Create the database directory
RUN mkdir -p db

# Expose the API port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/ || exit 1

# Start the server
CMD ["node", "server.js"]
