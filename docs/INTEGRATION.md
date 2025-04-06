# MCP Filesystem Integration Guide

This guide explains how to integrate the filesystem MCP tool with other MCP tools in your collection.

## Installation

### As an NPM Package
```bash
npm install @mcptools/filesystem
```

### As a Docker Container
```bash
docker pull wayazi/mcp-filesystem:latest
```

## Using with Other MCP Tools

### Tool Registration
The filesystem tool registers the following operations that can be used by other MCP tools:
- read_file
- write_file
- list_directory
- move_file
- search_files

### Example Integration

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FilesystemTools } from '@mcptools/filesystem';

// Create your MCP server
const server = new McpServer();

// Register filesystem tools
server.use(FilesystemTools({
  allowedDirs: ['/path/to/projects']
}));

// Register your other tools
server.use(YourOtherTools());

// Start the server
server.listen(3000);
```

### Security Considerations
- Always specify allowedDirs to restrict file access
- Consider using read-only mode for sensitive directories
- Implement proper authentication if needed

### Best Practices
1. Version Compatibility
   - Use compatible versions of MCP SDK
   - Check CHANGELOG.md for breaking changes

2. Error Handling
   - Handle filesystem operation errors in your tools
   - Provide meaningful error messages to users

3. Performance
   - Use batch operations when possible
   - Consider file size limits

## Development Integration

When developing new MCP tools that use filesystem operations:

1. Use the development Docker image:
   ```bash
   docker pull wayazi/mcp-filesystem:dev
   ```

2. Run tests with filesystem integration:
   ```bash
   npm test
   ```

3. Check the API documentation for all available operations

## Troubleshooting

Common integration issues and solutions:
1. Path Access Errors
   - Verify paths are within allowedDirs
   - Check file permissions

2. Docker Volume Mounting
   - Ensure correct volume mapping
   - Verify container permissions

3. Network Issues
   - Check port configuration
   - Verify service discovery setup

## Getting Help

- GitHub Issues: Report bugs and request features
- Documentation: Check the full API documentation
- Examples: See the test files for usage examples