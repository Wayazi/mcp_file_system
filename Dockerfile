FROM node:20-alpine

# Create non-root user
RUN addgroup -S mcp && adduser -S mcp -G mcp

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript code
RUN npm run build && \
    # Clean up development dependencies
    npm prune --production && \
    # Set correct permissions
    chown -R mcp:mcp /app

# Create and set permissions for projects directory
RUN mkdir /projects && chown mcp:mcp /projects

# Switch to non-root user
USER mcp

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "const http=require('http');const options={hostname:'localhost',port:3000,path:'/health',method:'GET'};const req=http.request(options,res=>{process.exit(res.statusCode===200?0:1)});req.on('error',()=>process.exit(1));req.end()"

# Command to run the server
ENTRYPOINT ["node", "dist/index.js"]

# Arguments will be the allowed directories, which must be mounted to /projects
CMD ["/projects"]