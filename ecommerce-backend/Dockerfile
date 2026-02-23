# ─────────────────────────────────────────────
# Production image for Node.js Backend
# ─────────────────────────────────────────────
FROM node:20-alpine AS production

# Create a non-root user early (security best practice)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy dependency manifests first (leverage Docker layer caching)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the rest of the application source
COPY . .

# Give ownership of the app files to the non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose the backend port
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
