#!/bin/bash
# Simple health check script for Docker container
# Checks if the MCP server binary and dependencies are available

# Check if the built server exists and is executable
if [ ! -f "dist/index.js" ]; then
    echo "Health check failed: Server binary not found at dist/index.js"
    exit 1
fi

# Try to require the main server module to ensure dependencies are working
node -e "
try {
    // Test that we can require the main modules
    require('fs');
    require('path');
    require('@modelcontextprotocol/sdk/server/mcp.js');
    require('zod');
    console.log('Health check passed: All dependencies available');
    process.exit(0);
} catch (e) {
    console.error('Health check failed:', e.message);
    process.exit(1);
}
"