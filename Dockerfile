FROM node:20-slim

# Create non-root user
RUN groupadd -r mcp && useradd -r -g mcp mcp

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies needed for build)
RUN npm ci

# Copy source code and health check script
COPY tsconfig.json ./
COPY src ./src
COPY healthcheck.sh ./

# Build TypeScript code
RUN npm run build

# Clean up development dependencies, set permissions, and make health check executable
RUN npm prune --production && \
    chmod +x /app/healthcheck.sh && \
    chown -R mcp:mcp /app

# Create and set permissions for projects directory
RUN mkdir /projects && chown mcp:mcp /projects

# Switch to non-root user
USER mcp

# Health check - verify the server binary can run and dependencies are available
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD /app/healthcheck.sh

# Command to run the server
ENTRYPOINT ["node", "dist/index.js"]

# Arguments will be the allowed directories, which must be mounted to /projects
CMD ["/projects"]