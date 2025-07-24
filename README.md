# MCP File System

A comprehensive Model Context Protocol (MCP) server that provides secure filesystem operations through a standardized interface.

## Features

### Core File Operations
- **File operations**: read, write, copy, delete
- **Directory management**: create, list, delete (with recursive option)
- **File movement and renaming**: move files and directories
- **File metadata retrieval**: get detailed file/directory information
- **File search capabilities**: pattern-based search with exclusion filters

### Security & Safety
- **Access control** through allowed directories - no operations outside specified paths
- **Path validation** to prevent directory traversal attacks
- **File type restrictions** for enhanced security
- **File size limits** to prevent resource exhaustion
- **Audit logging** for all file operations

### Performance & Reliability
- **Input validation** with comprehensive error handling
- **Atomic operations** where possible
- **Resource limits** and safeguards

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Run the server with allowed directories:**
   ```bash
   npm start /path/to/allowed/directory [/path/to/another/directory ...]
   ```

## Usage Examples

### Basic File Operations

```bash
# Start server with project directory access
node dist/index.js /home/user/projects

# Example MCP client calls:
```

```typescript
// Read a file
const content = await client.callTool('read_file', {
  path: '/home/user/projects/README.md'
});

// Write a file
await client.callTool('write_file', {
  path: '/home/user/projects/config.json',
  content: JSON.stringify({ key: 'value' }, null, 2)
});

// Copy a file
await client.callTool('copy_file', {
  source: '/home/user/projects/template.txt',
  destination: '/home/user/projects/new-file.txt'
});

// Delete a file
await client.callTool('delete_file', {
  path: '/home/user/projects/old-file.txt'
});
```

### Directory Operations

```typescript
// Create a directory
await client.callTool('create_directory', {
  path: '/home/user/projects/new-folder'
});

// List directory contents
const listing = await client.callTool('list_directory', {
  path: '/home/user/projects'
});

// Delete empty directory
await client.callTool('delete_directory', {
  path: '/home/user/projects/empty-folder'
});

// Delete directory recursively (be careful!)
await client.callTool('delete_directory', {
  path: '/home/user/projects/folder-with-contents',
  recursive: true
});
```

### Advanced Operations

```typescript
// Search for files
const results = await client.callTool('search_files', {
  path: '/home/user/projects',
  pattern: '.js',
  excludePatterns: ['node_modules', 'dist']
});

// Get file information
const info = await client.callTool('get_file_info', {
  path: '/home/user/projects/package.json'
});

// Move/rename files
await client.callTool('move_file', {
  source: '/home/user/projects/old-name.txt',
  destination: '/home/user/projects/new-name.txt'
});
```

## Available Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `read_file` | Read file contents | `path: string` |
| `write_file` | Write content to file | `path: string, content: string` |
| `copy_file` | Copy a file | `source: string, destination: string` |
| `delete_file` | Delete a file | `path: string` |
| `create_directory` | Create directory | `path: string` |
| `list_directory` | List directory contents | `path: string` |
| `delete_directory` | Delete directory | `path: string, recursive?: boolean` |
| `move_file` | Move/rename file or directory | `source: string, destination: string` |
| `search_files` | Search for files by pattern | `path: string, pattern: string, excludePatterns?: string[]` |
| `get_file_info` | Get file/directory metadata | `path: string` |
| `list_allowed_directories` | List allowed directories | none |
| `read_multiple_files` | Read multiple files at once | `paths: string[]` |

## Configuration

The server can be configured by modifying the `CONFIG` object in `src/index.ts`:

```typescript
const CONFIG = {
    maxFileSize: 10 * 1024 * 1024, // 10MB max file size
    maxDirectoryDepth: 10, // Maximum depth for recursive operations
    allowedFileTypes: new Set(['.txt', '.md', '.json', '.js', '.ts', '.html', '.css', '.py']),
    auditLog: true, // Enable audit logging
};
```

## Development

### Running Tests
```bash
npm test
```

### Code Quality
```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### Development Server
```bash
npm run dev  # Watch mode for TypeScript compilation
```

## Docker Deployment

### Using Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  mcp-filesystem:
    build: .
    volumes:
      - ./projects:/projects
    environment:
      - NODE_ENV=production
```

```bash
# Run with docker-compose
PROJECTS_DIR=/path/to/your/projects docker-compose up
```

### Direct Docker Usage
```bash
# Build container
npm run docker:build

# Run container
docker run -v /path/to/projects:/projects mcptools/filesystem
```

## Security Considerations

1. **Directory Access**: Only directories specified at startup are accessible
2. **Path Validation**: All paths are validated to prevent directory traversal
3. **File Type Restrictions**: Configurable whitelist of allowed file extensions
4. **Resource Limits**: File size limits prevent resource exhaustion
5. **Audit Logging**: All operations are logged for security monitoring
6. **Non-root User**: Docker container runs as non-root user

## Error Handling

The server provides detailed error messages for common issues:

- **Access Denied**: Path outside allowed directories
- **File Not Found**: Requested file doesn't exist
- **Permission Denied**: Insufficient file system permissions
- **File Too Large**: File exceeds size limits
- **Invalid File Type**: File extension not in allowed list

## Documentation

- [Complete API Documentation](docs/API.md) - Detailed API reference
- [Server Implementation Details](docs/server-implementation-fix.md) - Technical implementation notes
- [Contributing Guidelines](CONTRIBUTING.md) - How to contribute to the project

## License

ISC
